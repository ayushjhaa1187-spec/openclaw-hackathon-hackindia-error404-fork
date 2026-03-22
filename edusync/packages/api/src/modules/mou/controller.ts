import { Request, Response } from 'express';
import { MOUService } from './service.js';
import { z } from 'zod';
import { ExportService } from '../analytics/export.service.js';

export class MOUController {
  static async propose(req: Request, res: Response) {
    try {
      const adminUid = (req as any).student.firebaseUid;
      const initiatingCampus = (req as any).student.campus;
      
      const schema = z.object({
        acceptingCampus: z.string().min(3),
        agreementTerms: z.string().optional(),
        validUntil: z.string().datetime().optional(),
        creditExchangeRate: z.number().min(0.1).max(10.0).optional(),
        maxCrossConnections: z.number().min(1).max(1000).optional(),
        dataShareLevel: z.enum(['profiles_only', 'full_transparency']).optional()
      });

      const validated = schema.parse(req.body);
      const result = await MOUService.proposeMOU(initiatingCampus, validated.acceptingCampus, adminUid, validated);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getMOUList(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const data = await MOUService.getMOUList(campus);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMOUDetail(req: Request, res: Response) {
    try {
      const { mouId } = req.params;
      const campus = (req as any).student.campus;
      const detail = await MOUService.getMOUDetail(mouId, campus);
      res.json(detail);
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED_MOU_ACCESS') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: error.message });
    }
  }

  static async acceptProposal(req: Request, res: Response) {
    try {
      const { mouId } = req.params;
      const adminUid = (req as any).student.firebaseUid;
      const adminCampus = (req as any).student.campus;

      const result = await MOUService.acceptMOUProposal(mouId, adminUid, adminCampus);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async suspendMOU(req: Request, res: Response) {
    try {
      const { mouId } = req.params;
      const adminUid = (req as any).student.firebaseUid;
      const adminCampus = (req as any).student.campus;

      const schema = z.object({
        reason: z.string().min(20, 'Reason must be at least 20 characters'),
        confirm: z.boolean().refine(v => v === true, {
          message: 'Suspending an MOU cancels all pending cross-campus swaps. Include confirm: true to proceed.'
        })
      });

      const validated = schema.parse(req.body);
      const result = await MOUService.suspendMOU(mouId, adminUid, adminCampus, validated.reason);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async renewMOU(req: Request, res: Response) {
    try {
      const { mouId } = req.params;
      const adminUid = (req as any).student.firebaseUid;
      const adminCampus = (req as any).student.campus;

      const schema = z.object({
        newExpiryDate: z.string().datetime()
      });

      const validated = schema.parse(req.body);
      const result = await MOUService.renewMOU(mouId, adminUid, adminCampus, validated.newExpiryDate);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransparencyLog(req: Request, res: Response) {
    try {
      const { mouId } = req.params;
      const adminCampus = (req as any).student.campus;
      const { cursor, limit } = req.query;

      // Extract partnerCampus from detail
      const detail = await MOUService.getMOUDetail(mouId, adminCampus);
      const partnerCampus = detail.mou.initiating_campus === adminCampus ? detail.mou.accepting_campus : detail.mou.initiating_campus;

      const log = await MOUService.getTransparencyLog(
        adminCampus, 
        partnerCampus, 
        cursor as string, 
        limit ? parseInt(limit as string) : 20
      );
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async requestExport(req: Request, res: Response) {
    try {
      const { mouId } = req.params;
      const adminCampus = (req as any).student.campus;

      // Generate PDF Job
      const jobId = await ExportService.generateMOUReport(adminCampus, mouId);
      res.json({ jobId, estimatedReadyIn: '30s' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
