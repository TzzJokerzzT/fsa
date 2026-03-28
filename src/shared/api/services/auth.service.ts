/**
 * Auth Service - Authentication API endpoints
 * Single Responsibility: Handle auth-related API calls
 */

import { api } from '@/shared/api/client';
import type {
  ApiMessage,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/shared/api/types';

const AUTH_BASE = '/auth';

export const authService = {
  /**
   * Register a new user
   */
  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>(`${AUTH_BASE}/register`, data),

  /**
   * Login with email and password
   */
  login: (data: LoginRequest) =>
    api.post<LoginResponse>(`${AUTH_BASE}/login`, data),

  /**
   * Refresh access token using refresh token
   */
  refreshToken: (data: RefreshTokenRequest) =>
    api.post<RefreshTokenResponse>(`${AUTH_BASE}/refresh`, data),

  /**
   * Logout current user (invalidates refresh token)
   */
  logout: () => api.post<ApiMessage>(`${AUTH_BASE}/logout`),
};
