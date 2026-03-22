import { Request, Response } from 'express';
import { SuperAdminService } from './service.js';
import { z } from 'zod';

const CollegeGroupSchema = z.object({
  name: z.string().min(3),
  members: z.array(z.string().min(3)).min(1)
});

export class SuperAdminController {
  static async getDashboard(req: Request, res: Response) {
    const data = await SuperAdminService.getDashboardOverview();
    res.json(data);
  }

  static async getCollegeGroups(req: Request, res: Response) {
    const groups = await SuperAdminService.getCollegeGroups();
    res.json(groups);
  }

  static async createCollegeGroup(req: Request, res: Response) {
    const data = CollegeGroupSchema.parse(req.body);
    // Ensure unique members
    const uniqueMembers = [...new Set(data.members)];
    const group = await SuperAdminService.createCollegeGroup({ ...data, members: uniqueMembers, createdBy: req.student?.uid || 'admin-root' });
    res.json(group);
  }

  static async getAnalytics(req: Request, res: Response) {
    const analytics = await SuperAdminService.getGlobalAnalytics();
    res.json(analytics);
  }

  static async dissolveCollegeGroup(req: Request, res: Response) {
    const { groupId } = req.params;
    const dissolved = await SuperAdminService.dissolveCollegeGroup(groupId);
    res.json(dissolved);
  }
}
