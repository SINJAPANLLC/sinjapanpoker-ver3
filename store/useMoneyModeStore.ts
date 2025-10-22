import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MoneyMode = 'play' | 'real';

interface MoneyModeStore {
  mode: MoneyMode;
  isEnabled: boolean; // 管理者がリアルマネーモードを有効化しているか
  
  // Actions
  setMode: (mode: MoneyMode) => void;
  toggleMode: () => void;
  enableRealMoney: () => void;
  disableRealMoney: () => void;
  canUseRealMoney: () => boolean;
}

export const useMoneyModeStore = create<MoneyModeStore>()(
  persist(
    (set, get) => ({
      mode: 'play', // デフォルトはプレイマネー（日本法対応）
      isEnabled: false, // リアルマネーは管理者が有効化するまで使用不可
      
      setMode: (mode) => {
        const { isEnabled } = get();
        
        // リアルマネーモードは有効化されている場合のみ切替可能
        if (mode === 'real' && !isEnabled) {
          console.warn('リアルマネーモードは無効化されています');
          return;
        }
        
        set({ mode });
      },
      
      toggleMode: () => {
        const { mode, isEnabled } = get();
        
        if (!isEnabled && mode === 'play') {
          console.warn('リアルマネーモードは無効化されています');
          return;
        }
        
        set({ mode: mode === 'play' ? 'real' : 'play' });
      },
      
      enableRealMoney: () => {
        set({ isEnabled: true });
        console.log('[ADMIN] リアルマネーモードを有効化しました');
      },
      
      disableRealMoney: () => {
        set({ isEnabled: false, mode: 'play' });
        console.log('[ADMIN] リアルマネーモードを無効化しました（全ユーザーがプレイマネーに切り替わります）');
      },
      
      canUseRealMoney: () => {
        return get().isEnabled;
      }
    }),
    {
      name: 'money-mode-storage',
      partialize: (state) => ({
        mode: state.mode,
        isEnabled: state.isEnabled
      })
    }
  )
);
