import { StudentModel, SwapModel, ResourceModel, FlagModel, nexusConnector } from '@edusync/db';
import { KarmaService } from '../karma/service.js';
import { LeaderboardService } from '../leaderboard/service.js';
import { NotificationService } from '../notifications/service.js';
import { SwapService } from '../swap/service.js';

export class StudentDetailService {
  /**
   * Aggregates student data from multiple sources with CAMPUS ISOLATION.
   * Every method MUST verify the student belongs to the requesting admin's campus.
   */
  static async getStudentProfile(targetUid: string, adminCampus: string) {
    // 1. Campus Isolation Check (Mandatory)
    const student = await StudentModel.findOne({ 
      firebaseUid: targetUid, 
      campus: adminCampus 
    }).lean();
    
    // Return 404 if not found on this campus to prevent data leakage
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    // 2. Parallel Fetch (Option B)
    const [
      swaps,
      resources,
      flags,
      karmaHistory,
      adminActions,
      karmaBalance
    ] = await Promise.all([
      SwapModel.find({ $or: [{ requesterUid: targetUid }, { providerUid: targetUid }] }).sort({ createdAt: -1 }).limit(10).lean(),
      ResourceModel.find({ uploaderUid: targetUid }).sort({ createdAt: -1 }).limit(10).lean(),
      FlagModel.find({ flaggedUid: targetUid }).sort({ createdAt: -1 }).limit(10).lean(),
      KarmaService.getHistory(targetUid),
      nexusConnector.pg.query(
        'SELECT * FROM admin_actions WHERE target_entity_id = $1 AND target_entity_type = $2 ORDER BY created_at DESC LIMIT 10',
        [targetUid, 'student']
      ),
      KarmaService.getBalance(targetUid)
    ]);

    const karmaRank = await LeaderboardService.getMyRank(targetUid);

    return {
      profile: student,
      karma: {
        balance: karmaBalance,
        rank: karmaRank.rank,
        tier: karmaRank.tier,
        history: karmaHistory
      },
      swaps: {
        total: swaps.length,
        completed: swaps.filter(s => s.status === 'completed').length,
        recent: swaps,
        completionRate: swaps.length > 0 
          ? Math.round((swaps.filter(s => s.status === 'completed').length / swaps.length) * 100) 
          : 100
      },
      resources: {
        total: resources.length,
        certified: resources.filter(r => r.status === 'certified').length,
        recent: resources
      },
      moderation: {
        currentStatus: student.moderation?.status || 'good_standing',
        suspendedUntil: student.moderation?.suspendedUntil || null,
        totalFlags: student.moderation?.flags || 0,
        recentFlags: flags,
        priorAdminActions: adminActions.rows
      },
      nexus: {
        crossCampusEnabled: student.nexus?.crossCampusEnabled || false,
        nexusCredits: student.nexus?.nexusCredits || 0
      }
    };
  }

  /**
   * Updates moderation status with mandatory side effects and audit logging.
   */
  static async updateModerationStatus(
    targetUid: string, 
    adminUid: string, 
    adminCampus: string, 
    action: 'warn' | 'suspend' | 'ban' | 'reinstate',
    options: { reason: string; durationDays?: number }
  ) {
    // 1. Campus Isolation (Mandatory)
    const student = await StudentModel.findOne({ firebaseUid: targetUid, campus: adminCampus });
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    // 2. Self-action Prevention
    if (targetUid === adminUid) throw new Error('CANNOT_MODERATE_SELF');

    let status = student.moderation?.status || 'good_standing';
    const updateFields: any = {};
    let notificationType: any;

    switch (action) {
      case 'warn':
        status = 'warning';
        notificationType = 'account_warned';
        break;
      case 'suspend':
        if (!options.durationDays) throw new Error('SUSPENSION_DURATION_REQUIRED');
        status = 'suspended';
        // Side Effect: Cancel all active/pending swaps + refund escrow
        await this.cancelActiveSwaps(targetUid, adminUid, 'student_suspended');
        updateFields['moderation.suspendedUntil'] = new Date(Date.now() + options.durationDays * 86400000);
        notificationType = 'account_suspended';
        break;
      case 'ban':
        status = 'banned';
        // Side Effect: Cancel active swaps + refund + revoke Nexus access
        await this.cancelActiveSwaps(targetUid, adminUid, 'student_banned');
        updateFields['nexus.crossCampusEnabled'] = false;
        notificationType = 'account_banned';
        break;
      case 'reinstate':
        if (student.moderation?.status === 'good_standing') throw new Error('ALREADY_IN_GOOD_STANDING');
        status = 'good_standing';
        updateFields['moderation.suspendedUntil'] = null;
        notificationType = 'account_reinstated';
        break;
    }

    // Apply the status update
    await StudentModel.findOneAndUpdate(
      { firebaseUid: targetUid },
      { $set: { 'moderation.status': status, ...updateFields } }
    );

    // 3. Mandatory Audit Logging mapping
    const actionTypeMap: Record<string, string> = {
      warn: 'student_warned',
      suspend: 'student_suspended',
      ban: 'student_banned',
      reinstate: 'student_reinstated'
    };

    await nexusConnector.pg.query(
      'INSERT INTO admin_actions (admin_uid, admin_campus, action_type, target_entity_type, target_entity_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminUid, adminCampus, actionTypeMap[action], 'student', targetUid, options.reason]
    );

    // 4. Notification Hub triggering
    await NotificationService.create(targetUid, notificationType, {
      reason: options.reason,
      until: updateFields['moderation.suspendedUntil']
    });

    return { success: true, status, suspendedUntil: updateFields['moderation.suspendedUntil'] };
  }

  /**
   * Clears numerical risk flags but maintains permanent audit trail.
   */
  static async clearStudentRecord(targetUid: string, adminUid: string, adminCampus: string, reason: string) {
    // 1. Campus Isolation
    const student = await StudentModel.findOne({ firebaseUid: targetUid, campus: adminCampus });
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    await StudentModel.findOneAndUpdate(
      { firebaseUid: targetUid },
      { $set: { 'moderation.flags': 0 } }
    );

    // 2. Audit Logging
    await nexusConnector.pg.query(
      'INSERT INTO admin_actions (admin_uid, admin_campus, action_type, target_entity_type, target_entity_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminUid, adminCampus, 'record_cleared', 'student', targetUid, reason]
    );

    return { success: true };
  }

  static async getStudentSwapHistory(uid: string, adminCampus: string, limit = 20, cursor?: string) {
    const student = await StudentModel.findOne({ firebaseUid: uid, campus: adminCampus });
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    const query: any = { $or: [{ requesterUid: uid }, { providerUid: uid }] };
    if (cursor) query._id = { $lt: cursor };

    return SwapModel.find(query).sort({ _id: -1 }).limit(limit).lean();
  }

  static async getStudentFlagHistory(uid: string, adminCampus: string, limit = 20, cursor?: string) {
    const student = await StudentModel.findOne({ firebaseUid: uid, campus: adminCampus });
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    const query: any = { flaggedUid: uid };
    if (cursor) query._id = { $lt: cursor };

    return FlagModel.find(query).sort({ _id: -1 }).limit(limit).lean();
  }

  /**
   * Helper to cancel active swaps and refund escrow via SwapService.
   */
  private static async cancelActiveSwaps(targetUid: string, adminUid: string, reasonPrefix: string) {
    const activeSwaps = await SwapModel.find({
      $or: [{ requesterUid: targetUid }, { providerUid: targetUid }],
      status: { $in: ['pending', 'accepted'] }
    });

    for (const swap of activeSwaps) {
      // adminOverrideSwap handles both status change and escrow refund
      await SwapService.adminOverrideSwap(
        swap._id.toString(), 
        'force_refund', 
        adminUid, 
        `${reasonPrefix}: Administrative moderation action triggered auto-cancellation.`
      );
    }
  }
}
