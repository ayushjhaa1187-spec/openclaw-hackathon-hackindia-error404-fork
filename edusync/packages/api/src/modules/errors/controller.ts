import { Request, Response } from 'express';
import { ErrorReportService } from './service.js';
import { ErrorReportSchema } from './schema.js';

export class ErrorReportController {
  static async reportError(req: Request, res: Response) {
    try {
      // Validate request
      const parsed = ErrorReportSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_ERROR_REPORT', message: 'Invalid error report format' },
        });
      }

      // Store error report
      const errorId = await ErrorReportService.storeErrorReport({
        ...parsed.data,
        userId: req.student?.uid || null,
        ipAddress: req.ip,
      });

      // Check error severity
      const severity = ErrorReportService.calculateSeverity(parsed.data.errorMessage);
      
      // Alert if critical (simulated)
      if (severity === 'critical') {
        process.emitWarning(`🚨 CRITICAL SYSTEM ERROR REPORTED [ID: ${errorId}]: ${parsed.data.errorMessage}`);
      }

      res.status(201).json({
        success: true,
        data: { errorId },
        meta: { severity },
      });
    } catch (error: any) {
      console.error('ErrorReportController error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_REPORT_FAILED', message: error.message },
      });
    }
  }

  static async listErrorReports(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const severity = req.query.severity as string;
      const resolved = req.query.resolved === 'true';

      const reports = await ErrorReportService.listErrorReports({
        limit,
        offset,
        severity,
        resolved,
      });

      res.json({
        success: true,
        data: reports,
        meta: { pagination: { limit, offset } },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'LIST_FAILED', message: error.message },
      });
    }
  }

  static async markResolved(req: Request, res: Response) {
    try {
      const { errorId } = req.params;
      const { notes } = req.body;

      await ErrorReportService.markResolved(errorId, {
        notes,
        resolvedBy: req.student?.uid,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
