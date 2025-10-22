import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  chips: number;
  level: number;
  experience: number;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        // セッションストレージにも保存（APIリクエスト用）
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_token', token);
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // セッションストレージからも削除
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('auth_token');
        }
      },
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && state.user !== null && state.token !== null;
      },
    }),
    {
      name: 'auth-storage', // localStorage のキー名
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
