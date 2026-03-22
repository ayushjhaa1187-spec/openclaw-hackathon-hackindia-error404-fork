import { FlagModel, StudentModel, SwapModel, ResourceModel, nexusConnector } from '@edusync/db';
import { SwapService } from '../swap/service.js';
import { NotificationService } from '../notifications/service.js';
import { getIO } from '../../socket.js';

export type ResolutionAction = 
  | 'no_action' 
  | 'warning_issued' 
  | 'content_removed' 
  | 'swap_terminated' 
  | 'student_suspended' 
  | 'student_banned';

export class GuardianService {
  /**
   * Fetch a prioritized queue of flags for a specific campus.
   */
  static async getFlagQueue(campus: string, status: string = 'pending', limit: number = 50) {
    return FlagModel.find({ campus, status })
      .sort({ severity: 1, createdAt: -1 }) // Severity sort (Critical > High...) needs numerical mapping or manual sort
      .limit(limit);
  }

  /**
   * Get full details for a flag, including involved entities.
   */
  static async getFlagDetails(flagId: string) {
    const flag = await FlagModel.findById(flagId);
    if (!flag) throw new Error('Flag not found');

    const involvement: any = {};
    if (flag.sourceEntityType === 'swap_room') {
      involvement.swap = await SwapModel.findById(flag.sourceEntityId);
    } else if (flag.sourceEntityType === 'resource') {
      involvement.resource = await ResourceModel.findById(flag.sourceEntityId);
    }

    involvement.students = await StudentModel.find({
       firebaseUid: { $in: flag.involvedUids } 
    }).select('name email campus rankTier moderation');

    return { flag, involvement };
  }

  /**
   * Resolve a pending flag with specific administrative actions.
   */
  static async resolveFlag(flagId: string, action: ResolutionAction, adminUid: string, notes: string) {
    const flag = await FlagModel.findById(flagId);
    if (!flag) throw new Error('Flag not found');
    if (flag.status !== 'pending' && flag.resolvedAt && (Date.now() - flag.resolvedAt.getTime() > 300000)) {
        throw new Error('Resolution window (5 mins) has closed for this flag.');
    }

    const targetUid = flag.involvedUids[0]; // Primary offender
    const campus = flag.campus;

    // --- Execute Resolution Actions ---
    switch (action) {
      case 'warning_issued':
        await StudentModel.findOneAndUpdate(
          { firebaseUid: targetUid },
          { $set: { 'moderation.status': 'warning', 'moderation.lastReviewedBy': adminUid } }
        );
        await NotificationService.create(targetUid, 'guardian_warning', {
          title: 'Institutional Safety Warning',
          body: 'An administrative review of your activities has resulted in a formal warning. Please adhere to the Nexus community guidelines.',
          relatedEntityId: flag.sourceEntityId,
          relatedEntityType: flag.sourceEntityType === 'resource' ? 'resource' : 'swap'
        });
        break;

      case 'content_removed':
        if (flag.sourceEntityType === 'resource') {
          await ResourceModel.findByIdAndUpdate(flag.sourceEntityId, {
            'verification.status': 'rejected',
            'adminNotes': `REMOVED BY GUARDIAN: ${notes}`
          });
        }
        // Chat content removal is logical (flagged messages marked via flag.status)
        break;

      case 'swap_terminated':
        if (flag.sourceEntityType === 'swap_room' || (flag as any).swapId) {
          const swapId = flag.sourceEntityId;
          await SwapService.adminOverrideSwap(swapId, 'force_refund', adminUid, `Guardian Resolution: ${notes}`);
        }
        break;

      case 'student_suspended':
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + 7);
        
        await StudentModel.findOneAndUpdate(
          { firebaseUid: targetUid },
          { $set: { 
              'moderation.status': 'suspended', 
              'moderation.suspendedUntil': suspendedUntil,
              'moderation.lastReviewedBy': adminUid 
          } }
        );

        // Cancel all active swaps for this student
        const activeSwaps = await SwapModel.find({
          $or: [{ requesterUid: targetUid }, { providerUid: targetUid }],
          status: { $in: ['pending', 'accepted', 'active'] }
        });

        for (const swap of activeSwaps) {
          await SwapService.adminOverrideSwap(swap._id.toString(), 'force_refund', adminUid, 'Participant suspended for safety violations.');
        }
        break;

      case 'student_banned':
        await StudentModel.findOneAndUpdate(
          { firebaseUid: targetUid },
          { $set: { 
              'moderation.status': 'banned',
              'nexus.crossCampusEnabled': false,
              'moderation.lastReviewedBy': adminUid 
          } }
        );
        
        const allSwaps = await SwapModel.find({
          $or: [{ requesterUid: targetUid }, { providerUid: targetUid }],
          status: { $in: ['pending', 'accepted', 'active'] }
        });

        for (const swap of allSwaps) {
          await SwapService.adminOverrideSwap(swap._id.toString(), 'force_refund', adminUid, 'Participant banned for severe policy violations.');
        }
        break;

      case 'no_action':
      default:
        // Flag is just dismissed
        break;
    }

    // --- Persist Resolution ---
    flag.status = action === 'no_action' ? 'dismissed' : 'actioned';
    flag.resolvedBy = adminUid;
    flag.resolvedAt = new Date();
    flag.resolutionNotes = notes;
    flag.resolutionAction = action;
    await flag.save();

    // --- Audit Log (PostgreSQL) ---
    const client = await nexusConnector.pg.connect();
    try {
      await client.query(
        `INSERT INTO admin_actions (admin_uid, action_type, target_entity_id, reason) 
         VALUES ($1, $2, $3, $4)`,
        [adminUid, `FLAG_RESOLVED_${action.toUpperCase()}`, flag.sourceEntityId, notes]
      );
    } finally {
      client.release();
    }

    // --- Real-time Sync ---
    getIO().to(`admin:${campus}`).emit('guardian:flag_resolved', {
       flagId: flag._id,
       action,
       status: flag.status
    });

    return flag;
  }

  /**
   * Undo a resolution within the 5-minute window.
   */
  static async undoResolution(flagId: string, adminUid: string) {
    const flag = await FlagModel.findById(flagId);
    if (!flag || !flag.resolvedAt) throw new Error('Flag not resolved');
    
    const diff = Date.now() - flag.resolvedAt.getTime();
    if (diff > 300000) throw new Error('Undo window expired (5 minutes)');

    flag.status = 'pending';
    flag.resolvedBy = null;
    flag.resolvedAt = null;
    flag.resolutionAction = null;
    await flag.save();

    getIO().to(`admin:${flag.campus}`).emit('guardian:flag_resolved', {
      flagId: flag._id,
      status: 'pending'
    });

    return flag;
  }

  /**
   * Fetch moderation statistics for institutional dashboards.
   */
  static async getModerationStats(campus: string) {
    const totalFlags = await FlagModel.countDocuments({ campus });
    const pendingFlags = await FlagModel.countDocuments({ campus, status: 'pending' });
    const flaggedUsers = await StudentModel.countDocuments({ campus, 'moderation.flags': { $gt: 0 } });
    
    // Last 24h
    const dayAgo = new Date(Date.now() - 86400000);
    const flagsToday = await FlagModel.countDocuments({ campus, createdAt: { $gte: dayAgo } });

    return {
      totalFlags,
      pendingFlags,
      flaggedUsers,
      flagsToday
    };
  }
}
