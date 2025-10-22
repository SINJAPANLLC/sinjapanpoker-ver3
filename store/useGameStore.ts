import { create } from 'zustand';
import { useRevenueStore } from './useRevenueStore';

interface Game {
  id: string;
  type: 'cash' | 'tournament' | 'sit-and-go';
  tableId?: string;
  tournamentId?: string;
  pot: number;
  players: string[];
  rakePercentage: number;
  status: 'waiting' | 'playing' | 'finished' | 'paused';
  currentHand: number;
}

interface GameState {
  currentGame: Game | null;
  activeGames: Game[];
  socket: any | null;
  
  startGame: (gameData: Omit<Game, 'pot' | 'status' | 'currentHand'>) => void;
  addToPot: (amount: number) => void;
  endGame: (winnerId: string, totalPot: number) => void;
  calculateRake: (pot: number) => number;
  addActiveGame: (game: Game) => void;
  removeActiveGame: (gameId: string) => void;
  updateActiveGame: (gameId: string, updates: Partial<Game>) => void;
  setSocket: (socket: any) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  activeGames: [],
  socket: null,
  
  startGame: (gameData) => {
    const game = {
      ...gameData,
      pot: 0,
      status: 'playing' as const,
      currentHand: 1
    };
    set({ currentGame: game });
  },
  
  addToPot: (amount) => {
    set((state) => ({
      currentGame: state.currentGame ? {
        ...state.currentGame,
        pot: state.currentGame.pot + amount
      } : null
    }));
  },
  
  endGame: (winnerId, totalPot) => {
    const { currentGame } = get();
    if (!currentGame) return;
    
    // レーキを計算
    const rake = get().calculateRake(totalPot);
    
    // レーキ取引を追加（実際の実装では、プレイヤーごとに個別の取引を作成）
    const { addTransaction } = useRevenueStore.getState();
    
    // 各プレイヤーからレーキを徴収
    currentGame.players.forEach((playerId) => {
      addTransaction({
        type: 'rake',
        gameId: currentGame.id,
        tableId: currentGame.tableId,
        tournamentId: currentGame.tournamentId,
        playerId: playerId,
        playerName: `Player${playerId}`, // 実際の実装ではユーザー名を取得
        amount: Math.floor(rake / currentGame.players.length), // プレイヤー数で分割
        rakePercentage: currentGame.rakePercentage,
        originalPot: totalPot,
        status: 'processed'
      });
    });
    
    set({ currentGame: null });
  },
  
  calculateRake: (pot) => {
    const { currentGame } = get();
    if (!currentGame) return 0;
    
    return Math.floor(pot * currentGame.rakePercentage);
  },
  
  addActiveGame: (game) => {
    set((state) => ({
      activeGames: [...state.activeGames, game]
    }));
  },
  
  removeActiveGame: (gameId) => {
    set((state) => ({
      activeGames: state.activeGames.filter(game => game.id !== gameId)
    }));
  },
  
  updateActiveGame: (gameId, updates) => {
    set((state) => ({
      activeGames: state.activeGames.map(game => 
        game.id === gameId ? { ...game, ...updates } : game
      )
    }));
  },
  
  setSocket: (socket) => {
    set({ socket });
  }
}));