import { ErrorReportModel } from '@edusync/db';

export class ErrorReportService {
  static async storeErrorReport(data: any) {
    const report = new ErrorReportModel({
      errorMessage: data.errorMessage,
      errorStack: data.errorStack,
      componentStack: data.componentStack,
      type: data.type || 'unhandled',
      url: data.url,
      timestamp: new Date(),
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      severity: this.calculateSeverity(data.errorMessage),
      resolved: false,
    });

    await report.save();
    return report._id.toString();
  }

  static calculateSeverity(message: string): 'critical' | 'high' | 'medium' | 'low' {
    const msg = message.toLowerCase();
    if (msg.includes('auth') || msg.includes('permission') || msg.includes('token')) return 'high';
    if (msg.includes('database') || msg.includes('connection') || msg.includes('mongo') || msg.includes('mongoerror')) return 'critical';
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('abort')) return 'medium';
    return 'low';
  }

  static async listErrorReports(filters: any) {
    const query: any = { resolved: filters.resolved ?? false };
    if (filters.severity) query.severity = filters.severity;

    return await ErrorReportModel.find(query)
      .sort({ timestamp: -1 })
      .skip(filters.offset)
      .limit(filters.limit);
  }

  static async markResolved(errorId: string, metadata: any) {
    await ErrorReportModel.findByIdAndUpdate(errorId, {
      resolved: true,
      resolvedAt: new Date(),
      ...metadata,
    });
  }
}
