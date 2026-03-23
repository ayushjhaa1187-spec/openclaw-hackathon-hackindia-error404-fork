import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../lib/redis.js';

/**
 * Global API rate limiter
 * 100 requests per minute per IP
 */
export const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rl:global:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => {
    // Skip rate limiting for health checks
    return req.path === '/api/v1/health';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true, // Only count failed attempts
  message: { error: { code: 'TOO_MANY_AUTH_ATTEMPTS', message: 'Too many login attempts' } },
  statusCode: 429,
  standardHeaders: true,
});

/**
 * Per-user rate limiter (requires authentication)
 * 1000 requests per hour per user
 */
export const userLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rl:user:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  keyGenerator: (req: any) => {
    // Use user ID if authenticated, fall back to IP
    return (req as any).user?.sub || req.ip || 'anonymous';
  },
  message: { error: { code: 'USER_RATE_LIMITED', message: 'User rate limit exceeded' } },
  statusCode: 429,
  standardHeaders: true,
});

/**
 * Strict limiter for resource-intensive endpoints
 * 10 requests per hour per user
 */
export const heavyOpLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rl:heavy:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req: any) => {
    return (req as any).user?.sub || req.ip || 'anonymous';
  },
  message: { error: { code: 'HEAVY_OP_LIMITED', message: 'Too many heavy operations' } },
  statusCode: 429,
});

/**
 * DDoS protection limiter (very aggressive)
 * 1000 requests per minute globally (circuit breaker)
 */
export const ddosProtection = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: 'rl:ddos:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  message: { error: { code: 'SERVICE_OVERLOADED', message: 'Service temporarily overloaded' } },
  statusCode: 503,
  standardHeaders: true,
  // Skip on success to only trigger on errors
  skip: (req: any, res: any) => res.statusCode < 400,
});
