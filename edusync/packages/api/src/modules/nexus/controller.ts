import { Request, Response } from 'express';
import { NexusService } from './service.js';

export class NexusController {
  static async getCrossCampusProfile(req: Request, res: Response) {
    try {
      const { uid } = req.params;
      const student = (req as any).student;
      const activeMOU = (req as any).activeMOU;

      const profile = await NexusService.getCrossCampusProfile(uid, student, activeMOU);
      res.json({ success: true, data: profile });
    } catch (err: any) {
      const status = err.message === 'STUDENT_NOT_FOUND' ? 404 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  static async getCrossCampusExplore(req: Request, res: Response) {
    try {
      const student = (req as any).student;
      const { q = '', limit = 20, cursor } = req.query;

      const results = await NexusService.getCrossCampusExplore(
        student, 
        q as string, 
        parseInt(limit as string), 
        cursor as string
      );
      res.json({ success: true, data: results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getActiveMOUPartners(req: Request, res: Response) {
    try {
      const student = (req as any).student;
      const partners = await NexusService.getActiveMOUPartners(student);
      res.json({ success: true, data: partners });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
