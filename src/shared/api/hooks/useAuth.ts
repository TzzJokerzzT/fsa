/**
 * Auth Hooks - TanStack Query hooks for authentication
 * Single Responsibility: Provide reactive auth data fetching and mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useArchitectureStore, useAuthStore } from '@/app/store';
import { getApiErrorMessage } from '@/shared/api/client';
import { authService } from '@/shared/api/services';
import type { LoginRequest, RegisterRequest } from '@/shared/api/types';
import { queryKeys } from './queryKeys';

/**
 * Hook for user login
 * - Stores tokens and user data on success
 * - Provides loading, error, and success states
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // Debug: what does the backend actually return?
      console.log('[useLogin] response keys:', Object.keys(response));
      console.log(
        '[useLogin] response.accessToken:',
        typeof response.accessToken,
        response.accessToken?.substring(0, 20),
      );
      console.log(
        '[useLogin] response.refreshToken:',
        typeof response.refreshToken,
        response.refreshToken?.substring(0, 20),
      );
      console.log('[useLogin] response.user:', response.user);

      // Store auth data — backend returns flat { accessToken, refreshToken, user }
      setAuth(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      console.log(
        '[useLogin] After setAuth - store accessToken:',
        useAuthStore.getState().accessToken?.substring(0, 20),
      );

      // Invalidate any cached user data
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.architectures.all });

      // Navigate to builder
      navigate('/builder');
    },
    onError: (error) => {
      console.error('Login failed:', getApiErrorMessage(error));
    },
  });
}

/**
 * Hook for user registration
 * - Creates new user account
 * - Does NOT auto-login (user should login after registration)
 */
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      // Navigate to login page
      navigate('/login');
    },
    onError: (error) => {
      console.error('Registration failed:', getApiErrorMessage(error));
    },
  });
}

/**
 * Hook for user logout
 * - Clears auth state
 * - Clears local architectures from localStorage
 * - Invalidates all queries
 * - Redirects to home
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout: clearAuth } = useAuthStore();
  const clearAllArchitectures = useArchitectureStore(
    (s) => s.clearAllArchitectures,
  );

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      clearAllArchitectures();
      queryClient.clear();
      navigate('/');
    },
    onError: () => {
      // Even if API call fails, clear local state
      clearAuth();
      clearAllArchitectures();
      queryClient.clear();
      navigate('/');
    },
  });
}
