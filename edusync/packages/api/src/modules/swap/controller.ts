import { Request, Response } from 'express';
import { SwapService } from './service.js';

export class SwapController {
  static async proposeSwap(req: Request, res: Response) {
    try {
      const student = (req as any).student;
      const swap = await SwapService.proposeSwap({
        ...req.body,
        requesterUid: student.uid,
        requesterCampus: student.campus
      });
      res.status(201).json({ success: true, data: swap });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async acceptSwap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = (req as any).student;
      const swap = await SwapService.acceptSwap(id, student.uid);
      res.json({ success: true, data: swap });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async rejectSwap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = (req as any).student;
      const swap = await SwapService.rejectSwap(id, student.uid);
      res.json({ success: true, data: swap });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async completeSwap(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = (req as any).student;
      const swap = await SwapService.completeSwap(id, student.uid);
      res.json({ success: true, data: swap });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getSwaps(req: Request, res: Response) {
    try {
      const student = (req as any).student;
      const { status, limit } = req.query;
      const swaps = await SwapService.getSwapsByUser(
        student.uid, 
        status as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json({ success: true, data: swaps });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSwapById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = (req as any).student;
      const swap = await SwapService.getSwapById(id, student.uid);
      res.json({ success: true, data: swap });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async requestCancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = (req as any).student;
      const swap = await SwapService.requestCancel(id, student.uid);
      res.json({ success: true, data: swap });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async adminOverride(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      const student = (req as any).student;
      const swap = await SwapService.adminOverrideSwap(id, action, student.uid, notes);
      res.json({ success: true, data: swap });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
