import { z } from 'zod';

export const ErrorReportSchema = z.object({
  errorMessage: z.string(),
  errorStack: z.string().optional(),
  componentStack: z.string().optional(),
  digest: z.string().optional(),
  url: z.string().optional(),
  timestamp: z.string().optional(),
  userAgent: z.string().optional(),
  type: z.enum(['unhandled', 'boundary', 'api_error']).optional().default('unhandled'),
});
