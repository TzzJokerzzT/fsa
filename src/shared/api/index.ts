/**
 * API Module - Barrel export
 *
 * Architecture:
 * - types/    : TypeScript types mirroring backend DTOs
 * - client/   : Axios client with interceptors
 * - services/ : API endpoint functions (grouped by domain)
 * - hooks/    : TanStack Query hooks for data fetching
 */

// Client
export { api, apiClient, getApiErrorMessage, isHttpError } from './client';
// Hooks
export {
  queryKeys,
  useArchitecture,
  useArchitectures,
  useAutoSaveArchitecture,
  useCreateArchitecture,
  useDeleteAccount,
  useDeleteArchitecture,
  useInfiniteArchitectures,
  useLogin,
  useLogout,
  useRegister,
  useUpdateArchitecture,
  useUpdateProfile,
  useUserProfile,
} from './hooks';

// Services
export { architectureService, authService, userService } from './services';
// Types
export * from './types';
