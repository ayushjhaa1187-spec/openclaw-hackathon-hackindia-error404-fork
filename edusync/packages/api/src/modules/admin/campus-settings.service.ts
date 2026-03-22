import { CampusSettingsModel, StudentModel, nexusConnector } from '@edusync/db';
import { redis } from '../../services/redis-service.js';
import { getIO } from '../../socket.js';

export class CampusSettingsService {
  /**
   * Fetches campus settings with Redis caching (60s).
   * Returns schema defaults if no document exists.
   */
  static async getSettings(campus: string) {
    const cacheKey = `campus-settings:${campus}`;
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.warn('Redis Cache Miss (Error):', err);
    }

    const settings = await CampusSettingsModel.findOne({ campus }).lean();
    
    // Safety check: Return defaults if unconfigured
    const finalSettings = settings || this.getDefaultSettings(campus);

    // Cache setting
    try {
      await redis.setEx(cacheKey, 60, JSON.stringify(finalSettings));
    } catch (err) {
      console.warn('Redis Cache Update Failure:', err);
    }

    return finalSettings;
  }

  static async updateNexusSettings(campus: string, adminUid: string, settings: any, confirmBulkDisable: boolean = false) {
    const current = await CampusSettingsModel.findOne({ campus });
    
    // Safety guard for bulk operation
    if (current?.nexus?.enabled && settings.enabled === false && !confirmBulkDisable) {
      throw new Error('BULK_DISABLE_CONFIRMATION_REQUIRED');
    }

    const updated = await CampusSettingsModel.findOneAndUpdate(
      { campus },
      { $set: { 'nexus': settings, updatedBy: adminUid, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    // Invalidate cache
    await redis.del(`campus-settings:${campus}`);

    // Destructive bulk operation if Nexus is disabled campus-wide
    if (settings.enabled === false) {
      await StudentModel.updateMany(
        { campus },
        { $set: { 'nexus.crossCampusEnabled': false } }
      );
      
      await nexusConnector.pg.query(
        'INSERT INTO admin_actions (admin_uid, admin_campus, action_type, target_entity_type, target_entity_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
        [adminUid, campus, 'nexus_disabled_campus_wide', 'campus', campus, 'Campus-wide Nexus deactivation']
      );
    }

    return updated;
  }

  static async updateGuardianSettings(campus: string, adminUid: string, settings: any) {
    const updated = await CampusSettingsModel.findOneAndUpdate(
      { campus },
      { $set: { 'guardian': settings, updatedBy: adminUid, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    await redis.del(`campus-settings:${campus}`);
    
    // Notify server process
    getIO().to(`admin:${campus}`).emit('admin:guardian_settings_updated');

    return updated;
  }

  static async updateKarmaSettings(campus: string, adminUid: string, settings: any) {
    const updated = await CampusSettingsModel.findOneAndUpdate(
      { campus },
      { $set: { 'karma': settings, updatedBy: adminUid, updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    await redis.del(`campus-settings:${campus}`);

    await nexusConnector.pg.query(
      'INSERT INTO admin_actions (admin_uid, admin_campus, action_type, target_entity_type, target_entity_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminUid, campus, 'karma_settings_updated', 'campus', campus, 'Karma economy parameters adjusted']
    );

    return updated;
  }

  static async updateCampusSettings(campus: string, adminUid: string, updates: any) {
    // Flatten and map fields if necessary
    const updateObj: any = { 
      updatedBy: adminUid, 
      updatedAt: new Date() 
    };

    if (updates.nexus) updateObj.nexus = updates.nexus;
    if (updates.guardian) updateObj.guardian = updates.guardian;
    if (updates.karma) updateObj.karma = updates.karma;
    if (updates.verification) updateObj.verification = updates.verification;
    if (updates.display) updateObj.display = updates.display;

    // Handle user's aliases from the prompt (if they differ from schema)
    if (updates.guardianAI) updateObj.guardian = { ...updateObj.guardian, ...updates.guardianAI };
    if (updates.karmaEconomy) updateObj.karma = { ...updateObj.karma, ...updates.karmaEconomy };

    const updated = await CampusSettingsModel.findOneAndUpdate(
      { campus },
      { $set: updateObj },
      { upsert: true, new: true }
    ).lean();

    await redis.del(`campus-settings:${campus}`);

    await nexusConnector.pg.query(
      'INSERT INTO admin_actions (admin_uid, admin_campus, action_type, target_entity_type, target_entity_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminUid, campus, 'campus_settings_batch_update', 'campus', campus, 'Campus configuration updated via unified console']
    );

    return updated;
  }

  static async getAdminUsers(campus: string) {
    return StudentModel.find({ 
      campus, 
      roles: { $in: ['nexus_admin'] } 
    }).select('name email lastActiveDate firebaseUid').lean();
  }

  static async addAdminUser(campus: string, targetUid: string, addedByAdminUid: string) {
    // Campus isolation check before privilege escalation
    const student = await StudentModel.findOne({ firebaseUid: targetUid, campus });
    if (!student) throw new Error('STUDENT_NOT_FOUND_ON_CAMPUS');

    await StudentModel.findOneAndUpdate(
      { firebaseUid: targetUid },
      { $addToSet: { roles: 'nexus_admin' } }
    );

    await nexusConnector.pg.query(
      'INSERT INTO admin_actions (admin_uid, admin_campus, action_type, target_entity_type, target_entity_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
      [addedByAdminUid, campus, 'admin_added', 'student', targetUid, 'Privilege escalation to nexus_admin']
    );

    return { success: true };
  }

  static async removeAdminUser(campus: string, targetUid: string, removedByAdminUid: string) {
    if (targetUid === removedByAdminUid) throw new Error('CANNOT_REMOVE_SELF');

    // Ensure campus-scoped admin count check
    const adminCount = await StudentModel.countDocuments({ campus, roles: 'nexus_admin' });
    if (adminCount <= 1) throw new Error('CANNOT_REMOVE_LAST_ADMIN');

    // Campus isolation check
    const student = await StudentModel.findOne({ firebaseUid: targetUid, campus });
    if (!student) throw new Error('STUDENT_NOT_FOUND_ON_CAMPUS');

    await StudentModel.findOneAndUpdate(
      { firebaseUid: targetUid },
      { $pull: { roles: 'nexus_admin' } }
    );

    await nexusConnector.pg.query(
      'INSERT INTO admin_actions (admin_uid, admin_campus, action_type, target_entity_type, target_entity_id, reason) VALUES ($1, $2, $3, $4, $5, $6)',
      [removedByAdminUid, campus, 'admin_removed', 'student', targetUid, 'Privilege revocation']
    );

    return { success: true };
  }

  private static getDefaultSettings(campus: string): any {
    return {
      campus,
      nexus: {
        enabled: false,
        autoApproveIntraGroupSwaps: false,
        requireAdminApprovalForCrossCampus: true,
        maxCrossSwapsPerStudent: 10
      },
      guardian: {
        aiModerationEnabled: true,
        customKeywords: [],
        autoSuspendAfterFlags: 5,
        resourceScreeningEnabled: true
      },
      karma: {
        uploadBonusAmount: 10,
        certificationBonusAmount: 20,
        minimumSwapStake: 10,
        vaultPlatformFeePercent: 5
      },
      verification: {
        autoScreenNewResources: true,
        requireVerificationForNexusResources: true
      },
      display: {
        campusFullName: campus.replace('_', ' '),
        campusShortCode: campus.split('_')[1] || campus,
        primaryColor: '#6366f1'
      }
    };
  }
}
