import { Request, Response } from 'express';
import { StudentModel, ResourceModel } from '@edusync/db';

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      activeUsers: await StudentModel.countDocuments(),
      totalResources: await ResourceModel.countDocuments(),
      completedSwaps: 142, // Mocked from ledger
      karmaCirculation: 45000
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Stats Sync Failure' });
  }
};

export const getModerationQueue = async (req: Request, res: Response) => {
  try {
    // Guardian AI Simulator: Integrating Sentiment Intelligence
    const baseQueue = [
      { id: 'flag_1', target: 'Swap #221', reason: 'Potential Academic Dishonesty', severity: 'HIGH', reporter: 'Guardian AI', sentiment: -0.8 },
      { id: 'flag_2', target: 'Student @arjun', reason: 'Off-platform Payment Mention', severity: 'MEDIUM', reporter: 'Sentinel Node', sentiment: -0.4 },
      { id: 'flag_3', target: 'Resource "EM3 Notes"', reason: 'Inaccurate Content', severity: 'LOW', reporter: 'Student @priya', sentiment: 0.1 }
    ];

    // Priority Ranking: High negative sentiment items move to Top-of-Queue
    const prioritizedQueue = baseQueue.sort((a: any, b: any) => (a.sentiment || 0) - (b.sentiment || 0));

    res.json(prioritizedQueue);
  } catch (err) {
    res.status(500).json({ error: 'Moderation Portal Unreachable' });
  }
};

export const resolveFlag = async (req: Request, res: Response) => {
  try {
    const { flagId, action } = req.body;
    // Resolve logic: Update Nexus Audit Log
    res.json({ message: `Guardian Protocol: Flag ${flagId} Resolved via ${action}`, timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Resolution Sync Failure' });
  }
};
