import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set sampling rate for profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only in production
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Innocuous errors
    'ResizeObserver loop limit exceeded',
  ],

  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }
    
    // Don't send events for specific routes
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }

    return event;
  },
});
