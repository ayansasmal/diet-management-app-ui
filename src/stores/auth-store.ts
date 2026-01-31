/**
 * Auth Store - Zustand store for authentication state
 *
 * Uses persist middleware to save auth state to localStorage.
 * Handles JWT tokens, user data, and hydration state for SSR compatibility.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Auth store state shape
 */
interface AuthState {
  /** JWT access token */
  accessToken: string | null;
  /** Token expiration timestamp (ms) */
  expiresAt: number | null;
  /** Authenticated user data */
  user: AuthUser | null;
  /** Whether store has hydrated from localStorage */
  isHydrated: boolean;
}

/**
 * Auth store actions
 */
interface AuthActions {
  /**
   * Set authentication data after successful login
   */
  setAuth: (data: {
    accessToken: string;
    expiresIn: number;
    user: AuthUser;
  }) => void;

  /**
   * Clear authentication data (logout)
   */
  clearAuth: () => void;

  /**
   * Update user data (e.g., after profile creation)
   */
  updateUser: (updates: Partial<AuthUser>) => void;

  /**
   * Check if user is authenticated with valid token
   */
  isAuthenticated: () => boolean;

  /**
   * Check if token is expired
   */
  isTokenExpired: () => boolean;

  /**
   * Set hydration status (called after store rehydrates)
   */
  setHydrated: (hydrated: boolean) => void;
}

/**
 * Combined auth store type
 */
type AuthStore = AuthState & AuthActions;

/* ═══════════════════════════════════════════════════════════════════════════
   Store Implementation
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Initial state values
 */
const initialState: AuthState = {
  accessToken: null,
  expiresAt: null,
  user: null,
  isHydrated: false,
};

/**
 * Auth store with persist middleware
 *
 * @example
 * ```tsx
 * // In a component
 * const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
 *
 * // Check auth outside React
 * const isLoggedIn = useAuthStore.getState().isAuthenticated();
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: ({ accessToken, expiresIn, user }) => {
        // Calculate expiration timestamp with 30s buffer for network latency
        const expiresAt = Date.now() + (expiresIn - 30) * 1000;

        set({
          accessToken,
          expiresAt,
          user,
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          expiresAt: null,
          user: null,
        });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      isAuthenticated: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;
        return Date.now() < expiresAt;
      },

      isTokenExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        return Date.now() >= expiresAt;
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'diet-app-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist auth-related fields, not hydration state
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
      // Mark store as hydrated after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

/* ═══════════════════════════════════════════════════════════════════════════
   Selectors
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Selector to get just the user
 * Use this to minimize re-renders when only user data is needed
 */
export const selectUser = (state: AuthStore) => state.user;

/**
 * Selector to get authentication status
 */
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated();

/**
 * Selector to get hydration status
 */
export const selectIsHydrated = (state: AuthStore) => state.isHydrated;

/**
 * Selector to check if user has completed profile
 */
export const selectHasProfile = (state: AuthStore) => state.user?.hasProfile ?? false;

/**
 * Selector to get user's theme preference
 */
export const selectThemePreference = (state: AuthStore) => state.user?.themePreference;
