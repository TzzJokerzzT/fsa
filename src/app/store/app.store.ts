import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Theme } from '@/shared/types';

/**
 * App Store - Global application state
 * Follows Single Responsibility: Only handles app-wide UI state
 */

interface AppState {
  // State
  theme: Theme;
  sidebarOpen: boolean;
  sidebarWidth: number;
  propertiesPanelOpen: boolean;
  propertiesPanelWidth: number;
}

interface AppActions {
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  togglePropertiesPanel: () => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  setPropertiesPanelWidth: (width: number) => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  theme: 'dark',
  sidebarOpen: true,
  sidebarWidth: 280,
  propertiesPanelOpen: true,
  propertiesPanelWidth: 320,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),

        setSidebarWidth: (width) =>
          set((state) => {
            state.sidebarWidth = Math.max(200, Math.min(400, width));
          }),

        togglePropertiesPanel: () =>
          set((state) => {
            state.propertiesPanelOpen = !state.propertiesPanelOpen;
          }),

        setPropertiesPanelOpen: (open) =>
          set((state) => {
            state.propertiesPanelOpen = open;
          }),

        setPropertiesPanelWidth: (width) =>
          set((state) => {
            state.propertiesPanelWidth = Math.max(250, Math.min(500, width));
          }),
      })),
      {
        name: 'fas-app-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          sidebarWidth: state.sidebarWidth,
          propertiesPanelOpen: state.propertiesPanelOpen,
          propertiesPanelWidth: state.propertiesPanelWidth,
        }),
      },
    ),
    { name: 'AppStore' },
  ),
);

// Selector hooks for optimized re-renders (rerender-derived-state)
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const usePropertiesPanelOpen = () =>
  useAppStore((state) => state.propertiesPanelOpen);
