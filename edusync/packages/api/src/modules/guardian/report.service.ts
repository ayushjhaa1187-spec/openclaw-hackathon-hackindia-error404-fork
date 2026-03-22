import { FlagModel } from '@edusync/db';

export class ReportService {
  /**
   * Submit a manual report for a platform entity (message, resource, student profile).
   */
  static async submitReport(input: {
    reporterUid: string;
    targetType: 'message' | 'resource' | 'student';
    targetId: string;
    campus: string;
    description: string;
  }) {
    // 1. Anti-abuse: Check if a pending flag already exists for this target
    const existing = await FlagModel.findOne({
      sourceEntityId: input.targetId,
      status: 'pending',
      detectionMethod: 'manual_report'
    });

    if (existing) {
      console.log(`ℹ️ [ReportService] Duplicate report for ${input.targetId}. Merging info.`);
      // Optionally append description to existing flag if needed
      return existing;
    }

    // 2. Create Flag
    const flag = await FlagModel.create({
      flagType: this.mapTargetToFlagType(input.targetType),
      severity: 'medium', // Manual reports start as medium
      sourceEntityId: input.targetId,
      sourceEntityType: this.mapTargetToSourceType(input.targetType),
      involvedUids: [], // Logic to find target student UID based on targetId would go here
      campus: input.campus,
      flaggedContent: `[REPORTED BY ${input.reporterUid}] ${input.description}`,
      detectionMethod: 'manual_report',
      status: 'pending'
    });

    return flag;
  }

  private static mapTargetToFlagType(type: string) {
    if (type === 'message') return 'chat_message';
    if (type === 'resource') return 'resource_content';
    return 'profile_bio';
  }

  private static mapTargetToSourceType(type: string) {
    if (type === 'message') return 'swap_room';
    if (type === 'resource') return 'resource';
    return 'student_profile';
  }
}
