import { ResourceModel, nexusConnector } from '@edusync/db';
import { KarmaService } from '../karma/service.js';
import { NotificationService } from '../notifications/service.js';
import { AnalyticsService } from '../analytics/service.js';

export interface OpenForReviewResult {
  success: boolean;
  resource?: any;
  conflict?: boolean;
  reviewerUid?: string;
  openedAt?: Date;
}

export class VerificationService {
  /**
   * Fetches the verification queue for a specific campus.
   */
  static async getVerificationQueue(adminCampus: string, filters: any = {}, cursor?: string, limit: number = 20) {
    const query: any = {
      campusId: adminCampus,
      'verification.status': { $in: ['pending', 'under_review', 'changes_requested'] }
    };

    if (filters.fileType) query.fileType = filters.fileType;
    if (filters.aiSafetyVerdict) query['verification.aiSafetyVerdict'] = filters.aiSafetyVerdict;
    if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
    
    if (cursor) {
      query._id = { $lt: cursor };
    }

    // Sort priority: changes_requested, then flagged AI, then pending, then under_review last
    const resources = await ResourceModel.find(query)
      .sort({ 
        'verification.status': 1, // pending=0, under_review=1, etc? No, custom sort needed for ideal experience
        'verification.aiSafetyScore': 1, // Lower score = higher risk = show first
        createdAt: -1 
      })
      .limit(limit);

    const totalCount = await ResourceModel.countDocuments({
      campusId: adminCampus,
      'verification.status': { $in: ['pending', 'under_review', 'changes_requested'] }
    });

    return {
      resources,
      meta: {
        totalPending: totalCount,
        nextCursor: resources.length === limit ? resources[resources.length - 1]._id : null
      }
    };
  }

  /**
   * Atomics marking a resource as 'under_review' to prevent concurrent admin work.
   */
  static async openForReview(resourceId: string, adminUid: string): Promise<OpenForReviewResult> {
    // 1. Check if already under review
    const resource = await ResourceModel.findById(resourceId);
    if (!resource) throw new Error('Resource not found');

    if (resource.verification?.status === 'under_review') {
      if (resource.verification?.verifiedBy === adminUid) {
        return { success: true, resource };
      }
      return { 
        success: false, 
        conflict: true, 
        reviewerUid: resource.verification?.verifiedBy || 'unknown', 
        openedAt: resource.verification?.verifiedAt || new Date()
      };
    }

    // 2. Atomic update: only if it was 'pending' or 'changes_requested'
    const updated = await ResourceModel.findOneAndUpdate(
      { 
        _id: resourceId, 
        'verification.status': { $in: ['pending', 'changes_requested'] } 
      },
      { 
        $set: { 
          'verification.status': 'under_review',
          'verification.verifiedBy': adminUid,
          'verification.verifiedAt': new Date()
        }
      },
      { new: true }
    );

    if (!updated) {
       // Someone else got it in the millisecond between findById and findOneAndUpdate
       const recheck = await ResourceModel.findById(resourceId);
       return { 
         success: false, 
         conflict: true, 
         reviewerUid: recheck?.verification?.verifiedBy || 'unknown',
         openedAt: recheck?.verification?.verifiedAt || new Date()
       };
    }

    return { success: true, resource: updated };
  }

  /**
   * Approve a resource: status -> verified, award bonus, log audit.
   */
  static async approveResource(resourceId: string, adminUid: string, adminCampus: string, notes?: string) {
    const resource = await ResourceModel.findById(resourceId);
    if (!resource || !resource.verification) throw new Error('Resource or verification metadata not found');
    
    if (resource.verification.status === 'verified') {
      throw new Error('Resource is already verified');
    }

    // 1. Update MongoDB
    resource.verification.status = 'verified';
    resource.verification.verifiedBy = adminUid;
    resource.verification.verifiedAt = new Date();
    resource.adminNotes = notes || null;
    await resource.save();

    // 2. Award +20 Karma Bonus (Certification)
    await KarmaService.recordTransaction({
      fromUid: 'NEXUS_TREASURY',
      toUid: resource.ownerUid,
      amount: 20,
      reason: `Resource Certified: ${resource.title}`,
      institutionalNode: adminCampus
    });

    await NotificationService.create(resource.ownerUid, 'resource_certified', {
      title: resource.title,
      resourceId: resource._id
    });

    // 3. PostgreSQL Audit Log
    await this.logAdminAction({
      admin_uid: adminUid,
      admin_campus: adminCampus,
      action_type: 'resource_approved',
      target_entity_type: 'resource',
      target_entity_id: resourceId,
      reason: notes || 'Meets institutional quality standards',
      metadata: { resourceTitle: resource.title, karmaBonus: 20 }
    });

    await AnalyticsService.invalidateCache(adminCampus);

    return resource;
  }

  /**
   * Reject a resource: status -> rejected, notify, log audit.
   */
  static async rejectResource(resourceId: string, adminUid: string, adminCampus: string, reason: string, category: string) {
    const resource = await ResourceModel.findById(resourceId);
    if (!resource || !resource.verification) throw new Error('Resource or verification metadata not found');

    resource.verification.status = 'rejected';
    resource.verification.verifiedBy = adminUid;
    resource.verification.verifiedAt = new Date();
    resource.verification.rejectionReason = reason;
    await resource.save();

    await NotificationService.create(resource.ownerUid, 'resource_rejected', {
      title: resource.title,
      reason: reason,
      resourceId: resource._id
    });

    await this.logAdminAction({
      admin_uid: adminUid,
      admin_campus: adminCampus,
      action_type: 'resource_rejected',
      target_entity_type: 'resource',
      target_entity_id: resourceId,
      reason: reason,
      metadata: { resourceTitle: resource.title, category }
    });

    return resource;
  }

  /**
   * Request changes: status -> changes_requested, notify, log audit.
   */
  static async requestChanges(resourceId: string, adminUid: string, adminCampus: string, changeRequest: string) {
    const resource = await ResourceModel.findById(resourceId);
    if (!resource || !resource.verification) throw new Error('Resource or verification metadata not found');

    resource.verification.status = 'changes_requested';
    resource.verification.changesRequested = changeRequest;
    resource.verification.reviewAttempts += 1;
    await resource.save();

    await NotificationService.create(resource.ownerUid, 'resource_changes_requested', {
      title: resource.title,
      changeRequest: changeRequest,
      resourceId: resource._id
    });

    await this.logAdminAction({
      admin_uid: adminUid,
      admin_campus: adminCampus,
      action_type: 'resource_changes_requested',
      target_entity_type: 'resource',
      target_entity_id: resourceId,
      reason: changeRequest,
      metadata: { resourceTitle: resource.title }
    });

    return resource;
  }

  /**
   * Fetches admin audit trail from PostgreSQL.
   */
  static async getAdminActionHistory(adminCampus: string, limit: number = 20) {
    const query = `
      SELECT * FROM admin_actions 
      WHERE admin_campus = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await nexusConnector.pg.query(query, [adminCampus, limit]);
    return result.rows;
  }

  /**
   * Internal helper for PostgreSQL audit logging.
   */
  private static async logAdminAction(data: {
    admin_uid: string;
    admin_campus: string;
    action_type: string;
    target_entity_type: string;
    target_entity_id: string;
    reason: string;
    metadata: any;
  }) {
    const query = `
      INSERT INTO admin_actions (
        admin_uid, admin_campus, action_type, target_entity_type, 
        target_entity_id, reason, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await nexusConnector.pg.query(query, [
      data.admin_uid,
      data.admin_campus,
      data.action_type,
      data.target_entity_type,
      data.target_entity_id,
      data.reason,
      JSON.stringify(data.metadata)
    ]);
  }
}
