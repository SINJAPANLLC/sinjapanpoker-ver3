'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, MessageSquare, History, UserCog, Trophy, Share2, BarChart3, Settings, Book, LogOut, Send, X, User, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import {
  type GameState,
  type Card,
  type Player,
  type PlayerAction,
  type User as UserType,
  createGame,
  getGame,
  performAction,
  updateUserChips,
  getUser
} from '@/lib/game-client';

// カード画像URL取得関数
const getCardImageUrl = (card: Card) => {
  const rankMap: { [key: string]: string } = {
    'J': 'jack',
    'Q': 'queen',
    'K': 'king',
    'A': 'ace'
  };
  
  const rank = rankMap[card.rank] || card.rank.toLowerCase();
  const suit = card.suit.toLowerCase();
  
  return `https://raw.githubusercontent.com/hayeah/playing-cards-assets/master/png/${rank}_of_${suit}.png`;
};

// カードコンポーネント
function CardComponent({ card, large = false, medium = false }: { card: Card, large?: boolean, medium?: boolean }) {
  const sizeClasses = large ? "w-32 h-[176px]" : medium ? "w-20 h-[110px]" : "w-20 h-[110px]";
  
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`${sizeClasses} rounded-lg shadow-xl overflow-hidden bg-white`}
    >
      <img 
        src={getCardImageUrl(card)} 
        alt={`${card.rank} of ${card.suit}`}
        className="w-full h-full object-contain"
        style={{ 
          display: 'block',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />
    </motion.div>
  );
}

// カード裏面コンポーネント
function CardBack({ index, total }: { index: number, total: number }) {
  const rotationAngle = total > 1 ? (index - (total - 1) / 2) * 10 : 0;
  const xOffset = total > 1 ? (index - (total - 1) / 2) * 12 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        rotate: rotationAngle,
        x: xOffset
      }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
      style={{ 
        transformOrigin: 'bottom center',
        zIndex: index
      }}
      className="absolute bg-gradient-to-br from-blue-500 to-blue-700 rounded shadow-lg w-9 h-12 flex items-center justify-center border border-blue-800 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-1 border border-white rounded"></div>
      </div>
      <div className="text-white text-base font-bold opacity-50">♠</div>
    </motion.div>
  );
}

// 相手のカードコンポーネント
function OpponentCardComponent({ card, index, total, folded }: { card: Card, index: number, total: number, folded?: boolean }) {
  const rotationAngle = total > 1 ? (index - (total - 1) / 2) * 10 : 0;
  const xOffset = total > 1 ? (index - (total - 1) / 2) * 12 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ 
        opacity: folded ? 0.3 : 1, 
        scale: folded ? 0.9 : 1, 
        y: 0,
        rotate: rotationAngle,
        x: xOffset
      }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
      style={{ 
        transformOrigin: 'bottom center',
        zIndex: index
      }}
      className="absolute w-11 h-16 rounded-lg shadow-xl overflow-hidden bg-white"
    >
      <img 
        src={getCardImageUrl(card)} 
        alt={`${card.rank} of ${card.suit}`}
        className="w-full h-full object-contain"
        style={{ 
          display: 'block',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />
    </motion.div>
  );
}

// プレイヤーカードコンポーネント
function PlayerCardComponent({ card, index, total, folded }: { card: Card, index: number, total: number, folded?: boolean }) {
  const rotationAngle = total > 1 ? (index - (total - 1) / 2) * 15 : 0;
  const xOffset = total > 1 ? (index - (total - 1) / 2) * 25 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, rotate: 0 }}
      animate={{ 
        opacity: folded ? 0.3 : 1, 
        y: 0, 
        rotate: rotationAngle,
        x: xOffset,
        scale: folded ? 0.9 : 1
      }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: index * 0.1
      }}
      style={{ 
        transformOrigin: 'bottom center',
        zIndex: index
      }}
      className="absolute w-20 h-[110px] rounded-lg shadow-2xl overflow-hidden bg-white"
    >
      <img 
        src={getCardImageUrl(card)} 
        alt={`${card.rank} of ${card.suit}`}
        className="w-full h-full object-contain"
        style={{ 
          display: 'block',
          imageRendering: '-webkit-optimize-contrast'
        }}
      />
    </motion.div>
  );
}

// 効果音生成用のユーティリティ関数
const playSound = (type: 'chip' | 'card' | 'fold' | 'check' | 'win') => {
  if (typeof window === 'undefined') return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch (type) {
    case 'chip':
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      break;
      
    case 'card':
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.08);
      break;
      
    case 'fold':
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      break;
      
    case 'check':
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
      break;
      
    case 'win':
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
  }
};

export default function ActiveGamePage() {
  const router = useRouter();
  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [raiseAmount, setRaiseAmount] = useState(50);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [showAllIn, setShowAllIn] = useState(false);
  const [showWinnerHand, setShowWinnerHand] = useState<string | null>(null);
  const [flyingChips, setFlyingChips] = useState<{ id: number; from: string }[]>([]);
  const [chipIdCounter, setChipIdCounter] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayPot, setDisplayPot] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; text: string; sender: string; time: string }>>([]);
  const [turnTimer, setTurnTimer] = useState(15);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);

  // 初期化: ゲーム作成
  const { user: authUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 開発モード: 認証をバイパス
    const isDev = process.env.NODE_ENV === 'development';
    let userId: string;

    if (isDev && (!isAuthenticated || !authUser)) {
      // 開発モードでは自動的にテストユーザーを使用
      userId = 'dev-user-1';
      console.log('Development mode: Using test user', userId);
    } else if (!isAuthenticated || !authUser) {
      setIsLoading(false);
      router.push('/auth/login');
      return;
    } else {
      userId = authUser.id;
    }

    // ユーザー情報取得
    getUser(userId).then(setCurrentUser).catch(console.error);

    // ゲーム作成（9人テーブル）
    createGame(9, userId)
      .then((newGame) => {
        console.log('[Frontend] Game created:', newGame.id, 'Players:', newGame.players.length);
        setGameId(newGame.id);
        setGame(newGame);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to create game:', error);
        setIsLoading(false);
      });
  }, [router, isAuthenticated, authUser]);

  // ゲーム状態のポーリング（簡易版 - 実際はSocket.ioを使用すべき）
  useEffect(() => {
    if (!gameId) return;

    const interval = setInterval(async () => {
      try {
        const updatedGame = await getGame(gameId);
        setGame(updatedGame);
      } catch (error) {
        console.error('Failed to fetch game:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameId]);

  // ショーダウン処理
  useEffect(() => {
    if (game?.phase === 'showdown') {
      if (game?.winnerHand) {
        setShowWinnerHand(game.winnerHand);
        setTimeout(() => setShowWinnerHand(null), 2000);
      }
      const currentUserId = authUser?.id || 'dev-user-1';
      const heroPlayer = game.players.find(p => p.id.includes(currentUserId) || p.name.includes('Player'));
      
      if (game?.winnerId && game.winnerId === heroPlayer?.id) {
        playSound('win');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      if (heroPlayer) {
        updateUserChips(currentUserId, heroPlayer.chips).catch(console.error);
      }

      const timer = setTimeout(() => {
        setGameId(null);
        setIsLoading(true);
        createGame(9, currentUserId)
          .then((newGame) => {
            console.log('[Frontend] New game created after hand:', newGame.id);
            setGameId(newGame.id);
            setGame(newGame);
            setIsLoading(false);
          })
          .catch(console.error);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [game?.phase]);

  // フロップ、ターン、リバー時のカード音
  useEffect(() => {
    if (game?.phase === 'flop' || game?.phase === 'turn' || game?.phase === 'river') {
      playSound('card');
    }
  }, [game?.phase, game?.communityCards?.length]);

  // ポットのアニメーション
  useEffect(() => {
    if (game?.pot !== undefined && game.pot !== displayPot) {
      const diff = game.pot - displayPot;
      const steps = 10;
      const increment = diff / steps;
      let current = displayPot;
      
      const interval = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= game.pot) || (increment < 0 && current <= game.pot)) {
          setDisplayPot(game.pot);
          clearInterval(interval);
        } else {
          setDisplayPot(Math.round(current));
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [game?.pot, displayPot]);

  const currentUserId = authUser?.id || 'dev-user-1';
  const player = game?.players.find(p => 
    p.id.includes(currentUserId) || 
    p.name.toLowerCase().includes(currentUserId.toLowerCase()) ||
    (currentUserId === 'dev-user-1' && p.name.includes('dev'))
  );

  // プレイヤーターン判定
  useEffect(() => {
    if (!game || game.phase === 'showdown' || !player) {
      setIsPlayerTurn(false);
      return;
    }

    const playerIndex = game.players.findIndex(p => p.id === player.id);
    const isMyTurn = game.currentPlayerIndex === playerIndex && !player.folded;

    setIsPlayerTurn(isMyTurn);
    
    if (isMyTurn) {
      setTurnTimer(15);
    }
  }, [game, player]);

  // ターンタイマー
  useEffect(() => {
    if (!isPlayerTurn || turnTimer <= 0) return;

    const interval = setInterval(() => {
      setTurnTimer(prev => {
        if (prev <= 1) {
          const canCheck = game?.currentBet === 0 || player?.currentBet === game?.currentBet;
          handleAction(canCheck ? 'check' : 'fold');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlayerTurn, turnTimer]);

  const handleAction = async (action: PlayerAction) => {
    if (!gameId || isActionPending) return;

    setIsActionPending(true);

    // 効果音を再生
    if (action === 'fold') {
      playSound('fold');
    } else if (action === 'check') {
      playSound('check');
    } else if (action === 'raise' || action === 'call') {
      playSound('chip');
    }

    if (action === 'raise' || action === 'call') {
      const newChip = { id: chipIdCounter, from: 'player' };
      setFlyingChips(prev => [...prev, newChip]);
      setChipIdCounter(prev => prev + 1);
      setTimeout(() => {
        setFlyingChips(prev => prev.filter(chip => chip.id !== newChip.id));
      }, 800);
    }
    
    if (action === 'raise') {
      if (raiseAmount === player?.chips) {
        setShowAllIn(true);
        setTimeout(() => setShowAllIn(false), 2000);
      }
    }

    try {
      if (!player) {
        console.error('No player found');
        setIsActionPending(false);
        return;
      }
      const updatedGame = await performAction(gameId, player.id, action, action === 'raise' ? raiseAmount : undefined);
      setGame(updatedGame);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsActionPending(false);
    }
  };

  // 対戦相手を時計回りの順序で並べ替え
  const getOpponentsInClockwiseOrder = () => {
    if (!game || !player) return [];
    
    const playerIndex = game.players.findIndex(p => p.id === player.id);
    if (playerIndex === -1) return game.players.filter(p => p.id !== player.id);
    
    const opponents = [];
    for (let i = 1; i < game.players.length; i++) {
      const index = (playerIndex + i) % game.players.length;
      opponents.push(game.players[index]);
    }
    return opponents;
  };

  const opponents = getOpponentsInClockwiseOrder();
  const canCheck = game?.currentBet === 0 || player?.currentBet === game?.currentBet;
  const canCall = (game?.currentBet ?? 0) > 0 && player?.currentBet !== game?.currentBet;

  const getPlayerPosition = (index: number, total: number) => {
    const positions = [
      { top: '58%', left: '18%', transform: 'translate(-50%, 0)' },
      { top: '35%', left: '18%', transform: 'translate(-50%, 0)' },
      { top: '18%', left: '18%', transform: 'translate(-50%, 0)' },
      { top: '4%', left: '32%', transform: 'translate(-50%, 0)' },
      { top: '4%', left: '68%', transform: 'translate(-50%, 0)' },
      { top: '18%', left: '82%', transform: 'translate(-50%, 0)' },
      { top: '35%', left: '82%', transform: 'translate(-50%, 0)' },
      { top: '58%', left: '82%', transform: 'translate(-50%, 0)' },
      { top: '72%', left: '50%', transform: 'translate(-50%, 0)' }
    ];

    if (index >= positions.length) return positions[0];
    return positions[index];
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-green-900">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="Poker in Japan background"
        src="/poker-bg.png"
      />
      
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-2xl">読み込み中...</div>
        </div>
      ) : game && (
        <>
          {showAllIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-yellow-500/20 to-red-600/20 animate-pulse" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 10 
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.5 
                    }}
                    className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 drop-shadow-2xl"
                    style={{
                      textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.6)'
                    }}
                  >
                    ALL IN
                  </motion.div>
                  <motion.div
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1 
                    }}
                    className="absolute inset-0 bg-yellow-400/30 blur-3xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {showWinnerHand && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-amber-500/20 to-yellow-600/20 animate-pulse" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 10 
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.5 
                    }}
                    className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 drop-shadow-2xl"
                    style={{
                      textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(251, 191, 36, 0.6)'
                    }}
                  >
                    {showWinnerHand}
                  </motion.div>
                  <motion.div
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1 
                    }}
                    className="absolute inset-0 bg-yellow-400/30 blur-3xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {flyingChips.map(chip => (
            <motion.div
              key={chip.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                x: 0,
                y: -300,
                opacity: 0,
                scale: 0.5
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-3xl"
            >
              🪙
            </motion.div>
          ))}

          {showConfetti && (
            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0, 
                    y: -20,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                    rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "linear"
                  }}
                  className="absolute w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98'][Math.floor(Math.random() * 5)]
                  }}
                />
              ))}
            </div>
          )}
          
          <Sheet open={showMenu} onOpenChange={setShowMenu}>
            <SheetTrigger asChild>
              <Button
                data-testid="button-menu"
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 z-10 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
              <SheetHeader>
                <SheetTitle className="text-white text-xl">メニュー</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <Button
                  data-testid="menu-hand-history"
                  onClick={() => { setShowMenu(false); router.push('/history'); }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <History className="mr-3 h-5 w-5" />
                  ハンド履歴
                </Button>
                <Button
                  data-testid="menu-profile"
                  onClick={() => { setShowMenu(false); router.push('/profile'); }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <UserCircle className="mr-3 h-5 w-5" />
                  プロフィール編集
                </Button>
                <Button
                  data-testid="menu-earnings"
                  onClick={() => { setShowMenu(false); }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <Trophy className="mr-3 h-5 w-5" />
                  獲得金額
                </Button>
                <Button
                  data-testid="menu-share"
                  onClick={() => { 
                    setShowMenu(false);
                    if (typeof window !== 'undefined' && navigator.share) {
                      navigator.share({
                        title: 'Poker in Japan',
                        text: 'テキサスホールデムポーカーをプレイしよう！',
                        url: window.location.href
                      });
                    }
                  }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <Share2 className="mr-3 h-5 w-5" />
                  シェア
                </Button>
                <Button
                  data-testid="menu-players"
                  onClick={() => { setShowMenu(false); setShowPlayerList(true); }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <UserCog className="mr-3 h-5 w-5" />
                  プレイヤーリスト
                </Button>
                <Button
                  data-testid="menu-stats"
                  onClick={() => { setShowMenu(false); setShowStats(true); }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  統計
                </Button>
                <Button
                  data-testid="menu-settings"
                  onClick={() => { setShowMenu(false); router.push('/profile'); }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  設定
                </Button>
                <Button
                  data-testid="menu-rules"
                  onClick={() => { setShowMenu(false); }}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                >
                  <Book className="mr-3 h-5 w-5" />
                  ゲームルール
                </Button>
                <div className="pt-4 border-t border-slate-700">
                  <Button
                    data-testid="menu-logout"
                    onClick={() => { 
                      useAuthStore.getState().logout();
                      router.push('/auth/login');
                    }}
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    ログアウト
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={showChat} onOpenChange={setShowChat}>
            <SheetTrigger asChild>
              <Button
                data-testid="button-chat"
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700 flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-white text-xl">チャット</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2">
                {chatMessages.length === 0 ? (
                  <div className="text-slate-400 text-center py-8">
                    メッセージはまだありません
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-blue-400">{msg.sender}</span>
                        <span className="text-xs text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <Button
                    data-testid="button-emotes"
                    onClick={() => setShowEmotes(!showEmotes)}
                    variant="outline"
                    size="icon"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    😊
                  </Button>
                  <Input
                    data-testid="input-chat-message"
                    placeholder="メッセージを入力..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatMessage.trim()) {
                        const now = new Date();
                        setChatMessages([...chatMessages, {
                          id: Date.now(),
                          text: chatMessage,
                          sender: currentUser?.displayName || currentUser?.username || 'あなた',
                          time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
                        }]);
                        setChatMessage('');
                      }
                    }}
                    className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <Button
                    data-testid="button-send-chat"
                    onClick={() => {
                      if (chatMessage.trim()) {
                        const now = new Date();
                        setChatMessages([...chatMessages, {
                          id: Date.now(),
                          text: chatMessage,
                          sender: currentUser?.displayName || currentUser?.username || 'あなた',
                          time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
                        }]);
                        setChatMessage('');
                      }
                    }}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {showEmotes && (
                  <div className="grid grid-cols-6 gap-2 p-2 bg-slate-800/50 rounded-lg">
                    {['👍', '❤️', '😂', '😎', '🔥', '💰', '🎉', '😢', '😱', '💪', '🤝', '🙏'].map((emote) => (
                      <button
                        key={emote}
                        onClick={() => {
                          const now = new Date();
                          setChatMessages([...chatMessages, {
                            id: Date.now(),
                            text: emote,
                            sender: currentUser?.displayName || currentUser?.username || 'あなた',
                            time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
                          }]);
                          setShowEmotes(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emote}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 px-8 py-3 rounded-lg text-xl font-bold">
            {game.phase === 'preflop' && 'プリフロップ'}
            {game.phase === 'flop' && 'フロップ'}
            {game.phase === 'turn' && 'ターン'}
            {game.phase === 'river' && 'リバー'}
            {game.phase === 'showdown' && 'ショーダウン'}
          </div>

          {opponents.map((opp, idx) => {
            const position = getPlayerPosition(idx, opponents.length);
            const oppPlayerIndex = game.players.findIndex(p => p.id === opp.id);
            const isOppTurn = !opp.folded && game.phase !== 'showdown' && game.currentPlayerIndex === oppPlayerIndex;
            return (
              <div
                key={opp.id}
                className="absolute flex flex-col items-center"
                style={position}
              >
                <div className="flex items-center gap-1 mb-1 relative">
                  <div className="relative">
                    {isOppTurn && (
                      <svg className="absolute -inset-1 w-[72px] h-[72px]" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                          cx="36"
                          cy="36"
                          r="34"
                          stroke="rgba(59, 130, 246, 0.3)"
                          strokeWidth="4"
                          fill="none"
                        />
                        <motion.circle
                          cx="36"
                          cy="36"
                          r="34"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={213.6}
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: 213.6 * (1 - turnTimer / 15) }}
                          transition={{ duration: 0.3 }}
                        />
                      </svg>
                    )}
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg ${opp.folded ? 'opacity-50' : ''} ${game.phase === 'showdown' && game.winnerId === opp.id ? 'ring-4 ring-yellow-400 shadow-2xl' : ''}`}>
                      <User className="w-10 h-10 text-white" />
                    </div>
                    {isOppTurn && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-lg z-20"
                      >
                        {turnTimer}秒
                      </motion.div>
                    )}
                  </div>
                  {game.phase === 'showdown' && game.winnerId === opp.id && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg z-20">
                      勝者
                    </div>
                  )}
                  {opp.isDealer && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-white text-black rounded-full font-bold text-xs flex items-center justify-center border-2 border-yellow-500 shadow-lg z-10">
                      D
                    </div>
                  )}
                  {opp.isSmallBlind && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full font-bold text-xs flex items-center justify-center border-2 border-red-300 shadow-lg z-10">
                      SB
                    </div>
                  )}
                  {opp.isBigBlind && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-700 text-white rounded-full font-bold text-xs flex items-center justify-center border-2 border-blue-400 shadow-lg z-10">
                      BB
                    </div>
                  )}
                  {opp.hand.length > 0 && !opp.folded && (
                    <div className="relative w-16 h-11">
                      {game.phase === 'showdown' ? (
                        opp.hand.map((card, i) => (
                          <OpponentCardComponent key={i} card={card} index={i} total={opp.hand.length} folded={opp.folded} />
                        ))
                      ) : (
                        opp.hand.map((_, i) => (
                          <CardBack key={i} index={i} total={opp.hand.length} />
                        ))
                      )}
                    </div>
                  )}
                  {opp.currentBet > 0 && !opp.folded && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold border-2 border-blue-400 flex items-center gap-0.5 shadow-lg z-10">
                      <span className="text-xs">🪙</span>
                      {opp.currentBet}
                    </div>
                  )}
                </div>
                <div className={`bg-black/70 text-white px-4 py-2 rounded text-center ${opp.folded ? 'opacity-50' : ''}`}>
                  <div className="text-base font-semibold">{opp.name}</div>
                  <div className="text-sm flex items-center justify-center gap-1">
                    <span className="text-base">🪙</span>
                    <span>チップ: {opp.chips}</span>
                  </div>
                </div>
                {opp.lastAction && (
                  <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded ${
                    opp.lastAction === 'fold' ? 'bg-red-500 text-white' :
                    opp.lastAction === 'raise' ? 'bg-yellow-500 text-white' :
                    opp.lastAction === 'call' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {opp.lastAction === 'fold' ? 'フォールド' :
                     opp.lastAction === 'raise' ? 'レイズ' :
                     opp.lastAction === 'call' ? 'コール' :
                     'チェック'}
                  </div>
                )}
              </div>
            );
          })}

          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
            {game.communityCards.length > 0 && (
              <div className="flex gap-2 mb-2">
                {game.communityCards.map((card, i) => (
                  <CardComponent key={i} card={card} />
                ))}
              </div>
            )}
            
            <motion.div
              key={displayPot}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              className="bg-black/70 text-white px-8 py-3 rounded-full text-xl font-bold flex items-center gap-3"
            >
              <span className="text-2xl">🪙</span>
              <span>ポット: {displayPot}</span>
            </motion.div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center gap-2 mb-2 relative">
                <div className="relative">
                  {isPlayerTurn && (
                    <svg className="absolute -inset-1 w-[72px] h-[72px]" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="36"
                        cy="36"
                        r="34"
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <motion.circle
                        cx="36"
                        cy="36"
                        r="34"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={213.6}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 213.6 * (1 - turnTimer / 15) }}
                        transition={{ duration: 0.3 }}
                      />
                    </svg>
                  )}
                  <motion.div
                    animate={
                      !player?.folded && game.phase !== 'showdown' && game.currentPlayerIndex === 0
                        ? {
                            boxShadow: [
                              '0 0 0 0 rgba(59, 130, 246, 0.7)',
                              '0 0 0 10px rgba(59, 130, 246, 0)',
                              '0 0 0 0 rgba(59, 130, 246, 0.7)'
                            ]
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl overflow-hidden ${player?.folded ? 'opacity-50' : ''} ${game.phase === 'showdown' && game.winnerId === '1' ? 'ring-4 ring-yellow-400 shadow-2xl' : ''}`}
                  >
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </motion.div>
                  {isPlayerTurn && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-lg z-20"
                    >
                      {turnTimer}秒
                    </motion.div>
                  )}
                </div>
                {game.phase === 'showdown' && game.winnerId === '1' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg z-20">
                    勝者
                  </div>
                )}
                {player?.isDealer && (
                  <div className="absolute -top-2 left-1 w-7 h-7 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center border-2 border-yellow-500 shadow-lg z-10">
                    D
                  </div>
                )}
                {player?.isSmallBlind && (
                  <div className="absolute -top-2 left-1 w-7 h-7 bg-red-500 text-white rounded-full font-bold text-[10px] flex items-center justify-center border-2 border-red-300 shadow-lg z-10">
                    SB
                  </div>
                )}
                {player?.isBigBlind && (
                  <div className="absolute -top-2 left-1 w-7 h-7 bg-blue-700 text-white rounded-full font-bold text-[10px] flex items-center justify-center border-2 border-blue-400 shadow-lg z-10">
                    BB
                  </div>
                )}
                {player && player.hand.length > 0 && (
                  <div className="relative w-full h-32 pl-12">
                    {player.hand.map((card, i) => (
                      <PlayerCardComponent key={i} card={card} index={i} total={player.hand.length} folded={player.folded} />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
                <div className="text-lg font-semibold">{currentUser?.displayName || currentUser?.username || 'あなた'}</div>
                <div className="text-base flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="text-base">🪙</span>
                    チップ: {player?.chips}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-base">🪙</span>
                    ベット: {player?.currentBet}
                  </span>
                </div>
              </div>
            </div>

            {!player?.folded && game.phase !== 'showdown' && (
              <div className="space-y-2">
                {!showRaiseSlider ? (
                  <div className="flex gap-2 justify-center">
                    <Button
                      data-testid="button-fold"
                      onClick={() => handleAction('fold')}
                      disabled={isActionPending}
                      className="flex-1 h-14 text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white"
                    >
                      フォールド
                    </Button>
                    {canCheck && (
                      <Button
                        data-testid="button-check"
                        onClick={() => handleAction('check')}
                        disabled={isActionPending}
                        className="flex-1 h-14 text-lg bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white"
                      >
                        チェック
                      </Button>
                    )}
                    {canCall && (
                      <Button
                        data-testid="button-call"
                        onClick={() => handleAction('call')}
                        disabled={isActionPending}
                        className="flex-1 h-14 text-lg bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white"
                      >
                        コール
                      </Button>
                    )}
                    <Button
                      data-testid="button-raise"
                      onClick={() => setShowRaiseSlider(true)}
                      disabled={isActionPending}
                      className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
                    >
                      レイズ
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🪙</span>
                        <span className="text-white text-3xl font-bold">
                          {raiseAmount === player?.chips ? 'オールイン' : raiseAmount}
                        </span>
                      </div>
                      <Slider
                        value={[raiseAmount]}
                        onValueChange={(value) => setRaiseAmount(value[0])}
                        min={10}
                        max={player?.chips || 0}
                        step={10}
                        orientation="vertical"
                        className="h-32"
                      />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        data-testid="button-cancel-raise"
                        onClick={() => setShowRaiseSlider(false)}
                        disabled={isActionPending}
                        variant="secondary"
                        className="flex-1 h-14 text-lg"
                      >
                        キャンセル
                      </Button>
                      <Button
                        data-testid="button-confirm-raise"
                        onClick={() => {
                          handleAction('raise');
                          setShowRaiseSlider(false);
                        }}
                        disabled={isActionPending}
                        className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
                      >
                        {raiseAmount === player?.chips ? 'オールイン確定' : 'レイズ確定'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* プレイヤーリストモーダル */}
          <Sheet open={showPlayerList} onOpenChange={setShowPlayerList}>
            <SheetContent side="right" className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
              <SheetHeader>
                <SheetTitle className="text-white text-xl">プレイヤーリスト</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {game?.players.map((p, idx) => (
                  <div key={p.id} className="bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{p.name}</div>
                          <div className="text-xs text-slate-400">座席 {idx + 1}</div>
                        </div>
                      </div>
                      {p.folded && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">フォールド</span>
                      )}
                      {p.isDealer && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">D</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <span>🪙</span> {p.chips}
                      </span>
                      {p.currentBet > 0 && (
                        <span className="flex items-center gap-1 text-blue-400">
                          ベット: {p.currentBet}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* 統計情報モーダル */}
          <Sheet open={showStats} onOpenChange={setShowStats}>
            <SheetContent side="right" className="w-96 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
              <SheetHeader>
                <SheetTitle className="text-white text-xl">ゲーム統計</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">現在のゲーム</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ゲームフェーズ:</span>
                      <span className="font-semibold">
                        {game?.phase === 'preflop' && 'プリフロップ'}
                        {game?.phase === 'flop' && 'フロップ'}
                        {game?.phase === 'turn' && 'ターン'}
                        {game?.phase === 'river' && 'リバー'}
                        {game?.phase === 'showdown' && 'ショーダウン'}
                        {game?.phase === 'waiting' && '待機中'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ポット:</span>
                      <span className="font-semibold flex items-center gap-1">
                        <span>🪙</span> {game?.pot || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">プレイヤー数:</span>
                      <span className="font-semibold">{game?.players.length || 0} 人</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">アクティブ:</span>
                      <span className="font-semibold">
                        {game?.players.filter(p => !p.folded).length || 0} 人
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-400">あなたの統計</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">現在のチップ:</span>
                      <span className="font-semibold flex items-center gap-1">
                        <span>🪙</span> {player?.chips || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">現在のベット:</span>
                      <span className="font-semibold flex items-center gap-1">
                        <span>🪙</span> {player?.currentBet || 0}
                      </span>
                    </div>
                    {player?.hand && player.hand.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">ハンド:</span>
                        <span className="font-semibold">
                          {player.hand.map(c => `${c.rank}${c.suit === 'hearts' ? '♥' : c.suit === 'diamonds' ? '♦' : c.suit === 'clubs' ? '♣' : '♠'}`).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">コミュニティカード</h3>
                  <div className="space-y-2 text-sm">
                    {game?.communityCards && game.communityCards.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {game.communityCards.map((card, i) => (
                          <span key={i} className="px-2 py-1 bg-white text-black rounded font-semibold">
                            {card.rank}{card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400">まだカードが配られていません</p>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </main>
  );
}
