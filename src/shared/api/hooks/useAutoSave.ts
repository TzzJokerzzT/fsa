/**
 * Auto-Save Hook - Automatically saves architecture changes to backend API
 * Single Responsibility: Debounced auto-save for architecture modifications
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useArchitectureStore, useIsAuthenticated } from '@/app/store';
import { useArchitectureSync } from './useArchitectureSync';

export type AutoSaveStatus =
  | 'idle'
  | 'pending'
  | 'saving'
  | 'saved'
  | 'error'
  | 'offline';

interface UseAutoSaveOptions {
  /** Debounce delay in milliseconds (default: 2000ms) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save completes */
  onSaveComplete?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  /** Current auto-save status */
  status: AutoSaveStatus;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
  /** Force an immediate save */
  saveNow: () => Promise<void>;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Error message if save failed */
  error: string | null;
}

/**
 * Serialize architecture for comparison (excluding updatedAt to prevent loops)
 */
function serializeArchitecture(
  arch: {
    name: string;
    type: string;
    description: string;
    nodes: unknown[];
    edges: unknown[];
  } | null,
): string | null {
  if (!arch) return null;
  return JSON.stringify({
    name: arch.name,
    type: arch.type,
    description: arch.description,
    nodes: arch.nodes,
    edges: arch.edges,
  });
}

/**
 * Hook that automatically saves the current architecture to the API
 * when changes are detected, with debouncing to prevent excessive API calls.
 */
export function useAutoSave(
  options: UseAutoSaveOptions = {},
): UseAutoSaveReturn {
  const {
    debounceMs = 2000,
    enabled = true,
    onSaveComplete,
    onSaveError,
  } = options;

  const isAuthenticated = useIsAuthenticated();
  const currentArchitectureId = useArchitectureStore(
    (s) => s.currentArchitectureId,
  );
  const { saveToApi, isSaving } = useArchitectureSync();

  // State
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs to avoid dependency issues
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const saveToApiRef = useRef(saveToApi);
  const onSaveCompleteRef = useRef(onSaveComplete);
  const onSaveErrorRef = useRef(onSaveError);

  // Keep refs updated
  useEffect(() => {
    saveToApiRef.current = saveToApi;
  }, [saveToApi]);

  useEffect(() => {
    onSaveCompleteRef.current = onSaveComplete;
    onSaveErrorRef.current = onSaveError;
  }, [onSaveComplete, onSaveError]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Perform the actual save operation
   */
  const performSave = useCallback(
    async (archId: string, serializedData: string) => {
      if (!archId || !isAuthenticated || !enabled) {
        return;
      }

      // Check if online
      if (!navigator.onLine) {
        if (isMountedRef.current) {
          setStatus('offline');
          setError(
            'You are offline. Changes will be saved when you reconnect.',
          );
        }
        return;
      }

      try {
        if (isMountedRef.current) {
          setStatus('saving');
          setError(null);
        }

        await saveToApiRef.current(archId);

        if (isMountedRef.current) {
          setStatus('saved');
          setLastSavedAt(new Date());
          setHasUnsavedChanges(false);
          lastSavedDataRef.current = serializedData;
          onSaveCompleteRef.current?.();

          // Reset to idle after a short delay
          setTimeout(() => {
            if (isMountedRef.current) {
              setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
            }
          }, 2000);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to save';
          setStatus('error');
          setError(errorMessage);
          onSaveErrorRef.current?.(
            err instanceof Error ? err : new Error(errorMessage),
          );
        }
      }
    },
    [isAuthenticated, enabled],
  );

  /**
   * Force an immediate save (bypasses debounce)
   */
  const saveNow = useCallback(async () => {
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const arch = useArchitectureStore.getState().currentArchitecture;
    const archId = useArchitectureStore.getState().currentArchitectureId;
    if (archId && arch) {
      const serialized = serializeArchitecture(arch);
      if (serialized) {
        await performSave(archId, serialized);
      }
    }
  }, [performSave]);

  /**
   * Subscribe to architecture store changes
   */
  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      return;
    }

    // Subscribe to store changes
    const unsubscribe = useArchitectureStore.subscribe((state, prevState) => {
      // Only react to currentArchitecture changes
      if (state.currentArchitecture === prevState.currentArchitecture) {
        return;
      }

      const archId = state.currentArchitectureId;
      const arch = state.currentArchitecture;

      if (!archId || !arch) {
        return;
      }

      const currentData = serializeArchitecture(arch);

      // Check if data actually changed
      if (currentData === lastSavedDataRef.current) {
        return;
      }

      // Mark as having unsaved changes
      setHasUnsavedChanges(true);
      setStatus('pending');

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced save
      debounceTimerRef.current = setTimeout(() => {
        if (currentData) {
          performSave(archId, currentData);
        }
      }, debounceMs);
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, isAuthenticated, debounceMs, performSave]);

  /**
   * Handle coming back online - retry save if there are unsaved changes
   */
  useEffect(() => {
    const handleOnline = () => {
      if (hasUnsavedChanges) {
        setStatus('pending');
        saveNow();
      }
    };

    const handleOffline = () => {
      setStatus((prev) => {
        if (prev === 'pending' || prev === 'saving') {
          setError(
            'You are offline. Changes will be saved when you reconnect.',
          );
          return 'offline';
        }
        return prev;
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasUnsavedChanges, saveNow]);

  /**
   * Save before page unload if there are unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && enabled) {
        e.preventDefault();
        e.returnValue =
          'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, enabled]);

  // Sync with external saving state
  useEffect(() => {
    if (isSaving) {
      setStatus((prev) => (prev !== 'saving' ? 'saving' : prev));
    }
  }, [isSaving]);

  // Initialize lastSavedDataRef when architecture loads
  useEffect(() => {
    if (currentArchitectureId && !lastSavedDataRef.current) {
      const arch = useArchitectureStore.getState().currentArchitecture;
      if (arch) {
        lastSavedDataRef.current = serializeArchitecture(arch);
      }
    }
  }, [currentArchitectureId]);

  return {
    status,
    lastSavedAt,
    saveNow,
    hasUnsavedChanges,
    error,
  };
}
