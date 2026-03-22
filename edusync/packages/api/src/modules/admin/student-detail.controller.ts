import { Request, Response } from 'express';
import { StudentDetailService } from './student-detail.service.js';
import { z } from 'zod';

export class StudentDetailController {
  static async getStudentDetail(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const adminCampus = (req as any).student.campus;
      
      const detail = await StudentDetailService.getStudentProfile(uid, adminCampus);
      res.json(detail);
    } catch (error: any) {
      if (error.message === 'STUDENT_NOT_FOUND') return res.status(404).json({ error: 'Student not found' });
      res.status(500).json({ error: error.message });
    }
  }

  static async updateModerationStatus(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const adminUid = (req as any).student.firebaseUid;
      const adminCampus = (req as any).student.campus;

      const schema = z.object({
        action: z.enum(['warn', 'suspend', 'ban', 'reinstate']),
        reason: z.string().min(10),
        durationDays: z.number().min(1).max(90).optional()
      });

      const validated = schema.parse(req.body);
      
      if (validated.action === 'suspend' && !validated.durationDays) {
        return res.status(400).json({ error: 'Duration is required for suspension' });
      }

      const result = await StudentDetailService.updateModerationStatus(
        uid, adminUid, adminCampus, validated.action, { 
            reason: validated.reason, 
            durationDays: validated.durationDays 
        }
      );
      
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  }

  static async clearStudentRecord(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const adminUid = (req as any).student.firebaseUid;
      const adminCampus = (req as any).student.campus;

      const schema = z.object({
        reason: z.string().min(10)
      });

      const validated = schema.parse(req.body);
      
      const result = await StudentDetailService.clearStudentRecord(uid, adminUid, adminCampus, validated.reason);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentSwapHistory(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const adminCampus = (req as any).student.campus;
      const { limit, cursor } = req.query;

      const history = await StudentDetailService.getStudentSwapHistory(
        uid, 
        adminCampus, 
        limit ? parseInt(limit as string) : 20, 
        cursor as string
      );
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentFlagHistory(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const adminCampus = (req as any).student.campus;
      const { limit, cursor } = req.query;

      const history = await StudentDetailService.getStudentFlagHistory(
        uid, 
        adminCampus, 
        limit ? parseInt(limit as string) : 20, 
        cursor as string
      );
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
