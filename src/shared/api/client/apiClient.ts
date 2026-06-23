/**
 * Axios API Client - Centralized HTTP client with interceptors
 * Single Responsibility: HTTP communication with automatic auth handling
 *
 * Features:
 * - Automatic access token injection
 * - Automatic token refresh on 401
 * - Request/response error handling
 * - Request queue during token refresh
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/app/store/auth.store';
import type { ApiError, RefreshTokenResponse } from '@/shared/api/types';
import { env } from '@/shared/config/env';

// Request queue for handling concurrent requests during token refresh
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

let isRefreshing = false;
let requestQueue: QueuedRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  for (const request of requestQueue) {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    }
  }
  requestQueue = [];
};

/**
 * Create configured axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${env.API_URL}/api`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken } = useAuthStore.getState();

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - handle errors and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        const { refreshToken, logout, setTokens } = useAuthStore.getState();

        // No refresh token available - logout
        if (!refreshToken) {
          logout();
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            requestQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          const response = await axios.post<RefreshTokenResponse>(
            `${env.API_URL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          );

          const newTokens = response.data;
          setTokens({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
          });

          // Process queued requests with new token
          processQueue(null, newTokens.accessToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }

          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout and reject all queued requests
          processQueue(new Error('Token refresh failed'), null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Return formatted error
      return Promise.reject(error);
    },
  );

  return client;
};

// Singleton instance
export const apiClient = createApiClient();

/**
 * Type-safe API request helpers
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

/**
 * Extract error message from API error response
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.error || error.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Check if error is a specific HTTP status
 */
export const isHttpError = (error: unknown, status: number): boolean => {
  return axios.isAxiosError(error) && error.response?.status === status;
};
