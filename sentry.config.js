/** @type {import('@sentry/nextjs').SentryWebpackPluginOptions} */
const sentryWebpackPluginOptions = {
  // Suppress all Sentry CLI logs
  silent: true,
  
  // Optional: Organization and project in Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

/** @type {import('@sentry/nextjs').NextConfig} */
const sentryConfig = {
  // Optional: Hide source maps from bundle
  hideSourceMaps: true,
  
  // Optional: Disable Sentry during development
  disableClientWebpackPlugin: process.env.NODE_ENV !== 'production',
  disableServerWebpackPlugin: process.env.NODE_ENV !== 'production',
};

module.exports = { sentryWebpackPluginOptions, sentryConfig };
