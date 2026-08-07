import type { User } from '@/types';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,

        login: (user, accessToken, refreshToken) => {
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });
        },

        logout: () => {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
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

        /**
         * Set tokens và sync isAuthenticated
         *
         * TẠI SAO CẦN: Khi token được refresh (trong api interceptor),
         * nếu không set isAuthenticated, có thể token mới được set nhưng
         * isAuthenticated vẫn là false → user bị logout sai
         */
        setTokens: (accessToken, refreshToken) => {
          set({
            accessToken,
            refreshToken,
            // Sync isAuthenticated với accessToken
            // Logic: Có token = Đã authenticated
            isAuthenticated: !!accessToken,
          });
        },
      }),
      {
        name: 'auth-storage', // Key trong localStorage

        /**
         * Chỉ persist các field này vào localStorage
         */
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),

        /**
         * FIX 1: onRehydrateStorage Callback
         *
         * TẠI SAO CẦN:
         * 1. Sau khi Zustand hydrate từ localStorage, callback này chạy
         * 2. Đảm bảo isAuthenticated được set đúng dựa trên accessToken
         * 3. Tránh trường hợp localStorage có token nhưng isAuthenticated = false
         *    (do bug trước đó hoặc data corrupt)
         *
         * TIMING: Chạy SAU KHI hydration hoàn tất, TRƯỚC KHI component re-render
         *
         * Flow:
         * localStorage → Zustand hydrate → onRehydrateStorage → State fixed → Component render
         */
        skipHydration: false,
        onRehydrateStorage: () => (state) => {
          // Nếu có accessToken sau khi hydrate → đảm bảo isAuthenticated = true
          // Đây là derived state: Có token = Đã authenticated
          if (state && state.accessToken) {
            state.isAuthenticated = true;
          }
        },
      },
    ),
    {
      name: 'AuthStore',
    },
  ),
);
