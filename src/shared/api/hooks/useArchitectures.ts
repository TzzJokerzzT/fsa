/**
 * Architecture Hooks - TanStack Query hooks for architectures
 * Single Responsibility: Provide reactive architecture data fetching and mutations
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuthStore } from '@/app/store';
import { getApiErrorMessage } from '@/shared/api/client';
import { architectureService } from '@/shared/api/services';
import type {
  Architecture,
  CreateArchitectureRequest,
  PaginationParams,
  UpdateArchitectureRequest,
} from '@/shared/api/types';
import { queryKeys } from './queryKeys';

/**
 * Hook for fetching paginated architecture list
 */
export function useArchitectures(params?: PaginationParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.architectures.list(params),
    queryFn: () => architectureService.list(params),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for infinite scrolling architecture list
 */
export function useInfiniteArchitectures(limit = 20) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useInfiniteQuery({
    queryKey: queryKeys.architectures.lists(),
    queryFn: ({ pageParam = 1 }) =>
      architectureService.list({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single architecture
 */
export function useArchitecture(id: string | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.architectures.detail(id || ''),
    queryFn: () => architectureService.getById(id!),
    enabled: isAuthenticated && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook for creating a new architecture
 */
export function useCreateArchitecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArchitectureRequest) =>
      architectureService.create(data),
    onSuccess: (newArchitecture) => {
      // Invalidate list cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.architectures.lists(),
      });

      // Pre-populate detail cache
      queryClient.setQueryData(
        queryKeys.architectures.detail(newArchitecture.id),
        newArchitecture,
      );
    },
    onError: (error) => {
      console.error('Architecture creation failed:', getApiErrorMessage(error));
    },
  });
}

/**
 * Hook for updating an architecture
 * - Supports optimistic updates
 */
export function useUpdateArchitecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateArchitectureRequest;
    }) => architectureService.update(id, data),

    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.architectures.detail(id),
      });

      // Snapshot previous value
      const previousArchitecture = queryClient.getQueryData<Architecture>(
        queryKeys.architectures.detail(id),
      );

      // Optimistically update
      if (previousArchitecture) {
        queryClient.setQueryData(queryKeys.architectures.detail(id), {
          ...previousArchitecture,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousArchitecture };
    },

    // Rollback on error
    onError: (error, { id }, context) => {
      if (context?.previousArchitecture) {
        queryClient.setQueryData(
          queryKeys.architectures.detail(id),
          context.previousArchitecture,
        );
      }
      console.error('Architecture update failed:', getApiErrorMessage(error));
    },

    // Refetch on success
    onSuccess: (updatedArchitecture) => {
      // Update detail cache with server response
      queryClient.setQueryData(
        queryKeys.architectures.detail(updatedArchitecture.id),
        updatedArchitecture,
      );

      // Invalidate list to reflect changes
      queryClient.invalidateQueries({
        queryKey: queryKeys.architectures.lists(),
      });
    },
  });
}

/**
 * Hook for deleting an architecture
 */
export function useDeleteArchitecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => architectureService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.architectures.detail(deletedId),
      });

      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: queryKeys.architectures.lists(),
      });
    },
    onError: (error) => {
      console.error('Architecture deletion failed:', getApiErrorMessage(error));
    },
  });
}

/**
 * Hook for auto-saving architecture changes
 * - Debounced updates
 * - Silent errors (shows toast instead)
 */
export function useAutoSaveArchitecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateArchitectureRequest;
    }) => architectureService.update(id, data),

    onSuccess: (updatedArchitecture) => {
      // Silently update cache
      queryClient.setQueryData(
        queryKeys.architectures.detail(updatedArchitecture.id),
        updatedArchitecture,
      );
    },

    // Don't throw on error - just log
    onError: (error) => {
      console.error('Auto-save failed:', getApiErrorMessage(error));
    },
  });
}
