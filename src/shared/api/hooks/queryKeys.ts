/**
 * Query Keys - Centralized query key management
 * Single Responsibility: Define all query keys for cache management
 *
 * Follows TanStack Query best practices:
 * - Hierarchical key structure for targeted invalidation
 * - Factory pattern for type safety
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },

  // Architectures
  architectures: {
    all: ['architectures'] as const,
    lists: () => [...queryKeys.architectures.all, 'list'] as const,
    list: (params?: { page?: number; limit?: number }) =>
      [...queryKeys.architectures.lists(), params] as const,
    details: () => [...queryKeys.architectures.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.architectures.details(), id] as const,
  },
} as const;
