/**
 * Auth Store - Manages authentication state and tokens
 * Single Responsibility: Handle auth state, tokens, and user session
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AuthUser, Tokens } from '@/shared/api/types';

interface AuthState {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  // Actions
  setAuth: (user: AuthUser, tokens: Tokens) => void;
  setTokens: (tokens: Tokens) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        setAuth: (user, tokens) =>
          set((state) => {
            state.user = user;
            state.accessToken = tokens.accessToken;
            state.refreshToken = tokens.refreshToken;
            state.isAuthenticated = true;
          }),

        setTokens: (tokens) =>
          set((state) => {
            state.accessToken = tokens.accessToken;
            state.refreshToken = tokens.refreshToken;
          }),

        setUser: (user) =>
          set((state) => {
            state.user = user;
          }),

        logout: () =>
          set((state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
          }),

        setHydrated: () =>
          set((state) => {
            state.isHydrated = true;
          }),
      })),
      {
        name: 'fas-auth-store',
        version: 1,
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated();
        },
      },
    ),
    { name: 'AuthStore' },
  ),
);

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useIsAuthHydrated = () =>
  useAuthStore((state) => state.isHydrated);
