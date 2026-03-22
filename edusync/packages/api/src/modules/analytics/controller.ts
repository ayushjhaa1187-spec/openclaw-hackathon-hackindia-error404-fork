import { Request, Response } from 'express';
import { AnalyticsService } from './service.js';
import { ExportService } from './export.service.js';

export class AnalyticsController {
  static async getOverview(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const overview = await AnalyticsService.getOverview(campus);
      res.json(overview);
    } catch (error) {
      console.error('Analytics Overview Error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics overview' });
    }
  }

  static async getGroupOverview(req: Request, res: Response) {
    try {
      // Super Admin check could be here, or in middleware
      const { collegeGroupId } = req.query;
      if (!collegeGroupId) return res.status(400).json({ error: 'collegeGroupId is required' });

      const overview = await AnalyticsService.getGroupOverview(collegeGroupId as string);
      res.json(overview);
    } catch (error) {
      console.error('Group Analytics Error:', error);
      res.status(500).json({ error: 'Failed to fetch group analytics' });
    }
  }

  static async getTrends(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const { range = '30d' } = req.query;
      
      const [swaps, vault] = await Promise.all([
        AnalyticsService.getSwapTrend(campus, range as any),
        AnalyticsService.getVaultMetrics(campus, range as any)
      ]);

      res.json({ swaps, vault });
    } catch (error) {
      console.error('Analytics Trends Error:', error);
      res.status(500).json({ error: 'Failed to fetch trend data' });
    }
  }

  static async getKarmaFlow(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const { range = '30d' } = req.query;
      const flow = await AnalyticsService.getKarmaFlow(campus, range as any);
      res.json(flow);
    } catch (error) {
      console.error('Analytics Karma Flow Error:', error);
      res.status(500).json({ error: 'Failed to fetch karma flow' });
    }
  }

  static async exportROI(req: Request, res: Response) {
    try {
      const campus = (req as any).student.campus;
      const adminUid = (req as any).student.uid;
      await ExportService.requestReport(campus, adminUid);
      res.json({ message: 'ROI Export request initiated. You will be notified via Socket.io when ready.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to initiate export' });
    }
  }
}
