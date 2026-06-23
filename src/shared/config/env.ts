/**
 * Environment configuration
 * Single Responsibility: Centralize environment variables
 *
 * import.meta.env.* values are injected at build time by rspack DefinePlugin.
 * In development (rspack dev): API_URL = '' (proxy handles /api requests)
 * In production: API_URL = 'https://fsa-backend.vercel.app'
 */

export const env = {
  API_URL: import.meta.env.API_URL ?? 'https://fsa-backend.vercel.app',
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
