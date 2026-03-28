/**
 * Architecture Sync Hook - Synchronizes local architecture store with backend API
 * Single Responsibility: Bridge between local Zustand store and remote API
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useArchitectureStore, useIsAuthenticated } from '@/app/store';
import {
  useArchitectures,
  useCreateArchitecture,
  useDeleteArchitecture,
  useUpdateArchitecture,
} from '@/shared/api/hooks';
import { queryKeys } from '@/shared/api/hooks/queryKeys';
import type {
  Architecture as ApiArchitecture,
  CreateArchitectureRequest,
  UpdateArchitectureRequest,
} from '@/shared/api/types';
import type { Architecture, ArchitectureId } from '@/shared/types';

/**
 * Converts API architecture format to local store format
 */
function apiToLocal(api: ApiArchitecture): Architecture {
  return {
    id: api.id,
    name: api.name,
    type: api.type,
    description: api.description,
    nodes: api.nodes,
    edges: api.edges,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  };
}

/**
 * Converts local store architecture to API format for creation
 */
function localToCreateRequest(local: Architecture): CreateArchitectureRequest {
  return {
    name: local.name,
    type: local.type,
    description: local.description,
    nodes: local.nodes,
    edges: local.edges,
  };
}

/**
 * Converts local store architecture to API format for updates
 */
function localToUpdateRequest(local: Architecture): UpdateArchitectureRequest {
  return {
    name: local.name,
    type: local.type,
    description: local.description,
    nodes: local.nodes,
    edges: local.edges,
  };
}

/**
 * Hook to sync architecture store with backend
 * - Fetches architectures from API on mount (when authenticated)
 * - Provides methods to save/delete architectures to API
 */
export function useArchitectureSync() {
  const isAuthenticated = useIsAuthenticated();
  const queryClient = useQueryClient();

  // Local store actions
  const architectures = useArchitectureStore((s) => s.architectures);
  const currentArchitectureId = useArchitectureStore(
    (s) => s.currentArchitectureId,
  );
  const setCurrentArchitecture = useArchitectureStore(
    (s) => s.setCurrentArchitecture,
  );

  // API hooks
  const { data: apiArchitectures, isLoading, isError } = useArchitectures();
  const createMutation = useCreateArchitecture();
  const updateMutation = useUpdateArchitecture();
  const deleteMutation = useDeleteArchitecture();

  // Track if initial sync has happened
  const hasSyncedRef = useRef(false);

  // Sync API architectures to local store on initial load
  useEffect(() => {
    if (!isAuthenticated || hasSyncedRef.current || !apiArchitectures?.data) {
      return;
    }

    hasSyncedRef.current = true;

    // Import API architectures to local store
    const importFromApi = useArchitectureStore.getState().importFromApi;
    if (importFromApi) {
      const localArchitectures = apiArchitectures.data.map(apiToLocal);
      importFromApi(localArchitectures);
    }
  }, [isAuthenticated, apiArchitectures]);

  // Reset sync flag on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated]);

  /**
   * Save a local architecture to the API
   * Creates if new (no matching API ID), updates if existing
   */
  const saveToApi = useCallback(
    async (architectureId: ArchitectureId) => {
      const architecture = architectures[architectureId];
      if (!architecture) {
        console.error('Architecture not found:', architectureId);
        return null;
      }

      // Check if this architecture exists in API
      // First check the detail cache, then check if it's in the list of loaded architectures
      const existingInDetailCache = queryClient.getQueryData<ApiArchitecture>(
        queryKeys.architectures.detail(architectureId),
      );

      // Also check if it exists in the architectures list (API architectures have server-generated IDs)
      const existingInList = apiArchitectures?.data?.find(
        (arch) => arch.id === architectureId,
      );

      const existsInApi = existingInDetailCache || existingInList;

      try {
        if (existsInApi) {
          // Update existing
          const result = await updateMutation.mutateAsync({
            id: architectureId,
            data: localToUpdateRequest(architecture),
          });
          return result;
        } else {
          // Create new
          const result = await createMutation.mutateAsync(
            localToCreateRequest(architecture),
          );

          // Update local store with the new API ID if different
          if (result.id !== architectureId) {
            const replaceArchitectureId =
              useArchitectureStore.getState().replaceArchitectureId;
            if (replaceArchitectureId) {
              replaceArchitectureId(architectureId, result.id);
            }
          }

          return result;
        }
      } catch (error) {
        console.error('Failed to save architecture:', error);
        throw error;
      }
    },
    [
      architectures,
      apiArchitectures,
      queryClient,
      createMutation,
      updateMutation,
    ],
  );

  /**
   * Delete an architecture from both local store and API
   */
  const deleteFromApi = useCallback(
    async (architectureId: ArchitectureId) => {
      try {
        // Delete from API first
        await deleteMutation.mutateAsync(architectureId);

        // Then delete from local store
        useArchitectureStore.getState().deleteArchitecture(architectureId);
      } catch (error) {
        console.error('Failed to delete architecture:', error);
        throw error;
      }
    },
    [deleteMutation],
  );

  /**
   * Create a new architecture and save to API
   */
  const createAndSave = useCallback(
    async (
      name: string,
      type: Architecture['type'],
      description = '',
    ): Promise<string> => {
      // Create locally first
      const localId = useArchitectureStore
        .getState()
        .createArchitecture(name, type, description);

      // Then save to API
      try {
        const result = await createMutation.mutateAsync({
          name,
          type,
          description,
          nodes: [],
          edges: [],
        });

        // Replace local ID with API ID
        const replaceArchitectureId =
          useArchitectureStore.getState().replaceArchitectureId;
        if (replaceArchitectureId && result.id !== localId) {
          replaceArchitectureId(localId, result.id);
        }

        return result.id;
      } catch (error) {
        // Keep local version even if API fails
        console.error('Failed to create architecture in API:', error);
        return localId;
      }
    },
    [createMutation],
  );

  /**
   * Refresh architectures from API
   */
  const refresh = useCallback(() => {
    hasSyncedRef.current = false;
    queryClient.invalidateQueries({ queryKey: queryKeys.architectures.all });
  }, [queryClient]);

  return {
    // State
    isLoading,
    isError,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Actions
    saveToApi,
    deleteFromApi,
    createAndSave,
    refresh,

    // Errors
    saveError: createMutation.error || updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
