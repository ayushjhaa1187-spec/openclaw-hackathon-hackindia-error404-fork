import { CollegeGroupModel, StudentModel, CampusSettingsModel } from '@edusync/db';
import { AnalyticsService } from '../analytics/service.js';

export class SuperAdminService {
  static async getDashboardOverview() {
    // 1. Global Metrics
    const totalStudents = await StudentModel.countDocuments();
    // In a real app, this would be more complex and aggregated from snapshots
    // For MVP, we derive from existing collections
    const campusDocs = await CampusSettingsModel.find({}, 'campusId name enabled status');
    
    // 2. Format Campuses for Super Admin
    const campuses = await Promise.all(campusDocs.map(async (c: any) => {
      const studentCount = await StudentModel.countDocuments({ campusId: c.campusId });
      return {
        id: c.campusId,
        name: c.name,
        enabled: c.enabled,
        status: 'online', // Mocked health
        studentCount,
        healthScore: 0.95 // Mocked for S19
      };
    }));

    // 3. College Groups
    const collegeGroups = await CollegeGroupModel.find({ status: 'active' });

    return {
      totalStudents,
      activeSwaps: 45, // Mocked overall
      crossCampusSwaps: 12, // Mocked overall
      systemHealth: 99.2, // Mocked overall
      campuses,
      collegeGroups,
      pendingActions: [
        { id: '1', type: 'MOU_PROPOSAL', description: 'IIT Jammu ↔ IIT Delhi MOU await approval', createdAt: new Date() }
      ]
    };
  }

  static async getCollegeGroups() {
    return await CollegeGroupModel.find({ status: 'active' });
  }

  static async createCollegeGroup(data: { name: string, members: string[], createdBy: string }) {
    const group = await CollegeGroupModel.create(data);
    return group;
  }

  static async dissolveCollegeGroup(groupId: string) {
    return await CollegeGroupModel.findOneAndUpdate(
      { collegeGroupId: groupId },
      { status: 'dissolved', dissolvedAt: new Date() },
      { new: true }
    );
  }

  static async getGlobalAnalytics() {
    // Aggregates across ALL groups
    const groups = await CollegeGroupModel.find({ status: 'active' });
    const byGroup = await Promise.all(groups.map(async (g: any) => {
      const metrics = await AnalyticsService.getGroupOverview(g.collegeGroupId);
      return {
        groupId: g.collegeGroupId,
        name: g.name,
        ...metrics
      };
    }));

    return {
      crossCampusMetrics: {
        total: 156,
        successRate: 0.94,
        avgCompletionDays: 8,
        trend: 12
      },
      byGroup,
      mouHealthScores: [
        { pair: 'IIT JAMMU ↔ IIT DELHI', score: 0.95 },
        { pair: 'IIT DELHI ↔ IIT BOMBAY', score: 0.88 }
      ]
    };
  }
}
