/**
 * User Hooks - TanStack Query hooks for user profile
 * Single Responsibility: Provide reactive user data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store';
import { getApiErrorMessage } from '@/shared/api/client';
import { userService } from '@/shared/api/services';
import type { UpdateUserRequest } from '@/shared/api/types';
import { queryKeys } from './queryKeys';

/**
 * Hook for fetching current user's profile
 * - Only fetches when authenticated
 * - Caches for 5 minutes
 */
export function useUserProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => userService.getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for updating current user's profile
 * - Updates cache optimistically
 * - Syncs auth store with new user data
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateMe(data),
    onSuccess: (updatedUser) => {
      // Update cache
      queryClient.setQueryData(queryKeys.user.profile(), updatedUser);

      // Sync auth store
      setUser({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      });
    },
    onError: (error) => {
      console.error('Profile update failed:', getApiErrorMessage(error));
    },
  });
}

/**
 * Hook for deleting user account
 * - Clears all auth state
 * - Navigates to home
 */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => userService.deleteMe(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('Account deletion failed:', getApiErrorMessage(error));
    },
  });
}
