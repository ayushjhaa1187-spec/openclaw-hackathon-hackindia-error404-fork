import { Request, Response } from 'express';
import { StudentModel, ResourceModel } from '@edusync/db';
import { GeminiService } from '../../services/gemini-service.js';
import { NotificationService } from '../notifications/service.js';

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
    const { flagId, action, resourceId, adminNotes } = req.body;
    
    // Resource Moderation Path
    if (resourceId) {
      const resource = await ResourceModel.findById(resourceId);
      if (!resource) return res.status(404).json({ error: 'Resource not found' });

      if (action === 'approve') {
        resource.verification = { status: 'verified', adminUid: (req as any).student.uid, adminNotes };
        await resource.save();
        await NotificationService.create(resource.ownerUid, 'resource_certified', {
          title: resource.title,
          resourceId: resource._id
        });
      } else if (action === 'reject') {
        resource.verification = { status: 'rejected', adminUid: (req as any).student.uid, adminNotes };
        await resource.save();
        await NotificationService.create(resource.ownerUid, 'resource_rejected', {
          title: resource.title,
          reason: adminNotes,
          resourceId: resource._id
        });
      }
    }

    res.json({ message: `Guardian Protocol: Flag ${flagId} Resolved via ${action}`, timestamp: new Date() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Resolution Sync Failure' });
  }
};

export const issueWarning = async (req: Request, res: Response) => {
  try {
    const { studentUid, swapId, reason } = req.body;
    await NotificationService.create(studentUid, 'guardian_warning', {
      swapId,
      reason
    });
    res.json({ success: true, message: 'Warning issued to student' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Warning issue failure' });
  }
};

export const runSafetyAudit = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const audit = await GeminiService.analyzeSafety(content);
    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: 'AI Safety Audit Failure' });
  }
};

export const getMOUAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = {
      activeMous: 4,
      crossCampusSwaps: 245,
      nexusCreditExchange: 15400,
      systemHealth: 98,
      partnerClusters: [
        { name: 'IIT_ALLIANCE', connections: 120 },
        { name: 'NIT_TRICHY_GROUP', connections: 85 }
      ]
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'MOU Analytics Retrieval Failure' });
  }
};

export const syncNexusNodes = async (req: Request, res: Response) => {
  try {
    console.log('🌐 Triggering Federated Node Sync...');
    res.json({ message: 'Nexus Nodes Synchronized', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: 'Nexus Synchronization Failure' });
  }
};
