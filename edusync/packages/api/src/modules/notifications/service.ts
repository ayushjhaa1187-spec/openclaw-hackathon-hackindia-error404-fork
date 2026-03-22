import { NotificationModel, NotificationType, INotification } from '@edusync/db'; // Assuming it's exported from @edusync/db or I'll use relative path
import { getIO } from '../../socket.js';
import mongoose from 'mongoose';

// If @edusync/db doesn't export it yet, I'll use relative paths for now to be safe
// import { NotificationModel } from '../../../packages/db/mongo/models/notification';

export class NotificationService {
  /**
   * Persist-then-push: Saves to DB, then emits via Socket.io
   */
  static async create(recipientUid: string, type: NotificationType, payload: any) {
    const { title, body, actionUrl, relatedEntityId, relatedEntityType } = this.mapTypeToContent(type, payload);

    const doc = new NotificationModel({
      recipientUid,
      type,
      title,
      body,
      actionUrl,
      relatedEntityId,
      relatedEntityType,
      isRead: false,
      readAt: null
    });

    await doc.save();

    // Push real-time
    try {
      const io = getIO();
      io.to(`user:${recipientUid}`).emit('notification:new', doc);
    } catch (err) {
      console.warn(`Socket delivery failed for user ${recipientUid}, but notification is persisted.`);
    }

    return doc;
  }

  static async getUnread(uid: string, limit: number = 20, cursor?: string) {
    const query: any = { recipientUid: uid, isRead: false };
    if (cursor) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const notifications = await NotificationModel.find(query)
      .sort({ _id: -1 })
      .limit(limit);

    const unreadCount = await NotificationModel.countDocuments({ recipientUid: uid, isRead: false });

    return {
      notifications,
      unreadCount,
      nextCursor: notifications.length === limit ? notifications[notifications.length - 1]._id : null
    };
  }

  static async getHistory(uid: string, limit: number = 20, cursor?: string) {
    const query: any = { recipientUid: uid };
    if (cursor) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const notifications = await NotificationModel.find(query)
      .sort({ _id: -1 })
      .limit(limit);

    const unreadCount = await NotificationModel.countDocuments({ recipientUid: uid, isRead: false });

    return {
      notifications,
      unreadCount,
      nextCursor: notifications.length === limit ? notifications[notifications.length - 1]._id : null
    };
  }

  static async markRead(uid: string, notificationId: string) {
    // Atomic update with recipientUid guard for security (returns 404 if not found/unauthorized)
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientUid: uid },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found'); // This will manifest as 404 in controller
    }

    return notification;
  }

  static async markAllRead(uid: string) {
    const result = await NotificationModel.updateMany(
      { recipientUid: uid, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return result.modifiedCount;
  }

  private static mapTypeToContent(type: NotificationType, p: any) {
    let title = '';
    let body = '';
    let actionUrl = '/dashboard';
    let relatedEntityId = p.swapId || p.resourceId || p.transactionId;
    let relatedEntityType: 'swap' | 'resource' | 'karma' | 'admin' | undefined;

    switch (type) {
      case 'swap_request_received':
        title = 'New Swap Request';
        body = `${p.name} wants to swap ${p.skill}`;
        actionUrl = '/dashboard/swap/inbox';
        relatedEntityType = 'swap';
        break;
      case 'swap_accepted':
        title = 'Swap Accepted';
        body = `${p.name} accepted your swap request`;
        actionUrl = `/dashboard/swap/room/${p.swapId}`;
        relatedEntityType = 'swap';
        break;
      case 'swap_rejected':
        title = 'Swap Declined';
        body = `${p.name} declined your swap request`;
        actionUrl = '/dashboard';
        relatedEntityType = 'swap';
        break;
      case 'swap_completed':
        title = 'Swap Complete';
        body = `Your swap with ${p.name} is complete`;
        actionUrl = `/dashboard/swap/review/${p.swapId}`;
        relatedEntityType = 'swap';
        break;
      case 'swap_cancel_requested':
        title = 'Cancel Requested';
        body = `${p.name} has requested to cancel`;
        actionUrl = `/dashboard/swap/room/${p.swapId}`;
        relatedEntityType = 'swap';
        break;
      case 'swap_canceled_mutual':
        title = 'Swap Canceled';
        body = `Swap canceled. ${p.amount} karma refunded`;
        actionUrl = '/dashboard';
        relatedEntityType = 'swap';
        break;
      case 'swap_admin_resolved':
        title = 'Admin Resolved';
        body = `An admin has resolved your swap dispute`;
        actionUrl = '/dashboard';
        relatedEntityType = 'admin';
        break;
      case 'resource_certified':
        title = 'Resource Certified';
        body = `Your resource "${p.title}" has been certified`;
        actionUrl = `/dashboard/vault/${p.resourceId}`;
        relatedEntityType = 'resource';
        break;
      case 'resource_rejected':
        title = 'Resource Rejected';
        body = `Your resource "${p.title}" was not approved`;
        actionUrl = '/dashboard/vault/upload';
        relatedEntityType = 'resource';
        break;
      case 'karma_earned':
        title = 'Karma Earned';
        body = `+${p.amount} karma: ${p.reason}`;
        actionUrl = '/dashboard/karma';
        relatedEntityType = 'karma';
        break;
      case 'karma_spent':
        title = 'Karma Spent';
        body = `-${p.amount} karma: ${p.reason}`;
        actionUrl = '/dashboard/karma';
        relatedEntityType = 'karma';
        break;
      case 'guardian_warning':
        title = 'Platform Warning';
        body = `A message was flagged in your session`;
        actionUrl = `/dashboard/swap/room/${p.swapId}`;
        relatedEntityType = 'admin';
        break;
      case 'nexus_mou_activated':
        title = 'New MOU Partner';
        body = `${p.campus} is now a Nexus partner`;
        actionUrl = '/dashboard/nexus';
        relatedEntityType = 'admin';
        break;
      case 'karma_tier_upgrade':
        title = 'Tier Upgrade';
        body = `You've reached ${p.newTier} tier`;
        actionUrl = '/dashboard/leaderboard';
        relatedEntityType = 'karma';
        break;
      case 'leaderboard_top10':
        title = 'Top 10 on Campus';
        body = `You're ranked #${p.currentRank} at ${p.campus}`;
        actionUrl = '/dashboard/leaderboard';
        relatedEntityType = 'karma';
        break;
      case 'account_warned':
        title = 'Account Warning';
        body = `A warning has been issued: ${p.reason}`;
        actionUrl = '/dashboard';
        relatedEntityType = 'admin';
        break;
      case 'account_suspended':
        title = 'Account Suspended';
        body = `Your account is suspended for ${p.durationDays} days`;
        actionUrl = '/dashboard';
        relatedEntityType = 'admin';
        break;
      case 'account_banned':
        title = 'Account Banned';
        body = 'Your account has been permanently banned';
        actionUrl = '/dashboard';
        relatedEntityType = 'admin';
        break;
      case 'account_reinstated':
        title = 'Account Reinstated';
        body = 'Your account has been reinstated';
        actionUrl = '/dashboard';
        relatedEntityType = 'admin';
        break;
    }

    return { title, body, actionUrl, relatedEntityId, relatedEntityType };
  }
}
