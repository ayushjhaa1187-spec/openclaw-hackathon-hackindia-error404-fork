import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Validation middleware factory
 */
export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body, params, and query
      const data = {
        body: req.body,
        params: req.params,
        query: req.query,
      };

      const validated = await schema.parseAsync(data);
      
      // Replace request data with validated data
      req.body = validated.body || req.body;
      req.params = validated.params || req.params;
      req.query = validated.query || req.query;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.errors,
          },
        });
      }

      next(error);
    }
  };
}

/**
 * Sanitize HTML input
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize middleware (removes XSS vectors)
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeHtml(req.query[key]);
      }
    });
  }

  next();
}

/**
 * Example schema for creating a skill (use Zod)
 */
export const CreateSkillSchema = z.object({
  body: z.object({
    skill: z.string().min(1).max(255).trim(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    description: z.string().max(1000).trim().optional(),
  }),
});
