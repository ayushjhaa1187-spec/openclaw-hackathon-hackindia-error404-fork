import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'swap_request_received'
  | 'swap_accepted'
  | 'swap_rejected'
  | 'swap_completed'
  | 'swap_cancel_requested'
  | 'swap_canceled_mutual'
  | 'swap_admin_resolved'
  | 'resource_certified'
  | 'resource_rejected'
  | 'karma_earned'
  | 'karma_spent'
  | 'guardian_warning'
  | 'nexus_mou_activated'
  | 'karma_tier_upgrade'
  | 'leaderboard_top10'
  | 'resource_changes_requested'
  | 'account_warned'
  | 'account_suspended'
  | 'account_banned'
  | 'account_reinstated';

export interface INotification extends Document {
  recipientUid: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedEntityId?: string;
  relatedEntityType?: 'swap' | 'resource' | 'karma' | 'admin';
  actionUrl: string;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
}

const NotificationSchema: Schema = new Schema({
  recipientUid: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'swap_request_received', 'swap_accepted', 'swap_rejected', 'swap_completed',
      'swap_cancel_requested', 'swap_canceled_mutual', 'swap_admin_resolved',
      'resource_certified', 'resource_rejected', 'karma_earned', 'karma_spent',
      'guardian_warning', 'nexus_mou_activated', 'karma_tier_upgrade', 'leaderboard_top10',
      'resource_changes_requested', 'account_warned', 'account_suspended',
      'account_banned', 'account_reinstated'
    ]
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  relatedEntityId: { type: String },
  relatedEntityType: { 
    type: String, 
    enum: ['swap', 'resource', 'karma', 'admin'] 
  },
  actionUrl: { type: String, required: true },
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// TTL Index: Auto-delete after 90 days (7776000 seconds)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Compound index for primary query pattern
NotificationSchema.index({ recipientUid: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
