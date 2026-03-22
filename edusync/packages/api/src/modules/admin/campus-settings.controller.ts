import { Request, Response } from 'express';
import { CampusSettingsService } from './campus-settings.service.js';
import { z } from 'zod';

export class CampusSettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const settings = await CampusSettingsService.getSettings(campus);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateNexusSettings(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const adminUid = (req as any).student.firebaseUid;
      
      const schema = z.object({
        enabled: z.boolean().optional(),
        autoApproveIntraGroupSwaps: z.boolean().optional(),
        requireAdminApprovalForCrossCampus: z.boolean().optional(),
        maxCrossSwapsPerStudent: z.number().min(0).optional(),
        confirmBulkDisable: z.boolean().optional()
      });

      const validated = schema.parse(req.body);
      const { confirmBulkDisable, ...settings } = validated;

      const result = await CampusSettingsService.updateNexusSettings(campus, adminUid, settings, confirmBulkDisable);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'BULK_DISABLE_CONFIRMATION_REQUIRED') {
        return res.status(400).json({ error: 'Bulk Nexus deactivation requires explicit confirmation.' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async updateGuardianSettings(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const adminUid = (req as any).student.firebaseUid;

      const schema = z.object({
        aiModerationEnabled: z.boolean().optional(),
        customKeywords: z.array(z.string().max(50)).max(50).optional(),
        autoSuspendAfterFlags: z.number().min(0).max(20).optional(),
        resourceScreeningEnabled: z.boolean().optional()
      });

      const validated = schema.parse(req.body);

      const result = await CampusSettingsService.updateGuardianSettings(campus, adminUid, validated);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateKarmaSettings(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const adminUid = (req as any).student.firebaseUid;

      const schema = z.object({
        uploadBonusAmount: z.number().min(0).max(100).optional(),
        certificationBonusAmount: z.number().min(0).max(200).optional(),
        minimumSwapStake: z.number().min(5).max(500).optional(),
        vaultPlatformFeePercent: z.number().min(0).max(20).optional()
      });

      const validated = schema.parse(req.body);

      const result = await CampusSettingsService.updateKarmaSettings(campus, adminUid, validated);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAdminUsers(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const admins = await CampusSettingsService.getAdminUsers(campus);
      res.json(admins);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addAdminUser(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const adminUid = (req as any).student.firebaseUid;
      const { targetUid } = req.body;

      if (!targetUid) return res.status(400).json({ error: 'targetUid is required' });

      const result = await CampusSettingsService.addAdminUser(campus, targetUid, adminUid);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async removeAdminUser(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const adminUid = (req as any).student.firebaseUid;
      const { uid } = req.params;

      const result = await CampusSettingsService.removeAdminUser(campus, uid, adminUid);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
