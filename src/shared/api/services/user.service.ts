/**
 * User Service - User profile API endpoints
 * Single Responsibility: Handle user-related API calls
 */

import { api } from '@/shared/api/client';
import type {
  ApiMessage,
  UpdateUserRequest,
  UserProfile,
} from '@/shared/api/types';

const USERS_BASE = '/users';

export const userService = {
  /**
   * Get current user's profile
   */
  getMe: () => api.get<UserProfile>(`${USERS_BASE}/me`),

  /**
   * Update current user's profile
   */
  updateMe: (data: UpdateUserRequest) =>
    api.patch<UserProfile>(`${USERS_BASE}/me`, data),

  /**
   * Delete current user's account
   */
  deleteMe: () => api.delete<ApiMessage>(`${USERS_BASE}/me`),
};
