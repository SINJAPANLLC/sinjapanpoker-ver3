import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameTransaction {
  id: string;
  type: 'rake' | 'tournament_fee' | 'table_fee';
  gameId: string;
  tableId?: string;
  tournamentId?: string;
  playerId: string;
  playerName: string;
  amount: number;
  rakePercentage: number; // レーキ率（5% = 0.05）
  feePercentage?: number; // 手数料率（10% = 0.10）
  originalPot: number; // 元のポットサイズ
  createdAt: Date;
  processedAt: Date;
  status: 'pending' | 'processed' | 'failed';
}

export interface RevenueStats {
  totalRake: number;
  totalTournamentFees: number;
  totalTableFees: number;
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  transactionCount: number;
}

interface RevenueStore {
  transactions: GameTransaction[];
  stats: RevenueStats;
  addTransaction: (transaction: Omit<GameTransaction, 'id' | 'createdAt' | 'processedAt'>) => void;
  processTransaction: (transactionId: string) => void;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => GameTransaction[];
  getTransactionsByType: (type: GameTransaction['type']) => GameTransaction[];
  getTransactionsByGame: (gameId: string) => GameTransaction[];
  calculateRake: (potSize: number, rakePercentage: number) => number;
  calculateTournamentFee: (buyIn: number, feePercentage: number) => number;
  updateStats: () => void;
  getRevenueByPeriod: (period: 'daily' | 'weekly' | 'monthly') => number;
}

const initialStats: RevenueStats = {
  totalRake: 0,
  totalTournamentFees: 0,
  totalTableFees: 0,
  totalRevenue: 0,
  dailyRevenue: 0,
  weeklyRevenue: 0,
  monthlyRevenue: 0,
  transactionCount: 0
};

export const useRevenueStore = create<RevenueStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      stats: initialStats,
      
      addTransaction: (transactionData) => {
        const newTransaction: GameTransaction = {
          ...transactionData,
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          processedAt: new Date(),
        };
        
        set((state) => ({
          transactions: [...state.transactions, newTransaction]
        }));
        
        // 統計を更新
        get().updateStats();
      },
      
      processTransaction: (transactionId) => {
        set((state) => ({
          transactions: state.transactions.map(tx =>
            tx.id === transactionId 
              ? { ...tx, status: 'processed' as const, processedAt: new Date() }
              : tx
          )
        }));
        
        get().updateStats();
      },
      
      getTransactionsByDateRange: (startDate, endDate) => {
        return get().transactions.filter(tx => 
          tx.createdAt >= startDate && tx.createdAt <= endDate
        );
      },
      
      getTransactionsByType: (type) => {
        return get().transactions.filter(tx => tx.type === type);
      },
      
      getTransactionsByGame: (gameId) => {
        return get().transactions.filter(tx => tx.gameId === gameId);
      },
      
      calculateRake: (potSize, rakePercentage) => {
        return Math.floor(potSize * rakePercentage);
      },
      
      calculateTournamentFee: (buyIn, feePercentage) => {
        return Math.floor(buyIn * feePercentage);
      },
      
      updateStats: () => {
        const transactions = get().transactions;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const totalRake = transactions
          .filter(tx => tx.type === 'rake')
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        const totalTournamentFees = transactions
          .filter(tx => tx.type === 'tournament_fee')
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        const totalTableFees = transactions
          .filter(tx => tx.type === 'table_fee')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const dailyRevenue = transactions
          .filter(tx => tx.createdAt >= oneDayAgo)
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        const weeklyRevenue = transactions
          .filter(tx => tx.createdAt >= oneWeekAgo)
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        const monthlyRevenue = transactions
          .filter(tx => tx.createdAt >= oneMonthAgo)
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        set({
          stats: {
            totalRake,
            totalTournamentFees,
            totalTableFees,
            totalRevenue: totalRake + totalTournamentFees + totalTableFees,
            dailyRevenue,
            weeklyRevenue,
            monthlyRevenue,
            transactionCount: transactions.length
          }
        });
      },
      
      getRevenueByPeriod: (period) => {
        const stats = get().stats;
        switch (period) {
          case 'daily':
            return stats.dailyRevenue;
          case 'weekly':
            return stats.weeklyRevenue;
          case 'monthly':
            return stats.monthlyRevenue;
          default:
            return 0;
        }
      }
    }),
    {
      name: 'revenue-storage',
    }
  )
);
