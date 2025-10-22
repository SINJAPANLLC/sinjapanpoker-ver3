import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useRevenueStore } from './useRevenueStore';

export interface Tournament {
  id: string;
  name: string;
  type: 'tournament';
  buyIn: number;
  currentPlayers: number;
  maxPlayers: number;
  prize: number;
  status: 'waiting' | 'playing' | 'finished' | 'cancelled';
  createdBy: string;
  createdById: string;
  startTime: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TournamentStore {
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id' | 'createdAt' | 'updatedAt'>) => void;
  joinTournament: (tournamentId: string, playerId: string, playerName: string) => boolean;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  getTournament: (id: string) => Tournament | undefined;
  getActiveTournaments: () => Tournament[];
  getTournamentsByAdmin: (adminId: string) => Tournament[];
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, get) => ({
      tournaments: [],
      
      addTournament: (tournamentData) => {
        const newTournament: Tournament = {
          ...tournamentData,
          id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          tournaments: [...state.tournaments, newTournament]
        }));
      },
      
      joinTournament: (tournamentId: string, playerId: string, playerName: string) => {
        const tournament = get().tournaments.find(t => t.id === tournamentId);
        if (!tournament || tournament.currentPlayers >= tournament.maxPlayers) {
          return false;
        }
        
        // トーナメント手数料を計算（10%）
        const feePercentage = 0.10;
        const fee = Math.floor(tournament.buyIn * feePercentage);
        
        // 手数料取引を追加
        const { addTransaction } = useRevenueStore.getState();
        addTransaction({
          type: 'tournament_fee',
          gameId: tournamentId,
          tournamentId: tournamentId,
          playerId: playerId,
          playerName: playerName,
          amount: fee,
          rakePercentage: 0, // トーナメント手数料では使用しない
          feePercentage: feePercentage,
          originalPot: tournament.buyIn,
          status: 'processed'
        });
        
        // トーナメントの参加者数を更新
        set((state) => ({
          tournaments: state.tournaments.map(t =>
            t.id === tournamentId
              ? { ...t, currentPlayers: t.currentPlayers + 1, updatedAt: new Date() }
              : t
          )
        }));
        
        return true;
      },
      
      updateTournament: (id, updates) => {
        set((state) => ({
          tournaments: state.tournaments.map(tournament =>
            tournament.id === id 
              ? { ...tournament, ...updates, updatedAt: new Date() }
              : tournament
          )
        }));
      },
      
      deleteTournament: (id) => {
        set((state) => ({
          tournaments: state.tournaments.filter(tournament => tournament.id !== id)
        }));
      },
      
      getTournament: (id) => {
        return get().tournaments.find(tournament => tournament.id === id);
      },
      
      getActiveTournaments: () => {
        return get().tournaments.filter(tournament => 
          tournament.status === 'waiting' || tournament.status === 'playing'
        );
      },
      
      getTournamentsByAdmin: (adminId) => {
        return get().tournaments.filter(tournament => tournament.createdById === adminId);
      }
    }),
    {
      name: 'tournament-storage',
    }
  )
);
