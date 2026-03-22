import { ResourceModel } from '@edusync/db';
import { KarmaService } from '../karma/service.js';
import { NotificationService } from '../notifications/service.js';
import { GeminiService } from '../../services/gemini-service.js';
import { resourceScreenerQueue } from '../../jobs/resource-screener.js';
import { AnalyticsService } from '../analytics/service.js';

export class VaultService {
  /**
   * Upload a new resource to the Knowledge Vault.
   * Sequence: Cloudinary Upload -> Mongo Create -> Karma Bonus (+10) -> AI Screening
   */
  static async uploadResource(data: {
    ownerUid: string;
    title: string;
    description: string;
    subject?: string;
    courseCode?: string;
    campusId: string;
    fileUrl: string; // This will be the Cloudinary URL
    fileType: 'PDF' | 'Video' | 'Image' | 'Archive';
    karmaCost: number;
    tags?: string[];
  }) {
    // 1. Enforce Server-Side Defaults
    const newResource = await ResourceModel.create({
      ...data,
      verification: { 
        status: 'pending',
        aiSafetyVerdict: 'unscreened',
        reviewAttempts: 0
      },
      downloads: 0
    });

    // 2. Trigger AI Screening (Fire-and-forget)
    try {
      await resourceScreenerQueue.add('screen-resource', { resourceId: newResource._id.toString() });
    } catch (queueErr) {
      console.error('⚠️ AI Screener Queue Trigger Failed:', queueErr);
    }

    // 3. Grant Bounty: +10 Karma for contribution
    try {
      await KarmaService.recordTransaction({
        fromUid: 'NEXUS_TREASURY',
        toUid: data.ownerUid,
        amount: 10,
        reason: `Resource Contribution: ${newResource.title}`,
        institutionalNode: data.campusId
      });
      await NotificationService.create(data.ownerUid, 'karma_earned', {
        amount: 10,
        reason: 'Resource contribution bonus',
        resourceId: newResource._id
      });
    } catch (e) {
      console.error('⚠️ Contribution Bonus Notification Failed:', e);
    }

    await AnalyticsService.invalidateCache(data.campusId);

    console.log(`📦 Nexus Vault: New resource pending review - ${newResource.title} by @${data.ownerUid}`);
    return newResource;
  }

  /**
   * Resubmit a resource after changes were requested by an admin.
   * This resets the status but preserves the review history (attempts).
   */
  static async resubmitResource(id: string, ownerUid: string, data: {
    title?: string;
    description?: string;
    tags?: string[];
    karmaCost?: number;
  }) {
    const resource = await ResourceModel.findById(id);
    if (!resource) throw new Error('Resource not found');
    if (resource.ownerUid !== ownerUid) throw new Error('Unauthorized: Not the resource owner');
    if (resource.verification?.status !== 'changes_requested') {
      throw new Error('Resubmission only allowed when changes are requested');
    }

    // 1. Update metadata and reset status
    Object.assign(resource, data);
    if (resource.verification) {
      resource.verification.status = 'pending';
      resource.verification.changesRequested = null;
    }
    // Note: reviewAttempts is NOT reset to 0; it was incremented during the change request
    
    await resource.save();

    // 2. Re-trigger AI Screening
    await resourceScreenerQueue.add('screen-resource', { resourceId: resource._id.toString() });

    return resource;
  }

  /**
   * List resources with visibility scoping and text search.
   */
  static async listResources(filters: {
    campusId: string;
    collegeGroupId?: string;
    hasCrossCampus?: boolean;
    search?: string;
    fileType?: string;
    limit?: number;
    skip?: number;
  }) {
    // 1. Construct Visibility Filter (Core Privacy Requirement)
    const visibilityFilter = {
      $and: [
        { 'verification.status': 'verified' }, // Only show verified assets in explorer
        {
          $or: [
            { visibility: 'public' },
            { visibility: 'campus_only', campusId: filters.campusId },
            { visibility: 'college_group', collegeGroupId: filters.collegeGroupId },
            ...(filters.hasCrossCampus ? [{ visibility: 'nexus_partners' }] : [])
          ]
        }
      ]
    };

    const query: any = { ...visibilityFilter };
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.fileType) {
      query.fileType = filters.fileType;
    }

    const resources = await ResourceModel.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20)
      .skip(filters.skip || 0);

    return resources;
  }

  /**
   * Purchase/Unlock a resource.
   * Logic: 100% P2P Transfer (Rounding to Integer). 
   * Note: Node Skimming (5%) deferred to Phase 8 BullMQ job.
   */
  static async purchaseResource(resourceId: string, buyerUid: string, buyerCampusId: string) {
    const resource = await ResourceModel.findById(resourceId);
    if (!resource) throw new Error('Resource not found');

    // 1. Self-Purchase Guard: Uploader doesn't pay for their own asset
    if (resource.ownerUid === buyerUid) {
      return { success: true, fileUrl: resource.fileUrl, isOwner: true };
    }

    // 2. Ledger Atomicity: Single 100% P2P Transfer
    const baseCost = resource.karmaCost || 0;
    const roundedCost = Math.round(baseCost);

    if (roundedCost > 0) {
      await KarmaService.recordTransaction({
        fromUid: buyerUid,
        toUid: resource.ownerUid,
        amount: roundedCost,
        reason: `Vault Purchase: ${resource.title}`,
        institutionalNode: buyerCampusId
      });

      // 3. Notifications
      await NotificationService.create(resource.ownerUid, 'karma_earned', {
        amount: roundedCost,
        reason: `Resource download: ${resource.title}`,
        resourceId: resource._id
      });
      await NotificationService.create(buyerUid, 'karma_spent', {
        amount: roundedCost,
        reason: `Unlocked: ${resource.title}`,
        resourceId: resource._id
      });
    }

    // 3. Increment Download Count
    resource.downloads += 1;
    await resource.save();

    return { success: true, fileUrl: resource.fileUrl };
  }

  static async getResourceById(id: string) {
    return ResourceModel.findById(id);
  }

  /**
   * Admin verification of a resource.
   */
  static async verifyResource(id: string, verified: boolean) {
    const resource = await ResourceModel.findByIdAndUpdate(id, { verified }, { new: true });
    if (!resource) throw new Error('Resource not found');
    return resource;
  }

  /**
   * AI Semantic Search.
   */
  static async searchResourcesSemantic(query: string) {
    const allResources = await ResourceModel.find({ 'verification.status': 'verified' }).sort({ createdAt: -1 }).limit(50);
    const resourceData = allResources.map(r => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description || ""
    }));

    const matchingIds = await GeminiService.matchResourceIntent(query, resourceData);
    return allResources.filter(r => matchingIds.includes(r._id.toString()));
  }
}
