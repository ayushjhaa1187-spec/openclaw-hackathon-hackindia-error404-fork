import { SwapModel, nexusConnector } from '@edusync/db';
import { KarmaService } from '../karma/service.js';
import { NotificationService } from '../notifications/service.js';
import { getIO } from '../../socket.js';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsService } from '../analytics/service.js';

export class SwapService {
  /**
   * Propose a new skill swap
   * Deducts karmaStaked into KARMA_ESCROW immediately.
   */
  static async proposeSwap(input: {
    requesterUid: string;
    providerUid: string;
    skill: string;
    karmaStaked: number;
    isCrossCampus: boolean;
    requesterCampus: string;
    providerCampus: string;
  }) {
    if (!Number.isFinite(input.karmaStaked) || input.karmaStaked < 10) {
      throw new Error('Invalid karma amount. Minimum karma stake is 10');
    }

    const balance = await KarmaService.getBalance(input.requesterUid);
    if (balance < input.karmaStaked) throw new Error('Insufficient karma for this stake');

    // 1. Create Swap in MongoDB
    const swap = await SwapModel.create({
      ...input,
      status: 'pending'
    });

    // 2. Escrow Karma
    await KarmaService.recordTransaction({
      fromUid: input.requesterUid,
      toUid: 'KARMA_ESCROW',
      amount: input.karmaStaked,
      reason: `Swap Escrow: ${swap._id}`,
      institutionalNode: input.requesterCampus
    });

    // 3. Log to Transparency Log if cross-campus
    if (input.isCrossCampus) {
      await this.logTransparency(swap._id.toString(), {
        requester_id: input.requesterUid,
        responder_id: input.providerUid,
        requester_campus_id: input.requesterCampus,
        responder_campus_id: input.providerCampus,
        action: 'swap_requested'
      });
    }

    // 4. Notifications
    await NotificationService.create(input.providerUid, 'swap_request_received', {
      name: 'A user', // Placeholder for now, or I can refine. 
      skill: input.skill,
      swapId: swap._id
    });

    getIO().to(`user:${input.providerUid}`).emit('swap:new_request', {
      swapId: swap._id,
      requesterUid: input.requesterUid,
      skill: input.skill
    });
    
    // Invalidate analytics (initiated swaps)
    await AnalyticsService.invalidateCache(input.requesterCampus);
    if (input.isCrossCampus) await AnalyticsService.invalidateCache(input.providerCampus);

    return swap;
  }

  /**
   * Accept a pending swap
   */
  static async acceptSwap(swapId: string, providerUid: string) {
    const swap = await SwapModel.findById(swapId);
    if (!swap) throw new Error('Swap not found');
    if (swap.providerUid !== providerUid) throw new Error('Unauthorized');
    if (swap.status !== 'pending') throw new Error('Swap is no longer pending');

    swap.status = 'accepted';
    await swap.save();

    if (swap.isCrossCampus) {
      await this.logTransparency(swapId, {
        requester_id: swap.requesterUid,
        responder_id: swap.providerUid,
        requester_campus_id: (swap as any).requesterCampus,
        responder_campus_id: (swap as any).providerCampus,
        action: 'swap_accepted'
      });
    }

    await NotificationService.create(swap.requesterUid, 'swap_accepted', {
      name: 'The provider', 
      swapId
    });

    getIO().to(`user:${swap.requesterUid}`).emit('swap:accepted', { swapId });
    return swap;
  }

  /**
   * Reject a pending swap
   * Refunds escrow back to requester.
   */
  static async rejectSwap(swapId: string, providerUid: string) {
    const updatedSwap = await SwapModel.findOneAndUpdate(
      {
        _id: swapId,
        providerUid,
        status: 'pending'
      },
      {
        $set: {
          status: 'canceled',
          rejectedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedSwap) {
      throw new Error('Swap not in pending status or unauthorized');
    }

    const swap = updatedSwap;

    // Refund Escrow
    await KarmaService.recordTransaction({
      fromUid: 'KARMA_ESCROW',
      toUid: swap.requesterUid,
      amount: swap.karmaStaked,
      reason: `Swap Refund (Rejected): ${swapId}`,
      institutionalNode: (swap as any).requesterCampus
    });

    await NotificationService.create(swap.requesterUid, 'swap_rejected', {
      name: 'The provider',
      swapId
    });

    await AnalyticsService.invalidateCache((swap as any).requesterCampus);

    getIO().to(`user:${swap.requesterUid}`).emit('swap:rejected', { swapId });
    return swap;
  }

  /**
   * Complete a swap session
   * Transfers escrowed karma to responder.
   */
  static async completeSwap(swapId: string, callerUid: string) {
    const swap = await SwapModel.findOneAndUpdate(
      { 
        _id: swapId, 
        status: 'accepted',
        $or: [{ requesterUid: callerUid }, { providerUid: callerUid }]
      },
      { $set: { status: 'completed' } },
      { new: true }
    );

    if (!swap) throw new Error('Swap not found, already completed, or unauthorized');

    // Release Escrow to Provider
    await KarmaService.recordTransaction({
      fromUid: 'KARMA_ESCROW',
      toUid: swap.providerUid,
      amount: swap.karmaStaked,
      reason: `Swap Completion: ${swapId}`,
      institutionalNode: (swap as any).providerCampus
    });

    if (swap.isCrossCampus) {
      await this.logTransparency(swapId, {
        requester_id: swap.requesterUid,
        responder_id: swap.providerUid,
        requester_campus_id: (swap as any).requesterCampus,
        responder_campus_id: (swap as any).providerCampus,
        action: 'swap_completed'
      });
    }

    await NotificationService.create(swap.requesterUid, 'swap_completed', { name: 'The provider', swapId });
    await NotificationService.create(swap.providerUid, 'swap_completed', { name: 'The requester', swapId });

    getIO().to(`user:${swap.requesterUid}`).emit('swap:completed', { swapId });
    getIO().to(`user:${swap.providerUid}`).emit('swap:completed', { swapId });
    
    await AnalyticsService.invalidateCache((swap as any).providerCampus);
    if (swap.isCrossCampus) await AnalyticsService.invalidateCache((swap as any).requesterCampus);

    return swap;
  }

  /**
   * cancelSwap (in-progress cancellation) deferred to Session 4.
   * Handles accepted swaps that are abandoned.
   */

  /**
   * Atomic cancellation request handling.
   */
  static async requestCancel(swapId: string, callerUid: string) {
    // 1. Atomic conditional update to set cancelRequestedBy
    const swap = await SwapModel.findOneAndUpdate(
      {
        _id: swapId,
        cancelRequestedBy: { $exists: false }, // only if not yet set
        status: 'accepted'
      },
      { $set: { cancelRequestedBy: callerUid } },
      { new: true }
    );

    if (swap) {
      // First person requesting
      const otherPeer = swap.requesterUid === callerUid ? swap.providerUid : swap.requesterUid;
      
      await NotificationService.create(otherPeer, 'swap_cancel_requested', { name: 'Your peer', swapId });
      
      getIO().to(`user:${otherPeer}`).emit('swap:cancel_requested', { swapId, requestedBy: callerUid });
      return swap;
    }

    // 2. If swap was NOT updated, either it's already mutual, doesn't exist, or wrong status
    const current = await SwapModel.findById(swapId);
    if (!current) throw new Error('Swap not found');
    if (current.status !== 'accepted') throw new Error('Invalid status for cancellation');

    if (current.cancelRequestedBy && current.cancelRequestedBy !== callerUid) {
      // MUTUAL CONSENT REACHED
      current.status = 'canceled';
      await current.save();

      // Refund requester from Escrow
      await KarmaService.recordTransaction({
        fromUid: 'KARMA_ESCROW',
        toUid: current.requesterUid,
        amount: current.karmaStaked,
        reason: `Mutual Cancellation: ${swapId}`,
        institutionalNode: (current as any).requesterCampus
      });

      if (current.isCrossCampus) {
        await this.logTransparency(swapId, {
          requester_id: current.requesterUid,
          responder_id: current.providerUid,
          requester_campus_id: (current as any).requesterCampus,
          responder_campus_id: (current as any).providerCampus,
          action: 'swap_canceled_mutual'
        });
      }

      await NotificationService.create(current.requesterUid, 'swap_canceled_mutual', {
        amount: current.karmaStaked, 
        swapId
      });
      await NotificationService.create(current.providerUid, 'swap_canceled_mutual', {
        swapId
      });

      getIO().to(`user:${current.requesterUid}`).emit('swap:canceled_mutual', { swapId, karmaRefunded: current.karmaStaked });
      getIO().to(`user:${current.providerUid}`).emit('swap:canceled_mutual', { swapId });
      
      return current;
    }

    throw new Error('Action already initiated or unauthorized');
  }

  /**
   * Administrative override for conflicted or stale swaps.
   */
  static async adminOverrideSwap(swapId: string, action: 'force_refund' | 'force_payout', adminUid: string, notes: string) {
    const swap = await SwapModel.findById(swapId);
    if (!swap) throw new Error('Swap not found');

    if (action === 'force_refund') {
      swap.status = 'canceled';
      await KarmaService.recordTransaction({
        fromUid: 'KARMA_ESCROW',
        toUid: swap.requesterUid,
        amount: swap.karmaStaked,
        reason: `Admin Force Refund: ${notes}`,
        institutionalNode: (swap as any).requesterCampus
      });
    } else {
      // Force Payout sets status to 'disputed' to preserve organic metrics
      swap.status = 'disputed';
      await KarmaService.recordTransaction({
        fromUid: 'KARMA_ESCROW',
        toUid: swap.providerUid,
        amount: swap.karmaStaked,
        reason: `Admin Force Payout: ${notes}`,
        institutionalNode: (swap as any).providerCampus
      });
    }

    swap.adminNotes = `[${adminUid}] ${notes}`;
    await swap.save();

    // Admin overrides are ALWAYS logged to the transparency log for auditability
    if (swap.isCrossCampus) {
      await this.logTransparency(swapId, {
        requester_id: swap.requesterUid,
        responder_id: swap.providerUid,
        requester_campus_id: (swap as any).requesterCampus,
        responder_campus_id: (swap as any).providerCampus,
        action: `admin_${action}`
      });
    }

    await NotificationService.create(swap.requesterUid, 'swap_admin_resolved', { swapId });
    await NotificationService.create(swap.providerUid, 'swap_admin_resolved', { swapId });

    getIO().to(`user:${swap.requesterUid}`).emit('swap:admin_resolved', { swapId, action, notes });
    getIO().to(`user:${swap.providerUid}`).emit('swap:admin_resolved', { swapId, action, notes });
    
    return swap;
  }

  static async getSwapsByUser(uid: string, status?: string, limit = 20) {
    const query: any = { $or: [{ requesterUid: uid }, { providerUid: uid }] };
    if (status) query.status = status;
    return SwapModel.find(query).sort({ _id: -1 }).limit(limit);
  }

  static async getSwapById(swapId: string, uid: string) {
    const swap = await SwapModel.findById(swapId);
    if (!swap) throw new Error('Swap not found');
    if (swap.requesterUid !== uid && swap.providerUid !== uid) throw new Error('Unauthorized');
    return swap;
  }

  private static async logTransparency(swapId: string, data: any) {
    const client = await nexusConnector.pg.connect();
    try {
      await client.query(
        `INSERT INTO nexus_transparency_log 
        (swap_id, requester_id, responder_id, requester_campus_id, responder_campus_id, action) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [swapId, data.requester_id, data.responder_id, data.requester_campus_id, data.responder_campus_id, data.action]
      );
    } finally {
      client.release();
    }
  }
}
