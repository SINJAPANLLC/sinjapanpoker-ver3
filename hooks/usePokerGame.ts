import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

interface Card {
  suit: string;
  rank: string;
  id: string;
}

interface Player {
  id: string;
  userId: string;
  username: string;
  chips: number;
  bet: number;
  cards: Card[];
  folded: boolean;
  isAllIn: boolean;
  position: number;
  isDealer: boolean;
  hasActed: boolean;
  avatar?: string;
}

interface Winner {
  username: string;
  amount: number;
  handDescription: string;
}

interface SidePot {
  amount: number;
  eligiblePlayers: string[];
}

interface GameState {
  id: string;
  type: string;
  phase: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: SidePot[];
  currentBet: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  winner?: string;
  winningHand?: string;
  winners?: Winner[];
  blinds: {
    small: number;
    big: number;
  };
}

export function usePokerGame(gameId: string | null, difficulty?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Array<{ username: string; message: string; timestamp: number }>>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!gameId || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (err: Error) => {
      console.error('Connection error:', err);
      setError('接続エラーが発生しました');
      setConnected(false);
    });

    newSocket.on('game-state', (state: GameState) => {
      console.log('Game state updated:', state);
      setGameState(state);
    });

    newSocket.on('chat-message', (data: { username: string; message: string; timestamp: number }) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on('error', (data: { message: string }) => {
      console.error('Error:', data.message);
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    });

    newSocket.on('action-error', (data: { message: string }) => {
      console.error('Action error:', data.message);
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    });

    newSocket.on('game-ended', (data: { message: string }) => {
      console.log('Game ended:', data.message);
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, user]);

  const joinGame = useCallback((chips: number = 1000, blinds?: { small: number; big: number }) => {
    if (!socket || !user || !gameId) return;

    console.log('Joining game:', { gameId, userId: user.id, username: user.username, chips, blinds, difficulty });
    socket.emit('join-game', {
      gameId,
      player: {
        userId: user.id,
        username: user.username,
        chips,
        avatar: (user as any).avatar || null,
      },
      blinds,
      difficulty,
    });
  }, [socket, user, gameId, difficulty]);

  const performAction = useCallback((action: 'fold' | 'check' | 'call' | 'raise' | 'all-in', amount?: number) => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    console.log('Performing action:', { action, amount });
    socket.emit('player-action', {
      action,
      amount,
    });
  }, [socket]);

  const sendMessage = useCallback((message: string) => {
    if (!socket || !user) return;

    socket.emit('chat-message', {
      message,
    });
  }, [socket, user]);

  const setAwayStatus = useCallback((isAway: boolean) => {
    if (!socket) return;

    socket.emit('set-away-status', {
      isAway,
    });
  }, [socket]);

  const getCurrentPlayer = useCallback(() => {
    if (!gameState || !user) return null;
    return gameState.players.find(p => p.userId === user.id) || null;
  }, [gameState, user]);

  const isMyTurn = useCallback(() => {
    if (!gameState || !user) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer?.userId === user.id;
  }, [gameState, user]);

  const canCheck = useCallback(() => {
    if (!gameState || !user) return false;
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return false;
    return currentPlayer.bet === gameState.currentBet;
  }, [gameState, user, getCurrentPlayer]);

  const canCall = useCallback(() => {
    if (!gameState || !user) return false;
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return false;
    return currentPlayer.bet < gameState.currentBet && currentPlayer.chips > 0;
  }, [gameState, user, getCurrentPlayer]);

  const getCallAmount = useCallback(() => {
    if (!gameState) return 0;
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return 0;
    return Math.min(gameState.currentBet - currentPlayer.bet, currentPlayer.chips);
  }, [gameState, getCurrentPlayer]);

  const getMinRaise = useCallback(() => {
    if (!gameState) return 0;
    return gameState.currentBet + gameState.blinds.big;
  }, [gameState]);

  return {
    socket,
    gameState,
    messages,
    connected,
    error,
    joinGame,
    performAction,
    sendMessage,
    setAwayStatus,
    getCurrentPlayer,
    isMyTurn,
    canCheck,
    canCall,
    getCallAmount,
    getMinRaise,
  };
}
