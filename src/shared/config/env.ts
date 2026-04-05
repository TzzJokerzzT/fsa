/**
 * Environment configuration
 * Single Responsibility: Centralize environment variables
 */

// Safely access import.meta.env (may be undefined during SSR or build)
const getEnvVar = (key: string, fallback: string): string => {
  try {
    // @ts-expect-error - import.meta.env may not exist in all contexts
    return import.meta.env?.[key] ?? fallback;
  } catch {
    return fallback;
  }
};

const getEnvBool = (key: string, fallback: boolean): boolean => {
  try {
    // @ts-expect-error - import.meta.env may not exist in all contexts
    const value = import.meta.env?.[key];
    return value !== undefined ? Boolean(value) : fallback;
  } catch {
    return fallback;
  }
};

export const env = {
  // API_URL: getEnvVar('VITE_API_URL', 'http://localhost:3000/api'),
  API_URL: getEnvVar(
    'VITE_API_URL',
    'https://fsa-backend-2ks0.onrender.com/api',
  ),
  NODE_ENV: getEnvVar('MODE', 'development'),
  IS_DEV: getEnvBool('DEV', true),
  IS_PROD: getEnvBool('PROD', false),
} as const;
