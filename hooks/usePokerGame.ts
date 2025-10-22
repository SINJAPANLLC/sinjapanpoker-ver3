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
}

interface GameState {
  id: string;
  type: string;
  phase: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  winner?: string;
  winningHand?: string;
}

export function usePokerGame(gameId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Array<{ username: string; message: string; timestamp: number }>>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  // Socket.io接続
  useEffect(() => {
    if (!gameId || !user) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
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

    newSocket.on('connect_error', (err) => {
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
      setError(data.message);
    });

    newSocket.on('action-error', (data: { message: string }) => {
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, user]);

  // ゲームに参加
  const joinGame = useCallback((chips: number = 1000) => {
    if (!socket || !user || !gameId) return;

    socket.emit('join-game', {
      gameId,
      player: {
        userId: user.id,
        username: user.username,
        chips,
      },
    });
  }, [socket, user, gameId]);

  // プレイヤーアクション
  const performAction = useCallback((action: 'fold' | 'check' | 'call' | 'raise' | 'all-in', amount?: number) => {
    if (!socket) return;

    socket.emit('player-action', {
      action,
      amount,
    });
  }, [socket]);

  // チャット送信
  const sendMessage = useCallback((message: string) => {
    if (!socket || !user) return;

    socket.emit('chat-message', {
      username: user.username,
      message,
    });
  }, [socket, user]);

  // 現在のプレイヤーを取得
  const getCurrentPlayer = useCallback(() => {
    if (!gameState || !socket) return null;
    return gameState.players.find(p => p.id === socket.id) || null;
  }, [gameState, socket]);

  // ターン判定
  const isMyTurn = useCallback(() => {
    if (!gameState || !socket) return false;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    return currentPlayer?.id === socket.id;
  }, [gameState, socket]);

  return {
    socket,
    gameState,
    messages,
    connected,
    error,
    joinGame,
    performAction,
    sendMessage,
    getCurrentPlayer,
    isMyTurn,
  };
}
