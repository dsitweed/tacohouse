import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { User } from '@/types';

/**
 * Auth Store - Simplified for httpOnly cookie authentication
 *
 * Tokens are stored in httpOnly cookies (managed by backend),
 * so we only store user info in Zustand for UI state.
 *
 * Authentication is determined by:
 * - Client-side: user object presence (after successful login)
 * - Server-side: cookie presence (checked in middleware/serverApiClient)
 */
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isHydrated: false,

        login: (user) => {
          set({
            user,
            isAuthenticated: true,
          });
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
          });
        },

        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...userData },
            });
          }
        },

        setHydrated: () => {
          set({ isHydrated: true });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          // Mark as hydrated after rehydration completes
          state?.setHydrated();
        },
      },
    ),
    {
      name: 'AuthStore',
    },
  ),
);
