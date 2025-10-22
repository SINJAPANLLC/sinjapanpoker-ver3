import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  chips: number;
  level: number;
  experience: number;
  energy: number;
  gems: number;
  vipDays: number;
  avatar?: string;
  isAdmin?: boolean;
}

export interface GameStats {
  totalEarnings: number;
  recentEarnings: number;
  gamesPlayed: number;
  winRate: number;
}

export interface AppState {
  user: User | null;
  gameStats: GameStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUserStats: (stats: Partial<User>) => void;
  setGameStats: (stats: GameStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      gameStats: {
        totalEarnings: 0,
        recentEarnings: 0,
        gamesPlayed: 0,
        winRate: 0
      },
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      
      updateUserStats: (stats) => set((state) => ({
        user: state.user ? { ...state.user, ...stats } : null
      })),
      
      setGameStats: (gameStats) => set({ gameStats }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      logout: () => set({ 
        user: null, 
        gameStats: {
          totalEarnings: 0,
          recentEarnings: 0,
          gamesPlayed: 0,
          winRate: 0
        },
        error: null 
      }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        user: state.user,
        gameStats: state.gameStats 
      }),
    }
  )
);
