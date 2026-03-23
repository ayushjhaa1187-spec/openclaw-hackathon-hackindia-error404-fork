import * as Sentry from "@sentry/node";

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initSentry(app: any) {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN not set - error tracking disabled');
    return null;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    beforeSend(event: any) {
      // Filter out health check noise
      if (event.request?.url?.includes('/api/v1/health')) {
        return null;
      }

      // Redact sensitive data
      if (event.request?.cookies) {
        event.request.cookies = '[REDACTED]';
      }
      if (event.request?.headers?.authorization) {
        event.request.headers.authorization = '[REDACTED]';
      }

      return event;
    },
  });

  // Attach request handler (must be first middleware)
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  console.log('✅ Sentry error tracking initialized');
  return Sentry;
}

/**
 * Sentry error handler middleware (must be AFTER all routes)
 */
export function sentryErrorHandler(): any {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error: any) {
      // Report all 4xx and 5xx errors
      if (error.status) {
        return error.status >= 400;
      }
      return true;
    },
  });
}

/**
 * Capture custom events for business-level monitoring
 */
export function captureEvent(
  level: 'fatal' | 'error' | 'warning' | 'info',
  message: string,
  data?: Record<string, any>
) {
  Sentry.captureEvent({
    level,
    message,
    extra: data,
    timestamp: Math.floor(Date.now() / 1000),
  });
}

/**
 * Capture exceptions with optional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Set user context for better error attribution
 */
export function setUser(user: { id: string; email?: string; campus?: string }) {
  Sentry.setUser(user);
}

export default Sentry;
