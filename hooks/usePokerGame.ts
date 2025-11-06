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

    const handleConnect = () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected');
      setConnected(false);
    };

    const handleConnectError = (err: Error) => {
      console.error('Connection error:', err);
      setError('接続エラーが発生しました');
      setConnected(false);
    };

    const handleGameState = (state: GameState) => {
      console.log('Game state updated:', state);
      setGameState(state);
    };

    const handleChatMessage = (data: { username: string; message: string; timestamp: number }) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleError = (data: { message: string }) => {
      console.error('Error:', data.message);
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    };

    const handleActionError = (data: { message: string }) => {
      console.error('Action error:', data.message);
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    };

    const handleGameEnded = (data: { message: string }) => {
      console.log('Game ended:', data.message);
      setError(data.message);
    };

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('connect_error', handleConnectError);
    newSocket.on('game-state', handleGameState);
    newSocket.on('chat-message', handleChatMessage);
    newSocket.on('error', handleError);
    newSocket.on('action-error', handleActionError);
    newSocket.on('game-ended', handleGameEnded);

    setSocket(newSocket);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
      newSocket.off('connect_error', handleConnectError);
      newSocket.off('game-state', handleGameState);
      newSocket.off('chat-message', handleChatMessage);
      newSocket.off('error', handleError);
      newSocket.off('action-error', handleActionError);
      newSocket.off('game-ended', handleGameEnded);
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
