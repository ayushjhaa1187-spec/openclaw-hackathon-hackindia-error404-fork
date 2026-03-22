import { Request, Response } from 'express';
import { StudentModel, SwapModel } from '@edusync/db';

export class SettingsController {
  static async updateNexusSettings(req: Request, res: Response) {
    try {
      const student = (req as any).student;
      const { crossCampusEnabled } = req.body;

      const updated = await StudentModel.findOneAndUpdate(
        { firebaseUid: student.uid },
        { $set: { 'nexus.crossCampusEnabled': crossCampusEnabled } },
        { new: true }
      );

      // If disabling: cancel all pending cross-campus swaps
      if (crossCampusEnabled === false) {
        await SwapModel.updateMany(
          { 
            $or: [{ requesterUid: student.uid }, { providerUid: student.uid }],
            isCrossCampus: true, 
            status: 'pending' 
          },
          { $set: { status: 'canceled', adminNotes: 'Nexus feature disabled by user' } }
        );
        // NOTE: In a full implementation, we would also trigger escrow refunds here.
      }

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updateNotificationPreferences(req: Request, res: Response) {
    try {
      const student = (req as any).student;
      const { swaps, vault, karma, admin } = req.body;

      const update: any = {};
      if (swaps !== undefined) update['notificationPreferences.swaps'] = swaps;
      if (vault !== undefined) update['notificationPreferences.vault'] = vault;
      if (karma !== undefined) update['notificationPreferences.karma'] = karma;
      if (admin !== undefined) update['notificationPreferences.admin'] = admin;

      const updated = await StudentModel.findOneAndUpdate(
        { firebaseUid: student.uid },
        { $set: update },
        { new: true }
      );

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async updatePrivacySettings(req: Request, res: Response) {
    try {
      const student = (req as any).student;
      const { showOnLeaderboard, showKarmaBalance } = req.body;

      const update: any = {};
      if (showOnLeaderboard !== undefined) update['privacySettings.showOnLeaderboard'] = showOnLeaderboard;
      if (showKarmaBalance !== undefined) update['privacySettings.showKarmaBalance'] = showKarmaBalance;

      const updated = await StudentModel.findOneAndUpdate(
        { firebaseUid: student.uid },
        { $set: update },
        { new: true }
      );

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
