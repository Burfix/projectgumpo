import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only in production
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,

  // Server-specific config
  integrations: [
    Sentry.prismaIntegration(),
  ],

  beforeSend(event) {
    // Filter health checks
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }

    return event;
  },
});
