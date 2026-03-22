import { Request, Response } from 'express';
import { NotificationService } from './service.js';

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const uid = (req as any).student.uid;
      const { type = 'unread', limit = '20', cursor } = req.query;
      
      let data;
      if (type === 'unread') {
        data = await NotificationService.getUnread(uid, parseInt(limit as string), cursor as string);
      } else {
        data = await NotificationService.getHistory(uid, parseInt(limit as string), cursor as string);
      }

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markRead(req: Request, res: Response) {
    try {
      const uid = (req as any).student.uid;
      const { id } = req.params;

      const notification = await NotificationService.markRead(uid, id);
      res.json({ success: true, data: { notification } });
    } catch (error: any) {
      // Reviewer requirement: 404 for unauthorized/notfound to prevent ID leakage
      if (error.message === 'Notification not found') {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markAllRead(req: Request, res: Response) {
    try {
      const uid = (req as any).student.uid;
      const updatedCount = await NotificationService.markAllRead(uid);
      res.json({ success: true, data: { updatedCount } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
