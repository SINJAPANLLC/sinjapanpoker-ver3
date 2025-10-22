import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Currency {
  gameChips: number; // 練習モード用の無料チップ
  realChips: number; // リアルマネーで購入したチップ（1チップ = 1円）
  diamonds: number;
  energy: number;
  points: number; // 購入用ポイント（1ポイント = 1円）
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'reward' | 'game' | 'admin';
  currency: 'gameChips' | 'realChips' | 'diamonds' | 'energy' | 'points';
  amount: number;
  description: string;
  timestamp: Date;
  adminId?: string;
}

interface CurrencyStore {
  currency: Currency;
  transactions: Transaction[];
  isRealMoneyMode: boolean;
  
  // Actions
  addCurrency: (type: keyof Currency, amount: number, description: string, adminId?: string) => void;
  deductCurrency: (type: keyof Currency, amount: number, description: string) => boolean;
  purchaseRealChips: (points: number, chips: number) => boolean;
  purchaseDiamonds: (points: number, diamonds: number) => boolean;
  addPoints: (amount: number, description: string) => void;
  addGameChips: (amount: number, description: string) => void;
  getTransactionHistory: () => Transaction[];
  resetCurrency: () => void;
  setRealMoneyMode: (enabled: boolean) => void;
}

const initialCurrency: Currency = {
  gameChips: 10000, // 新規ユーザーには練習用チップを10,000付与
  realChips: 0,
  diamonds: 0,
  energy: 0, // 初期は0（後からアイテムや課金で追加予定）
  points: 0
};

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: initialCurrency,
      transactions: [],
      isRealMoneyMode: false,

      addCurrency: (type, amount, description, adminId) => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: adminId ? 'admin' : 'reward',
          currency: type as 'gameChips' | 'realChips' | 'diamonds' | 'energy' | 'points',
          amount,
          description,
          timestamp: new Date(),
          adminId
        };

        set((state) => ({
          currency: {
            ...state.currency,
            [type]: state.currency[type] + amount
          },
          transactions: [newTransaction, ...state.transactions]
        }));
      },

      deductCurrency: (type, amount, description) => {
        const current = get().currency[type];
        if (current < amount) {
          return false; // 残高不足
        }

        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'game',
          currency: type as 'gameChips' | 'realChips' | 'diamonds' | 'energy' | 'points',
          amount: -amount,
          description,
          timestamp: new Date()
        };

        set((state) => ({
          currency: {
            ...state.currency,
            [type]: state.currency[type] - amount
          },
          transactions: [newTransaction, ...state.transactions]
        }));

        return true;
      },

      purchaseRealChips: (points, chips) => {
        const currentPoints = get().currency.points;
        if (currentPoints < points) {
          return false; // ポイント不足
        }

        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'purchase',
          currency: 'realChips',
          amount: chips,
          description: `リアルチップ購入 (${points}ポイント)`,
          timestamp: new Date()
        };

        set((state) => ({
          currency: {
            ...state.currency,
            points: state.currency.points - points,
            realChips: state.currency.realChips + chips
          },
          transactions: [newTransaction, ...state.transactions]
        }));

        return true;
      },

      purchaseDiamonds: (points, diamonds) => {
        const currentPoints = get().currency.points;
        if (currentPoints < points) {
          return false; // ポイント不足
        }

        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'purchase',
          currency: 'diamonds',
          amount: diamonds,
          description: `ダイヤ購入 (${points}ポイント)`,
          timestamp: new Date()
        };

        set((state) => ({
          currency: {
            ...state.currency,
            points: state.currency.points - points,
            diamonds: state.currency.diamonds + diamonds
          },
          transactions: [newTransaction, ...state.transactions]
        }));

        return true;
      },

      addPoints: (amount, description) => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'purchase',
          currency: 'points',
          amount,
          description,
          timestamp: new Date()
        };

        set((state) => ({
          currency: {
            ...state.currency,
            points: state.currency.points + amount
          },
          transactions: [newTransaction, ...state.transactions]
        }));
      },

      addGameChips: (amount, description) => {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          type: 'admin',
          currency: 'gameChips',
          amount,
          description,
          timestamp: new Date()
        };

        set((state) => ({
          currency: {
            ...state.currency,
            gameChips: state.currency.gameChips + amount
          },
          transactions: [newTransaction, ...state.transactions]
        }));
      },

      getTransactionHistory: () => {
        return get().transactions;
      },

      resetCurrency: () => {
        set({
          currency: initialCurrency,
          transactions: []
        });
      },

      setRealMoneyMode: (enabled: boolean) => {
        set({ isRealMoneyMode: enabled });
      }
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({
        currency: state.currency,
        transactions: state.transactions.slice(0, 100) // 最新100件のみ保存
      })
    }
  )
);
