import { Request, Response } from 'express';
import { GuardianService, ResolutionAction } from './service.js';
import { ReportService } from './report.service.js';

export class GuardianController {
  // --- Admin Endpoints ---

  static async getQueue(req: Request, res: Response) {
    try {
      const campus = req.student!.campus;
      const status = req.query.status as string || 'pending';
      const flags = await GuardianService.getFlagQueue(campus, status);
      res.json(flags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDetails(req: Request, res: Response) {
    try {
      const details = await GuardianService.getFlagDetails(req.params.id);
      res.json(details);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async resolve(req: Request, res: Response) {
    try {
      const { action, notes } = req.body;
      const result = await GuardianService.resolveFlag(
        req.params.id,
        action as ResolutionAction,
        req.student!.uid,
        notes
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async undo(req: Request, res: Response) {
    try {
      const result = await GuardianService.undoResolution(req.params.id, req.student!.uid);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await GuardianService.getModerationStats(req.student!.campus);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // --- Student Endpoints ---

  static async report(req: Request, res: Response) {
    try {
      const { targetId, targetType, description } = req.body;
      if (!description || description.length < 20) {
        return res.status(400).json({ error: 'Report description must be at least 20 characters.' });
      }

      const flag = await ReportService.submitReport({
        reporterUid: req.student!.uid,
        campus: req.student!.campus,
        targetId,
        targetType,
        description
      });

      res.status(201).json({ message: 'Report submitted successfully. Institutional guardians have been notified.', flagId: flag._id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
