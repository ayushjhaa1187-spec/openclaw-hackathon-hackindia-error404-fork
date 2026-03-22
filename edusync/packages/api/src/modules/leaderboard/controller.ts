import { Request, Response } from 'express';
import { LeaderboardService } from './service.js';

export class LeaderboardController {
  static async getCampusLeaderboard(req: Request, res: Response) {
    try {
      const campus = (req.query.campus as string) || (req as any).student.campus;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const data = await LeaderboardService.getCampusLeaderboard(campus, limit);
      
      // Get requesting student's position
      const myRank = await LeaderboardService.getStudentRank((req as any).student.uid, (req as any).student.campus);

      res.json({ 
        success: true, 
        data: { 
          ...data, 
          requestingStudentRank: myRank.rank,
          requestingStudentScore: myRank.karma,
          totalStudents: myRank.totalStudents
        } 
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getGlobalLeaderboard(req: Request, res: Response) {
    try {
      // Security Check: Cross-Campus enabled?
      const hasCrossCampus = (req as any).student.nexus?.crossCampusEnabled;
      if (!hasCrossCampus) {
        return res.status(403).json({ success: false, error: 'Cross-Campus Explorer is restricted for your institutional node.' });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const data = await LeaderboardService.getGlobalLeaderboard(limit);
      
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  static async getMyRank(req: Request, res: Response) {
    try {
      const uid = (req as any).student.uid;
      const campus = (req as any).student.campus;
      
      const data = await LeaderboardService.getStudentRank(uid, campus);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
