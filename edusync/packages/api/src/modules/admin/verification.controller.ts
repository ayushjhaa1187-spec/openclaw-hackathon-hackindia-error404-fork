import { Request, Response } from 'express';
import { VerificationService } from './verification.service.js';

export class VerificationController {
  static async getQueue(req: Request, res: Response) {
    try {
      const { campusId } = (req as any).user;
      const { cursor, limit, ...filters } = req.query;
      
      const result = await VerificationService.getVerificationQueue(
        campusId, 
        filters, 
        cursor as string, 
        Number(limit) || 20
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async openReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { uid } = (req as any).user;
      
      const result = await VerificationService.openForReview(id, uid);
      
      if (!result.success) {
        return res.status(409).json({
          error: 'Resource is already being reviewed by another administrator',
          reviewerUid: result.reviewerUid,
          openedAt: result.openedAt
        });
      }
      
      res.json(result.resource);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { uid, campusId } = (req as any).user;
      const { notes } = req.body;
      
      const resource = await VerificationService.approveResource(id, uid, campusId, notes);
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { uid, campusId } = (req as any).user;
      const { reason, category } = req.body;
      
      if (!reason || !category) {
        return res.status(400).json({ error: 'Rejection reason and category are required' });
      }

      const resource = await VerificationService.rejectResource(id, uid, campusId, reason, category);
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async requestChanges(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { uid, campusId } = (req as any).user;
      const { instruction } = req.body;
      
      if (!instruction) {
        return res.status(400).json({ error: 'Change instruction is required' });
      }

      const resource = await VerificationService.requestChanges(id, uid, campusId, instruction);
      res.json(resource);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAuditLog(req: Request, res: Response) {
    try {
      const { campusId } = (req as any).user;
      const { limit } = req.query;
      
      const logs = await VerificationService.getAdminActionHistory(campusId, Number(limit) || 50);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
