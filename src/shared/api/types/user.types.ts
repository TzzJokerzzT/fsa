/**
 * User Types - User profile related API types
 * Mirrors backend DTOs for type safety
 */

// User profile data
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// User profile with additional stats
export interface UserProfile extends User {
  architecturesCount?: number;
}

// Update user request
export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}
