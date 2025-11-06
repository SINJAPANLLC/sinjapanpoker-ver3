'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Menu, MessageCircle, Wifi, WifiOff, Maximize, Minimize, Info, History, Eye } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoneyModeStore } from '@/store/useMoneyModeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { usePokerGame } from '@/hooks/usePokerGame';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

// CPUプレイヤーの名前リスト
const CPU_NAMES = [
  'タケシ', 'ユウキ', 'ケンジ', 'マサヒロ', 'カズヤ',
  'サトシ', 'ヒロシ', 'ダイスケ', 'リョウタ', 'コウジ'
];

export default function ActiveGamePage() {
  const router = useRouter();
  const { mode, isEnabled } = useMoneyModeStore();
  const { user: authUser } = useAuthStore();
  const { currency } = useCurrencyStore();
  const searchParams = useSearchParams();
  
  // 練習モード検出
  const isPracticeMode = searchParams?.get('mode') === 'practice';
  const difficulty = searchParams?.get('difficulty') || 'medium';
  
  // デモユーザー（認証なしでテスト）- useStateで一貫性を保つ
  const [demoUser] = useState({
    id: `demo-${Math.random().toString(36).substring(7)}`,
    username: `プレイヤー${Math.floor(Math.random() * 100)}`,
    email: 'demo@test.com',
    chips: 1000,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
  });
  
  const user = authUser || demoUser;
  
  const tableId = (searchParams && searchParams.get('table')) || (isPracticeMode ? 'practice-game' : 'test-game-1');
  
  // Socket.io ゲームステート
  const {
    gameState,
    messages: socketMessages,
    connected,
    error: socketError,
    joinGame,
    performAction,
    sendMessage: sendSocketMessage,
    setAwayStatus,
    getCurrentPlayer,
    isMyTurn,
    canCheck,
    canCall,
    getCallAmount,
    getMinRaise,
  } = usePokerGame(tableId, difficulty);
  
  const [raiseAmount, setRaiseAmount] = useState(200);
  const [turnTimer, setTurnTimer] = useState(15);
  const [hasPlayedWarningSound, setHasPlayedWarningSound] = useState(false);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);
  const [autoCheckFold, setAutoCheckFold] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [showRebuy, setShowRebuy] = useState(false);
  const [showTableInfo, setShowTableInfo] = useState(false);
  const [showHandHistory, setShowHandHistory] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [showActionLog, setShowActionLog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [winnerPlayerId, setWinnerPlayerId] = useState<number | null>(null);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [chipAnimations, setChipAnimations] = useState<Array<{ id: number; playerId: number }>>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('日本語');
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);
  const [isAway, setIsAway] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [dealingCards, setDealingCards] = useState(false);
  const [revealFlop, setRevealFlop] = useState(false);
  const [revealTurn, setRevealTurn] = useState(false);
  const [revealRiver, setRevealRiver] = useState(false);
  const [showWinnerChips, setShowWinnerChips] = useState(false);
  const [showHandRank, setShowHandRank] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [allInPlayer, setAllInPlayer] = useState<number | null>(null);
  const [dealerButtonMoving, setDealerButtonMoving] = useState(false);
  const [showShuffling, setShowShuffling] = useState(false);
  const [winningCards, setWinningCards] = useState<string[]>([]);
  const [showPlayerTurn, setShowPlayerTurn] = useState(false);
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<string>('');
  const [joiningPlayer, setJoiningPlayer] = useState<number | null>(null);
  const [leavingPlayer, setLeavingPlayer] = useState<number | null>(null);
  const [betIncrease, setBetIncrease] = useState<{playerId: number, amount: number} | null>(null);
  const [showBadBeat, setShowBadBeat] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [winStreak, setWinStreak] = useState(0);
  const [showRebuyNotification, setShowRebuyNotification] = useState(false);
  const [rebuyAmount, setRebuyAmount] = useState(0);
  const [tableAtmosphere, setTableAtmosphere] = useState<'normal' | 'final'>('normal');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, player: 'プレイヤー2', message: 'よろしく！', time: '12:30' },
    { id: 2, player: 'プレイヤー6', message: 'いい手だ！', time: '12:32' },
    { id: 3, player: 'プレイヤー9', message: 'よし、勝負！', time: '12:34' },
  ]);
  const [playerBubbles, setPlayerBubbles] = useState<Record<string, { message: string; timestamp: number }>>({});
  const lastProcessedTimestampRef = useRef(0);
  
  // 効果音を再生する関数
  const playSound = useCallback((type: 'action' | 'warning') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'action') {
      // アクション音：短いビープ音
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'warning') {
      // 警告音：2回のビープ音
      oscillator.frequency.value = 1200;
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.25);
    }
  }, []);
  
  // 動的な値として計算
  const currentPlayer = getCurrentPlayer();
  const callAmount = getCallAmount();
  const minRaise = getMinRaise();
  const maxRaise = currentPlayer?.chips || 0;

  const actionLog = [
    { player: 'プレイヤー2', action: 'レイズ 200', time: '12:34' },
    { player: 'プレイヤー6', action: 'コール 200', time: '12:35' },
    { player: 'プレイヤー9', action: 'コール 200', time: '12:35' },
    { player: 'プレイヤー5', action: 'フォールド', time: '12:36' },
    { player: 'プレイヤー7', action: 'フォールド', time: '12:36' },
  ];

  // プレイヤーが変わったらタイマーをリセット
  useEffect(() => {
    if (gameState?.currentPlayerIndex !== undefined && gameState?.phase !== 'finished' && gameState?.phase !== 'waiting') {
      setTurnTimer(15);
      setHasPlayedWarningSound(false);
    }
  }, [gameState?.currentPlayerIndex, gameState?.phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTurnTimer((prev) => {
        // 5秒前に警告音を再生
        if (prev === 5 && !hasPlayedWarningSound) {
          const currentPlayerInTurn = gameState?.players[gameState?.currentPlayerIndex];
          if (currentPlayerInTurn && currentPlayerInTurn.userId === user?.id) {
            playSound('warning');
            setHasPlayedWarningSound(true);
          }
        }
        
        if (prev <= 1) {
          // タイマーが0になったら自動アクション
          const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];
          if (currentPlayer && currentPlayer.userId === user?.id && gameState?.phase !== 'finished' && gameState?.phase !== 'waiting') {
            // チェックできる場合（currentBet === 自分のbet）はチェック、できない場合はフォールド
            if (gameState.currentBet === currentPlayer.bet) {
              performAction('check');
            } else {
              performAction('fold');
            }
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, user, performAction, hasPlayedWarningSound, playSound]);

  // ゲームに参加（ブラインド設定を含む）
  useEffect(() => {
    if (connected && user && !gameState) {
      // tableInfoが読み込まれるのを少し待つ
      setTimeout(() => {
        const blinds = tableInfo?.blinds || tableInfo?.settings?.blinds || undefined;
        // 練習モードの場合は10000チップ（gameChips）、通常モードは実際の所持チップ（realChips）
        const chips = isPracticeMode ? (currency.gameChips || 10000) : (currency.realChips || 0);
        joinGame(chips, blinds);
      }, 100);
    }
  }, [connected, user, gameState, joinGame, isPracticeMode, currency]);

  // 接続ステータスの同期
  useEffect(() => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, [connected]);

  // フェーズ遷移のアニメーション
  useEffect(() => {
    if (!gameState) return;
    
    if (gameState.phase === 'preflop' && gameState.players.length >= 2) {
      setDealingCards(true);
      setTimeout(() => setDealingCards(false), 1000);
    } else if (gameState.phase === 'flop') {
      setRevealFlop(true);
      setTimeout(() => setRevealFlop(false), 500);
    } else if (gameState.phase === 'turn') {
      setRevealTurn(true);
      setTimeout(() => setRevealTurn(false), 500);
    } else if (gameState.phase === 'river') {
      setRevealRiver(true);
      setTimeout(() => setRevealRiver(false), 500);
    } else if (gameState.phase === 'finished' && gameState.winners) {
      setShowWinnerAnimation(true);
      setShowWinnerChips(true);
      setTimeout(() => {
        setShowWinnerAnimation(false);
        setShowWinnerChips(false);
      }, 3000);
    }
  }, [gameState?.phase]);

  // チャットメッセージの同期
  useEffect(() => {
    if (socketMessages.length === 0) return;
    
    // 最新メッセージのみ処理
    const latestMsg = socketMessages[socketMessages.length - 1];
    if (!latestMsg || latestMsg.timestamp <= lastProcessedTimestampRef.current) {
      return;
    }
    
    // チャット履歴を更新（重複チェック付き）
    setChatMessages(prev => {
      const existingIds = new Set(prev.map(msg => `${msg.player}-${msg.time}-${msg.message}`));
      const newMessages = socketMessages
        .filter(msg => {
          const msgId = `${msg.username}-${new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}-${msg.message}`;
          return !existingIds.has(msgId);
        })
        .map((msg, idx) => ({
          id: prev.length + idx,
          player: msg.username,
          message: msg.message,
          time: new Date(msg.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        }));
      
      return [...prev, ...newMessages];
    });
    
    const username = latestMsg.username;
    const msgTimestamp = latestMsg.timestamp;
    
    // 吹き出しを表示
    setPlayerBubbles(prev => ({
      ...prev,
      [username]: { message: latestMsg.message, timestamp: msgTimestamp }
    }));
    
    // タイムアウトIDを保存して後でクリアできるようにする
    const timeoutId = setTimeout(() => {
      setPlayerBubbles(prev => {
        // このタイムスタンプのメッセージのみ削除
        if (prev[username]?.timestamp === msgTimestamp) {
          const newBubbles = { ...prev };
          delete newBubbles[username];
          return newBubbles;
        }
        return prev;
      });
    }, 3000);
    
    lastProcessedTimestampRef.current = msgTimestamp;
    
    // クリーンアップ
    return () => clearTimeout(timeoutId);
  }, [socketMessages]);

  // 離席状態が変更されたらサーバーに送信
  useEffect(() => {
    if (setAwayStatus) {
      setAwayStatus(isAway);
    }
  }, [isAway, setAwayStatus]);
  
  // 実際のゲームステートからデータを取得
  const convertSocketCard = (card: any): CardType => {
    const suitMap: Record<string, Suit> = {
      '♠': 'spades',
      '♥': 'hearts',
      '♦': 'diamonds',
      '♣': 'clubs',
    };
    return {
      rank: card.rank as Rank,
      suit: suitMap[card.suit] || 'spades',
      id: card.id,
    };
  };

  const communityCards: CardType[] = gameState?.communityCards.map(convertSocketCard) || [];
  const pot = gameState?.pot || 0;
  const potAmount = pot; // ポットの総額
  
  // サイドポットの合計を計算（実際にサイドポットが存在する場合のみ）
  const sidePotTotal = gameState?.sidePots?.reduce((sum, sp) => sum + sp.amount, 0) || 0;
  const hasSidePots = (gameState?.sidePots?.length || 0) > 1 && sidePotTotal > 0;
  
  // ロビーで設定したテーブル情報を取得（useEffectで処理）
  const [tableInfo, setTableInfo] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !tableId) return;
    try {
      const savedTables = localStorage.getItem('poker_tables');
      if (savedTables) {
        const tables = JSON.parse(savedTables);
        const found = tables.find((t: any) => t.id === tableId);
        if (found) {
          setTableInfo(found);
        }
      }
    } catch (error) {
      console.error('Failed to load table info:', error);
    }
  }, [tableId]);
  
  const tableName = tableInfo?.name || gameState?.id || "SIN JAPAN TABLE #1";
  const handNumber = 42;
  const smallBlind = tableInfo?.blinds?.small || gameState?.blinds?.small || 10;
  const bigBlind = tableInfo?.blinds?.big || gameState?.blinds?.big || 20;
  const gamePhase = gameState?.phase.toUpperCase() || "WAITING";

  const currentPlayerData = getCurrentPlayer();
  const player1HandCards: CardType[] = currentPlayerData?.cards.map(convertSocketCard) || [];
  
  // 現在の役を計算
  const getCurrentHandRank = () => {
    if (!currentPlayerData || player1HandCards.length === 0) return 'ハイカード';
    
    const allCards = [...player1HandCards, ...communityCards];
    if (allCards.length < 2) return 'ハイカード';
    
    // 簡易的な役判定（実際の評価ロジックはserver/poker-helpers.jsを使用）
    const hasFlush = (cards: CardType[]) => {
      if (cards.length < 5) return false;
      const suitCounts: Record<string, number> = {};
      cards.forEach(c => suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1);
      return Object.values(suitCounts).some(count => count >= 5);
    };
    
    const hasPair = (cards: CardType[]) => {
      if (cards.length < 2) return false;
      const rankCounts: Record<string, number> = {};
      cards.forEach(c => rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1);
      const counts = Object.values(rankCounts).sort((a, b) => b - a);
      
      if (counts.some(c => c >= 4)) return 'フォーカード';
      // フルハウス：3枚+2枚（別のランク）
      if (counts[0] >= 3 && counts[1] >= 2) return 'フルハウス';
      if (counts.some(c => c >= 3)) return 'スリーカード';
      const pairs = counts.filter(c => c >= 2).length;
      if (pairs >= 2) return 'ツーペア';
      if (pairs === 1) return 'ワンペア';
      return null;
    };
    
    if (hasFlush(allCards)) return 'フラッシュ';
    const pairResult = hasPair(allCards);
    if (pairResult) return pairResult;
    
    return 'ハイカード';
  };
  
  const currentHandRank = getCurrentHandRank();

  // プレイヤーリストを自分を基準に並び替え（自分が常にプレイヤー1の位置）
  const getRotatedPlayers = () => {
    if (!gameState || gameState.players.length === 0) return [];
    
    // 自分のインデックスを見つける（userIdまたはusernameで比較）
    const myIndex = gameState.players.findIndex(p => 
      p.userId === user?.id || p.username === user?.username
    );
    
    if (myIndex === -1) return gameState.players;
    
    // 自分を先頭にしてプレイヤーリストを回転
    const rotatedPlayers = [
      ...gameState.players.slice(myIndex),
      ...gameState.players.slice(0, myIndex)
    ];
    
    return rotatedPlayers;
  };

  const rotatedPlayers = getRotatedPlayers();
  
  // activePlayerIdを回転後のインデックスに変換
  const getActivePlayerIdInRotatedList = () => {
    if (!gameState) return 0;
    const myIndex = gameState.players.findIndex(p => 
      p.userId === user?.id || p.username === user?.username
    );
    if (myIndex === -1) return gameState.currentPlayerIndex + 1;
    
    // 実際のcurrentPlayerIndexから自分のインデックスを引いて回転後の位置を計算
    const rotatedIndex = (gameState.currentPlayerIndex - myIndex + gameState.players.length) % gameState.players.length;
    return rotatedIndex + 1;
  };
  
  const activePlayerId = getActivePlayerIdInRotatedList();

  // 実際のゲームステートからプレイヤーデータを生成（自分を基準に並び替え済み）
  const players = rotatedPlayers.map((p, idx) => {
    const dealerIndex = gameState?.dealerIndex || 0;
    const myIndex = gameState?.players.findIndex(pl => 
      pl.userId === user?.id || pl.username === user?.username
    ) || 0;
    
    // 元のインデックスを計算
    const originalIndex = (idx + myIndex) % rotatedPlayers.length;
    
    const isDealer = p.isDealer;
    const isSmallBlind = originalIndex === (dealerIndex + 1) % rotatedPlayers.length;
    const isBigBlind = originalIndex === (dealerIndex + 2) % rotatedPlayers.length;
    
    let position = null;
    if (isDealer) position = 'D';
    else if (isSmallBlind) position = 'SB';
    else if (isBigBlind) position = 'BB';
    
    const isCurrentUser = p.userId === user?.id || p.username === user?.username;
    // アバター横のカードは全員裏向き（showdownとfinishedでは表向き、ただしフォールドしたプレイヤーは常に裏向き）
    const showCards = true;
    const showCardsFaceUp = !p.folded && (gameState?.phase === 'showdown' || gameState?.phase === 'finished');
    
    // サーバーから送られるlastActionをそのまま使用
    const lastAction = (p as any).lastAction || null;
    
    // 勝利ハイライトはゲーム終了時（finished/showdown）のみ表示
    const isWinner = (gameState?.phase === 'finished' || gameState?.phase === 'showdown') 
      && gameState?.winners?.some(w => w.username === p.username) || false;
    
    return {
      id: idx + 1,
      name: p.username,
      chips: p.chips,
      // ユーザーのアバター画像を使用（なければnull）
      avatar: p.avatar || null,
      // プレイヤー2、3、4、5（左側）はカードを右側に表示、それ以外は左側
      cardSide: (idx === 1 || idx === 2 || idx === 3 || idx === 4) ? 'right' : 'left',
      showCards,
      showCardsFaceUp,
      position,
      bet: p.bet,
      lastAction,
      folded: p.folded,
      chatMessage: playerBubbles[p.username]?.message || null,
      isWinner,
      isAllIn: p.isAllIn,
      cards: p.cards?.map(convertSocketCard) || [],
    };
  });

  const PlayerComponent = ({ player }: { player: typeof players[0] | undefined }) => {
    if (!player) return null;
    
    const isActive = player.id === activePlayerId;
    const isJoining = joiningPlayer === player.id;
    const isLeaving = leavingPlayer === player.id;
    const hasWinningCards = player.isWinner && winningCards.length > 0;
    
    return (
      <motion.div 
        style={{ position: 'relative' }}
        initial={isJoining ? { scale: 0, opacity: 0 } : false}
        animate={isLeaving ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* アクティブターンのハイライト */}
        {isActive && (
          <div className="absolute inset-0 -m-2">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></div>
          </div>
        )}
        
        {/* 勝者のカードハイライト */}
        {hasWinningCards && (
          <div className="absolute inset-0 -m-4 pointer-events-none">
            <motion.div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '9999px'
              }}
              animate={{
                boxShadow: [
                  '0 0 20px 5px rgba(251, 191, 36, 0.5)',
                  '0 0 40px 10px rgba(251, 191, 36, 0.8)',
                  '0 0 20px 5px rgba(251, 191, 36, 0.5)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        )}

        {/* ハンドカード - すべてのプレイヤーのカードを表示 */}
        {player.cards && player.cards.length > 0 && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${
            player.cardSide === 'right' 
              ? 'right-0 translate-x-1/2' 
              : 'left-0 -translate-x-1/2'
          }`} style={{ zIndex: 100 }}>
            <div className="flex items-end" style={{ perspective: '400px' }}>
              {player.cards.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="relative"
                  style={{
                    transform: `rotate(${cardIndex === 0 ? '-10deg' : '10deg'})`,
                    marginLeft: cardIndex === 1 ? '-60px' : '0',
                    zIndex: 100 + cardIndex,
                  }}
                >
                  <div className={`${
                    (gameState?.phase === 'showdown' || gameState?.phase === 'finished') && !player.folded
                      ? 'scale-[0.65]'
                      : 'scale-[0.35]'
                  } origin-center ${player.folded ? 'opacity-30' : ''}`}>
                    <Card 
                      card={card} 
                      faceUp={
                        !player.folded && (
                          (typeof player.position === 'number' && player.position === 0) || 
                          (typeof player.position === 'string' && player.position === '0') ||
                          ((gameState?.phase === 'showdown' || gameState?.phase === 'finished') && !(gameState as any)?.winByFold)
                        )
                      } 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* ベット額表示 - カードの横 */}
            {player.bet > 0 && !player.folded && gameState?.phase !== 'waiting' && gameState?.phase !== 'finished' && (
              <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                player.cardSide === 'right' ? '-right-12' : '-left-12'
              }`}>
                <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-2 py-1 rounded-md border-2 border-white shadow-lg">
                  <div className="flex items-center gap-1">
                    <Image src="/chip-icon.png" alt="chip" width={14} height={14} unoptimized />
                    <p className="text-white text-xs font-bold">{player.bet}</p>
                  </div>
                </div>
                {/* ベット増加表示 */}
                {betIncrease && betIncrease.playerId === player.id && (
                  <motion.div
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -40, opacity: 0 }}
                    transition={{ duration: 1 }}
                    onAnimationComplete={() => setBetIncrease(null)}
                    style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <p className="text-green-400 text-sm font-bold whitespace-nowrap">
                      +{betIncrease.amount}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        {/* アバターアイコン */}
        <div className="relative">
          {/* ALL IN シンプルなパルス効果 - ゲーム進行中のみ表示 */}
          {player.isAllIn && gameState?.phase !== 'finished' && gameState?.phase !== 'waiting' && (
            <>
              {/* 外側の赤いグロー */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '9999px',
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0.3) 50%, rgba(239, 68, 68, 0) 100%)',
                  filter: 'blur(8px)',
                  zIndex: 0
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* 脈打つ赤い輪 */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  border: '4px solid rgb(239, 68, 68)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.8), inset 0 0 20px rgba(239, 68, 68, 0.5)',
                  zIndex: 1
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8],
                  borderWidth: ['4px', '6px', '4px'],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </>
          )}
          
          {/* 勝利者の光るエフェクト */}
          {player.isWinner && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
                  filter: 'blur(8px)',
                  zIndex: 0
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  border: '4px solid #FFD700',
                  boxShadow: '0 0 20px #FFD700, 0 0 40px #FFA500',
                  zIndex: 1
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            </>
          )}
          <div className={`relative w-20 h-20 rounded-full border-3 ${player.isAllIn ? 'border-red-500' : player.isWinner ? 'border-yellow-400' : 'border-white'} shadow-lg overflow-hidden ${player.folded ? 'opacity-40' : ''} z-10`}>
            {player.avatar && player.avatar !== 'default' ? (
              <Image
                key={`avatar-${player.id}-${player.avatar}`}
                src={player.avatar}
                alt={player.name}
                width={80}
                height={80}
                unoptimized
                priority
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {player.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ポジションマーカー（D, SB, BB） */}
        {player.position && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
            <p className="text-white text-xs font-bold">{player.position}</p>
          </div>
        )}

        {/* ターンタイマーとプログレスバー */}
        {isActive && gameState?.phase !== 'waiting' && gameState?.phase !== 'finished' && (
          <>
            <motion.div 
              style={{
                position: 'absolute',
                top: '-0.5rem',
                left: '-0.5rem',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                zIndex: 20
              }}
              animate={{
                background: turnTimer <= 5 
                  ? ['linear-gradient(to bottom right, rgb(239, 68, 68), rgb(185, 28, 28))', 'linear-gradient(to bottom right, rgb(220, 38, 38), rgb(153, 27, 27))']
                  : turnTimer <= 10
                  ? ['linear-gradient(to bottom right, rgb(234, 179, 8), rgb(202, 138, 4))']
                  : ['linear-gradient(to bottom right, rgb(34, 211, 238), rgb(37, 99, 235))'],
                scale: turnTimer <= 5 ? [1, 1.1, 1] : 1
              }}
              transition={{
                duration: turnTimer <= 5 ? 0.5 : 1,
                repeat: turnTimer <= 5 ? Infinity : 0
              }}
            >
              <p className="text-white text-sm font-bold">{turnTimer}</p>
            </motion.div>
            {/* タイマープログレスバー */}
            <div className="absolute -bottom-3 left-0 right-0 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div 
                style={{ height: '100%' }}
                animate={{
                  width: `${(turnTimer / 15) * 100}%`,
                  backgroundColor: turnTimer <= 5 ? 'rgb(239, 68, 68)' : turnTimer <= 10 ? 'rgb(234, 179, 8)' : 'rgb(34, 211, 238)'
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </>
        )}

        {/* チャット吹き出し - カードと同じ側に表示 */}
        <AnimatePresence mode="wait">
          {player.chatMessage && (
            <motion.div
              key={`chat-${player.name}-${player.chatMessage}`}
              style={{
                position: 'absolute',
                top: 0,
                transform: 'translateY(-50%)',
                ...(player.cardSide === 'right' 
                  ? { left: '100%', marginLeft: '8px' } 
                  : { right: '100%', marginRight: '8px' })
              }}
              initial={{ x: player.cardSide === 'right' ? -20 : 20, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="relative bg-gradient-to-br from-cyan-400 to-blue-600 px-4 py-1.5 rounded-md border-2 border-white/30 shadow-lg whitespace-nowrap">
                <p className="text-white text-[10px] font-semibold">{player.chatMessage}</p>
                {/* 吹き出しの三角形 */}
                <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                  player.cardSide === 'right' ? '-left-2' : '-right-2'
                }`}>
                  <div className={`w-0 h-0 ${
                    player.cardSide === 'right' 
                      ? 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-cyan-400'
                      : 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-cyan-400'
                  }`}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ショーダウン時の役表示 - カードの横に表示 */}
        <AnimatePresence mode="wait">
          {!player.folded && (player as any).handDescription && (gameState?.phase === 'showdown' || gameState?.phase === 'finished') && (
            <motion.div
              key={`hand-${player.name}-${(player as any).handDescription}`}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 30,
                ...(player.cardSide === 'right' 
                  ? { left: '100%', marginLeft: '12px' } 
                  : { right: '100%', marginRight: '12px' })
              }}
              initial={{ 
                x: player.cardSide === 'right' ? -20 : 20, 
                opacity: 0, 
                scale: 0.8 
              }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 px-2 py-1 rounded-lg border-2 border-white shadow-xl whitespace-nowrap">
                <p className="text-white text-[10px] font-bold drop-shadow-md">{(player as any).handDescription}</p>
                {/* 吹き出しの三角形 */}
                <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                  player.cardSide === 'right' ? '-left-2' : '-right-2'
                }`}>
                  <div className={`w-0 h-0 ${
                    player.cardSide === 'right' 
                      ? 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-yellow-400'
                      : 'border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-yellow-400'
                  }`}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ユーザー情報（アバターの下部に被せる） */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[calc(50%+10px)] bg-gradient-to-br from-cyan-400 to-blue-600 backdrop-blur-sm px-2 py-1 rounded-lg border-2 border-white/30 shadow-lg min-w-[90px] z-10 ${player.folded ? 'opacity-40' : ''}`}>
          <p className="text-white text-[10px] font-bold text-center whitespace-nowrap">
            {player.name}
          </p>
          <p className="text-white text-[10px] font-semibold text-center whitespace-nowrap">
            {Math.floor(player.chips).toLocaleString()}
          </p>
        </div>

        {/* 最後のアクション表示 - 所持チップの下 */}
        {player.lastAction && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[calc(100%+34px)]">
            <div className={`px-2 py-0.5 rounded-md border border-white/50 shadow-md ${
              player.lastAction === 'FOLD' ? 'bg-red-500' : 
              player.lastAction === 'RAISE' ? 'bg-green-500' : 
              player.lastAction === 'ALL IN' ? 'bg-orange-500' :
              'bg-blue-500'
            }`}>
              <p className="text-white text-[9px] font-bold text-center whitespace-nowrap">{player.lastAction}</p>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // 画面幅に応じたスケールファクターを計算（430pxを基準）
  const getScaleFactor = () => {
    if (typeof window === 'undefined') return 1;
    const screenWidth = window.innerWidth;
    if (screenWidth >= 768) return 1; // デスクトップは固定サイズ
    return Math.min(screenWidth / 430, 1); // モバイルは画面幅に応じて縮小
  };

  const [scaleFactor, setScaleFactor] = React.useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      setScaleFactor(getScaleFactor());
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <>
      <div className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* レスポンシブコンテナ - iPhone17基準（430px x 932px）で最適化 */}
        <div 
          className="relative w-full h-screen md:max-w-[430px] md:h-[932px] md:max-h-screen md:rounded-lg md:overflow-hidden md:shadow-2xl origin-center"
          style={{
            backgroundImage: 'url(/poker-table-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: '55% 32%',
            backgroundRepeat: 'no-repeat',
            transform: `scale(${scaleFactor})`,
            width: scaleFactor < 1 ? '430px' : '100%',
            height: scaleFactor < 1 ? '932px' : '100vh',
          }}
        >
      {/* 左上 - メニューアイコン */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-full border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* メニューパネル */}
      {showMenu && (
        <div className="absolute top-16 left-4 w-64 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-[150]">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-white" />
                <p className="text-white text-sm font-bold">メニュー</p>
              </div>
              <button 
                onClick={() => setShowMenu(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-xs">✕</p>
              </button>
            </div>

            {/* メニュー項目 */}
            <div className="space-y-2">
              <button 
                onClick={() => router.push('/lobby')}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">🏠 ホームに戻る</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowTableInfo(!showTableInfo);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4" /> テーブル情報
                </p>
              </button>
              
              <button 
                onClick={() => {
                  setShowHandHistory(!showHandHistory);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold flex items-center gap-2">
                  <History className="w-4 h-4" /> ハンド履歴
                </p>
              </button>
              
              <button 
                onClick={() => {
                  setShowPlayerList(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">👥 プレイヤーリスト</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowStats(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">📊 統計</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowActionLog(!showActionLog);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">📝 アクションログ</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowSettings(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">⚙️ 設定</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowRules(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">📖 ルール</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowShare(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">📤 シェア</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowFeedback(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">💬 フィードバック</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowLanguageSettings(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">🌐 言語設定</p>
              </button>
              
              <button 
                onClick={() => {
                  setShowAccountSettings(true);
                  setShowMenu(false);
                }}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold">👤 アカウント設定</p>
              </button>
              
              <div className="border-t border-white/30 my-2"></div>
              
              {isEnabled && mode === 'real' && (
                <button 
                  onClick={() => {
                    setShowRebuy(true);
                    setShowMenu(false);
                  }}
                  className="w-full bg-green-500/80 hover:bg-green-500 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
                >
                  <p className="text-white text-sm font-bold">💰 チップ追加</p>
                </button>
              )}
              
              <button 
                onClick={() => setIsSpectator(!isSpectator)}
                className={`w-full ${isSpectator ? 'bg-purple-600' : 'bg-white/20'} hover:bg-purple-500 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left`}
              >
                <p className="text-white text-sm font-bold">👁️ 観戦モード {isSpectator ? 'ON' : 'OFF'}</p>
              </button>
              
              <button 
                onClick={() => setIsAway(!isAway)}
                className={`w-full ${isAway ? 'bg-orange-600' : 'bg-orange-500/80'} hover:bg-orange-500 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left`}
              >
                <p className="text-white text-sm font-bold">🪑 離席中 {isAway ? 'ON' : 'OFF'}</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右上 - チャットアイコン */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setShowChat(!showChat)}
          className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-full border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* チャットパネル */}
      {showChat && (
        <div className="absolute top-16 right-4 w-72 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-[150]">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-white" />
                <p className="text-white text-sm font-bold">チャット</p>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-xs">✕</p>
              </button>
            </div>

            {/* メッセージ履歴 */}
            <div className="bg-white/10 rounded-lg p-2 h-48 overflow-y-auto mb-2 space-y-1.5">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="bg-white/20 rounded px-2 py-1.5 border border-white/30">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-white text-[9px] font-bold">{msg.player}</p>
                    <p className="text-white/70 text-[8px]">{msg.time}</p>
                  </div>
                  <p className="text-white text-[10px]">{msg.message}</p>
                </div>
              ))}
            </div>

            {/* クイックメッセージ */}
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button
                onClick={() => {
                  sendSocketMessage('よろしく！');
                }}
                className="bg-white/20 hover:bg-white/30 py-1 rounded border border-white/40 transition-colors"
              >
                <p className="text-white text-[8px] font-semibold">よろしく！</p>
              </button>
              <button
                onClick={() => {
                  sendSocketMessage('いい手だ！');
                }}
                className="bg-white/20 hover:bg-white/30 py-1 rounded border border-white/40 transition-colors"
              >
                <p className="text-white text-[8px] font-semibold">いい手だ！</p>
              </button>
              <button
                onClick={() => {
                  sendSocketMessage('GG');
                }}
                className="bg-white/20 hover:bg-white/30 py-1 rounded border border-white/40 transition-colors"
              >
                <p className="text-white text-[8px] font-semibold">GG</p>
              </button>
            </div>

            {/* 入力フィールド */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    sendSocketMessage(chatMessage);
                    setChatMessage('');
                  }
                }}
                placeholder="メッセージを入力..."
                className="flex-1 bg-white/20 text-white text-xs px-2 py-1.5 rounded border border-white/40 placeholder:text-white/60 focus:outline-none focus:bg-white/30"
                maxLength={100}
              />
              <button
                onClick={() => {
                  if (chatMessage.trim()) {
                    sendSocketMessage(chatMessage);
                    setChatMessage('');
                  }
                }}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded border border-white/40 transition-colors"
              >
                <p className="text-white text-[9px] font-bold">送信</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* テーブル情報ヘッダー */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-2 py-1 rounded border border-white/30 shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <p className="text-white text-[8px] font-semibold">{tableName}</p>
            <p className="text-white text-[8px]">•</p>
            <p className="text-white text-[8px]">SB: {smallBlind} / BB: {bigBlind}</p>
          </div>
        </div>
        
        {/* 観戦モードバッジ */}
        {isSpectator && (
          <div className="bg-purple-600 px-3 py-1 rounded-full border-2 border-white/30 shadow-lg flex items-center gap-1">
            <Eye className="w-3 h-3 text-white" />
            <p className="text-white text-[9px] font-bold">観戦中</p>
          </div>
        )}
      </div>

      {/* ゲームフェーズ */}
      <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-3 py-1 rounded-md border border-white/30 shadow-md">
          <p className="text-white text-xs font-bold text-center">{gamePhase}</p>
        </div>
      </div>

      {/* ポットとサイドポット */}
      <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3 items-center">
        {/* サイドポット（複数オールインがある場合） */}
        {hasSidePots && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-3 py-1.5 rounded border-2 border-white/30 shadow-md">
            <p className="text-white text-[8px] font-bold text-center">SIDE POT</p>
            <div className="flex items-center justify-center gap-0.5">
              <Image src="/chip-icon.png" alt="chip" width={12} height={12} unoptimized />
              <p className="text-white text-[10px] font-semibold">{Math.floor(sidePotTotal).toLocaleString()}</p>
            </div>
          </div>
        )}
        
        {/* メインポット */}
        <div className="relative">
          {/* チップアニメーション */}
          <AnimatePresence>
            {chipAnimations.map((anim) => (
              <motion.div
                key={anim.id}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0.5,
                  opacity: 0 
                }}
                animate={{ 
                  x: 0, 
                  y: 0, 
                  scale: 1,
                  opacity: 1 
                }}
                exit={{ 
                  scale: 0,
                  opacity: 0 
                }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeOut"
                }}
                style={{ position: 'absolute' }}
              >
                <Image src="/chip-icon.png" alt="chip" width={24} height={24} unoptimized className="drop-shadow-lg" />
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div 
            style={{
              background: 'linear-gradient(to bottom right, rgb(37, 99, 235), rgb(30, 64, 175))',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }}
            animate={{ 
              scale: chipAnimations.length > 0 ? [1, 1.1, 1] : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white text-xs font-bold text-center">POT</p>
            <div className="flex items-center justify-center gap-1">
              <Image src="/chip-icon.png" alt="chip" width={16} height={16} unoptimized />
              <p className="text-white text-sm font-semibold">{Math.floor(pot).toLocaleString()}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* コミュニティカード */}
      <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-3">
          {communityCards.map((card, index) => (
            <div key={card.id} style={{ perspective: '1000px' }}>
              <motion.div 
                initial={{ 
                  rotateY: 180, 
                  scale: 0.5,
                  y: -50
                }}
                animate={{ 
                  rotateY: 0, 
                  scale: 1.1,
                  y: 0
                }}
                transition={{ 
                  duration: 0.6,
                  delay: index < 3 ? index * 0.15 : (index === 3 ? 1.5 : 2.5),
                  ease: "easeOut"
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card card={card} enable3D={true} />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* プレイヤー1 - 中央下（少し左） */}
      <div className="absolute bottom-48 left-[45%] transform -translate-x-1/2">
        <PlayerComponent player={players[0]} />
      </div>

      {/* 自分の役表示 - プレイヤー1の左 */}
      <div className="absolute bottom-40 left-[45%] transform -translate-x-1/2 -translate-x-44">
        <motion.div 
          initial={{ x: -100, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(34, 211, 238, 0.5)',
                '0 0 40px rgba(34, 211, 238, 0.8)',
                '0 0 20px rgba(34, 211, 238, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: 'linear-gradient(to bottom right, rgb(34, 211, 238), rgb(37, 99, 235))',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <p className="text-white text-xs font-bold">{currentHandRank}</p>
          </motion.div>
        </motion.div>
      </div>

      {/* プレイヤー1のハンドカード - 右側に大きく扇形で表示 */}
      <div className="absolute bottom-36 left-[45%] transform translate-x-[80px]">
        <div className="flex items-end">
          {player1HandCards.map((card, cardIndex) => (
            <motion.div
              key={card.id}
              initial={{
                x: -300,
                y: -300,
                rotate: 0,
                opacity: 0,
                scale: 0.5
              }}
              animate={{
                x: 0,
                y: 0,
                rotate: cardIndex === 0 ? -10 : 10,
                opacity: 1,
                scale: 1
              }}
              transition={{
                duration: 0.6,
                delay: cardIndex * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              style={{
                position: 'relative',
                marginLeft: cardIndex === 1 ? '-30px' : '0',
                zIndex: cardIndex,
              }}
              onAnimationStart={() => {
                // Animation started
              }}
            >
              <motion.div 
                whileHover={{ 
                  scale: 1.15, 
                  y: -10,
                  rotate: 0,
                  transition: { duration: 0.2 }
                }}
                style={{
                  transform: 'scale(1.1)',
                  transformOrigin: 'center center'
                }}
              >
                <Card card={card} faceUp={true} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* プレイヤー2 - 左下 */}
      <div className="absolute bottom-96 left-6">
        <PlayerComponent player={players[1]} />
      </div>

      {/* プレイヤー3 - 左中 */}
      <div className="absolute top-[50%] left-6 transform -translate-y-1/2">
        <PlayerComponent player={players[2]} />
      </div>

      {/* プレイヤー4 - 左上 */}
      <div className="absolute top-56 left-6">
        <PlayerComponent player={players[3]} />
      </div>

      {/* プレイヤー5 - 上左（少し左寄り） */}
      <div className="absolute top-20 left-[20%] transform -translate-x-1/2">
        <PlayerComponent player={players[4]} />
      </div>

      {/* プレイヤー6 - 上右（少し右寄り） */}
      <div className="absolute top-20 right-[20%] transform translate-x-1/2">
        <PlayerComponent player={players[5]} />
      </div>

      {/* プレイヤー7 - 右上 */}
      <div className="absolute top-56 right-6">
        <PlayerComponent player={players[6]} />
      </div>

      {/* プレイヤー8 - 右中 */}
      <div className="absolute top-[50%] right-6 transform -translate-y-1/2">
        <PlayerComponent player={players[7]} />
      </div>

      {/* プレイヤー9 - 右下 */}
      <div className="absolute bottom-96 right-6">
        <PlayerComponent player={players[8]} />
      </div>

      {/* レイズスライダーを閉じるためのオーバーレイ */}
      {showRaiseSlider && (
        <div 
          className="absolute inset-0 z-[90]"
          onClick={() => setShowRaiseSlider(false)}
        />
      )}

      {/* アクションボタン - 画面下部 */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-full px-4 z-[100]">
        <div className="max-w-md mx-auto space-y-3">
          {/* レイズスライダー */}
          {showRaiseSlider && (
            <div 
              className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-lg border-2 border-white/30 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-xs font-bold">
                  {raiseAmount >= maxRaise ? 'ALL IN' : 'レイズ額'}
                </p>
                <div className="flex items-center gap-1">
                  <Image src="/chip-icon.png" alt="chip" width={16} height={16} unoptimized />
                  <p className="text-white text-sm font-bold">{raiseAmount}</p>
                </div>
              </div>
              
              {/* クイックベットボタン - POTサイズ */}
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, Math.floor(potAmount / 3)))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">1/3 POT</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, Math.floor(potAmount * 2 / 3)))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">2/3 POT</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, potAmount))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">POT</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(maxRaise)}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">MAX</p>
                </button>
              </div>

              <input
                type="range"
                min={minRaise}
                max={maxRaise}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((raiseAmount - minRaise) / (maxRaise - minRaise)) * 100}%, rgba(255,255,255,0.3) ${((raiseAmount - minRaise) / (maxRaise - minRaise)) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
              <div className="flex justify-between mt-1">
                <p className="text-white text-[10px]">最小: {minRaise}</p>
                <p className="text-white text-[10px]">最大: {maxRaise}</p>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => {
                playSound('action');
                performAction('fold');
                setShowRaiseSlider(false);
              }}
              disabled={!isMyTurn()}
              className="bg-red-500 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <p className="text-white text-sm font-bold">フォールド</p>
            </button>
            <button 
              onClick={() => {
                playSound('action');
                const actualCallAmount = getCallAmount();
                if (actualCallAmount > 0) {
                  performAction('call');
                  const newChipAnim = { id: Date.now(), playerId: 1 };
                  setChipAnimations([...chipAnimations, newChipAnim]);
                  setTimeout(() => {
                    setChipAnimations(prev => prev.filter(a => a.id !== newChipAnim.id));
                  }, 500);
                } else {
                  performAction('check');
                }
              }}
              disabled={!isMyTurn()}
              className="bg-gradient-to-br from-cyan-400 to-blue-600 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <p className="text-white text-sm font-bold">
                {getCallAmount() > 0 ? `コール ${getCallAmount()}` : 'チェック'}
              </p>
            </button>
            <button 
              onClick={() => {
                if (showRaiseSlider) {
                  playSound('action');
                  const currentPlayerChips = getCurrentPlayer()?.chips || 0;
                  if (raiseAmount >= currentPlayerChips) {
                    performAction('all-in');
                  } else {
                    performAction('raise', raiseAmount);
                  }
                  setShowRaiseSlider(false);
                  const newChipAnim = { id: Date.now(), playerId: 1 };
                  setChipAnimations([...chipAnimations, newChipAnim]);
                  setTimeout(() => {
                    setChipAnimations(prev => prev.filter(a => a.id !== newChipAnim.id));
                  }, 500);
                } else {
                  setRaiseAmount(getMinRaise());
                  setShowRaiseSlider(true);
                }
              }}
              disabled={!isMyTurn()}
              className="bg-green-500 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <p className="text-white text-sm font-bold">
                {showRaiseSlider ? (raiseAmount >= (getCurrentPlayer()?.chips || 0) ? 'ALL IN' : `レイズ ${raiseAmount}`) : 'レイズ'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* テーブル情報パネル */}
      {showTableInfo && (
        <div className="absolute top-20 left-4 w-64 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-[150]">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-white" />
                <p className="text-white text-sm font-bold">テーブル情報</p>
              </div>
              <button 
                onClick={() => setShowTableInfo(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-xs">✕</p>
              </button>
            </div>
            
            <div className="space-y-2 text-white text-xs">
              <div className="flex justify-between bg-white/10 p-2 rounded">
                <span>平均ポット:</span>
                <span className="font-bold">¥8,500</span>
              </div>
              <div className="flex justify-between bg-white/10 p-2 rounded">
                <span>ハンド/時間:</span>
                <span className="font-bold">45/時</span>
              </div>
              <div className="flex justify-between bg-white/10 p-2 rounded">
                <span>プレイヤー数:</span>
                <span className="font-bold">9/9</span>
              </div>
              <div className="flex justify-between bg-white/10 p-2 rounded">
                <span>テーブルタイプ:</span>
                <span className="font-bold">キャッシュ</span>
              </div>
              <div className="flex justify-between bg-white/10 p-2 rounded">
                <span>ゲーム時間:</span>
                <span className="font-bold">2時間15分</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ハンド履歴パネル */}
      {showHandHistory && (
        <div className="absolute top-20 left-20 w-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-[150]">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-white" />
                <p className="text-white text-sm font-bold">ハンド履歴</p>
              </div>
              <button 
                onClick={() => setShowHandHistory(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-xs">✕</p>
              </button>
            </div>
            
            <div className="bg-white/10 rounded-lg p-2 h-64 overflow-y-auto space-y-1.5">
              <div className="bg-white/20 rounded p-2 border border-white/30">
                <div className="flex justify-between mb-1">
                  <span className="text-white text-[9px] font-bold">Hand #41</span>
                  <span className="text-green-300 text-[9px] font-bold">+2,500</span>
                </div>
                <p className="text-white text-[8px]">AA vs KK - フロップでセット</p>
              </div>
              <div className="bg-white/20 rounded p-2 border border-white/30">
                <div className="flex justify-between mb-1">
                  <span className="text-white text-[9px] font-bold">Hand #40</span>
                  <span className="text-red-300 text-[9px] font-bold">-800</span>
                </div>
                <p className="text-white text-[8px]">QJ - ミスドロー</p>
              </div>
              <div className="bg-white/20 rounded p-2 border border-white/30">
                <div className="flex justify-between mb-1">
                  <span className="text-white text-[9px] font-bold">Hand #39</span>
                  <span className="text-green-300 text-[9px] font-bold">+1,200</span>
                </div>
                <p className="text-white text-[8px]">AK - トップペア勝利</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* リバイモーダル */}
      {showRebuy && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="w-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-lg font-bold">チップ追加</p>
              <button 
                onClick={() => setShowRebuy(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-sm">✕</p>
              </button>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-white text-xs mb-2">現在のチップ: 5,000</p>
              <p className="text-white text-xs mb-3">最小バイイン: 5,000 / 最大: 20,000</p>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-white/20 hover:bg-white/30 py-2 rounded border border-white/40 transition-colors">
                  <p className="text-white text-sm font-bold">5,000</p>
                </button>
                <button className="bg-white/20 hover:bg-white/30 py-2 rounded border border-white/40 transition-colors">
                  <p className="text-white text-sm font-bold">10,000</p>
                </button>
                <button className="bg-white/20 hover:bg-white/30 py-2 rounded border border-white/40 transition-colors">
                  <p className="text-white text-sm font-bold">15,000</p>
                </button>
                <button className="bg-white/20 hover:bg-white/30 py-2 rounded border border-white/40 transition-colors">
                  <p className="text-white text-sm font-bold">20,000</p>
                </button>
              </div>
            </div>
            
            <button className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg border-2 border-white/30 transition-colors">
              <p className="text-white text-sm font-bold">追加する</p>
            </button>
          </div>
        </div>
      )}

      {/* ベット履歴ログ */}
      {showActionLog && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white text-[9px] font-bold">アクションログ</p>
            <button 
              onClick={() => setShowActionLog(false)}
              className="text-white hover:bg-white/20 rounded p-0.5 transition-colors"
            >
              <p className="text-[8px]">✕</p>
            </button>
          </div>
          <div className="bg-white/10 rounded p-1.5 max-h-24 overflow-y-auto space-y-0.5">
            <p className="text-white text-[8px]">プレイヤー2: レイズ 200</p>
            <p className="text-white text-[8px]">プレイヤー6: コール 200</p>
            <p className="text-white text-[8px]">プレイヤー9: コール 200</p>
            <p className="text-white text-[8px]">プレイヤー5: フォールド</p>
            <p className="text-white text-[8px]">プレイヤー7: フォールド</p>
          </div>
        </div>
      )}

      {/* フィードバックモーダル */}
      {showFeedback && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="w-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-lg font-bold">💬 フィードバック</p>
              <button 
                onClick={() => setShowFeedback(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-sm">✕</p>
              </button>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-white text-xs mb-2">ご意見・ご要望をお聞かせください</p>
              <textarea
                placeholder="フィードバックを入力..."
                className="w-full bg-white/20 text-white text-xs px-3 py-2 rounded border border-white/40 placeholder:text-white/60 focus:outline-none focus:bg-white/30 h-32 resize-none"
                maxLength={500}
              />
              <p className="text-white/70 text-[9px] mt-1">最大500文字</p>
            </div>
            
            <button className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg border-2 border-white/30 transition-colors">
              <p className="text-white text-sm font-bold">送信する</p>
            </button>
          </div>
        </div>
      )}

      {/* 言語設定モーダル */}
      {showLanguageSettings && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="w-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-lg font-bold">🌐 言語設定</p>
              <button 
                onClick={() => setShowLanguageSettings(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-sm">✕</p>
              </button>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 mb-4 space-y-2">
              <button
                onClick={() => setSelectedLanguage('日本語')}
                className={`w-full py-2.5 px-3 rounded-lg border transition-colors text-left ${
                  selectedLanguage === '日本語' 
                    ? 'bg-white/30 border-white' 
                    : 'bg-white/10 border-white/40 hover:bg-white/20'
                }`}
              >
                <p className="text-white text-sm font-semibold">🇯🇵 日本語</p>
              </button>
              <button
                onClick={() => setSelectedLanguage('English')}
                className={`w-full py-2.5 px-3 rounded-lg border transition-colors text-left ${
                  selectedLanguage === 'English' 
                    ? 'bg-white/30 border-white' 
                    : 'bg-white/10 border-white/40 hover:bg-white/20'
                }`}
              >
                <p className="text-white text-sm font-semibold">🇺🇸 English</p>
              </button>
              <button
                onClick={() => setSelectedLanguage('中文')}
                className={`w-full py-2.5 px-3 rounded-lg border transition-colors text-left ${
                  selectedLanguage === '中文' 
                    ? 'bg-white/30 border-white' 
                    : 'bg-white/10 border-white/40 hover:bg-white/20'
                }`}
              >
                <p className="text-white text-sm font-semibold">🇨🇳 中文</p>
              </button>
            </div>
            
            <button 
              onClick={() => setShowLanguageSettings(false)}
              className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg border-2 border-white/30 transition-colors"
            >
              <p className="text-white text-sm font-bold">保存</p>
            </button>
          </div>
        </div>
      )}

      {/* アカウント設定モーダル */}
      {showAccountSettings && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="w-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-lg font-bold">👤 アカウント設定</p>
              <button 
                onClick={() => setShowAccountSettings(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-sm">✕</p>
              </button>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 mb-4 space-y-3">
              <div>
                <p className="text-white text-xs mb-1">ユーザー名</p>
                <input
                  type="text"
                  defaultValue="プレイヤー1"
                  className="w-full bg-white/20 text-white text-sm px-3 py-2 rounded border border-white/40 focus:outline-none focus:bg-white/30"
                />
              </div>
              <div>
                <p className="text-white text-xs mb-1">メールアドレス</p>
                <input
                  type="email"
                  defaultValue="player1@example.com"
                  className="w-full bg-white/20 text-white text-sm px-3 py-2 rounded border border-white/40 focus:outline-none focus:bg-white/30"
                />
              </div>
              <div>
                <p className="text-white text-xs mb-1">パスワード変更</p>
                <input
                  type="password"
                  placeholder="新しいパスワード"
                  className="w-full bg-white/20 text-white text-sm px-3 py-2 rounded border border-white/40 placeholder:text-white/60 focus:outline-none focus:bg-white/30"
                />
              </div>
            </div>
            
            <button className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg border-2 border-white/30 transition-colors mb-2">
              <p className="text-white text-sm font-bold">保存</p>
            </button>
            <button className="w-full bg-red-500/80 hover:bg-red-500 py-2 rounded-lg border-2 border-white/30 transition-colors">
              <p className="text-white text-xs font-bold">アカウント削除</p>
            </button>
          </div>
        </div>
      )}

      {/* シェアモーダル */}
      {showShare && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[150]">
          <div className="w-96 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white text-lg font-bold">📤 シェア</p>
              <button 
                onClick={() => setShowShare(false)}
                className="text-white hover:bg-white/20 rounded p-1 transition-colors"
              >
                <p className="text-sm">✕</p>
              </button>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-white text-xs mb-3">このテーブルをシェア</p>
              
              {/* リンクコピー */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="https://sinpoker.com/table/abc123"
                    readOnly
                    className="flex-1 bg-white/20 text-white text-xs px-3 py-2 rounded border border-white/40 focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('https://sinpoker.com/table/abc123');
                      alert('リンクをコピーしました！');
                    }}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded border border-white/40 transition-colors"
                  >
                    <p className="text-white text-xs font-bold">コピー</p>
                  </button>
                </div>
              </div>
              
              {/* SNSシェアボタン */}
              <p className="text-white text-xs mb-2">SNSでシェア</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-blue-500 hover:bg-blue-600 py-2.5 rounded border border-white/40 transition-colors">
                  <p className="text-white text-xs font-bold">Twitter</p>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 py-2.5 rounded border border-white/40 transition-colors">
                  <p className="text-white text-xs font-bold">Facebook</p>
                </button>
                <button className="bg-green-500 hover:bg-green-600 py-2.5 rounded border border-white/40 transition-colors">
                  <p className="text-white text-xs font-bold">LINE</p>
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => setShowShare(false)}
              className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg border border-white/40 transition-colors"
            >
              <p className="text-white text-sm font-bold">閉じる</p>
            </button>
          </div>
        </div>
      )}

      {/* 勝利セレブレーション - 紙吹雪 */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-[150]">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                width: '10px',
                height: '10px',
                backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 6)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
              animate={{
                y: [0, window.innerHeight + 100],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 360],
                opacity: [1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeIn"
              }}
            />
          ))}
        </div>
      )}

      {/* オールイン演出 - 画面フラッシュ */}
      {allInPlayer !== null && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 40
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.3, 0],
            backgroundColor: ['rgba(255, 215, 0, 0)', 'rgba(255, 215, 0, 0.5)', 'rgba(255, 215, 0, 0)']
          }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={() => setAllInPlayer(null)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8 }}
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                color: '#ffd700',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)'
              }}
            >
              ALL IN!
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ターン開始プレイヤー名表示 */}
      {showPlayerTurn && currentTurnPlayer && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[150]">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [1, 1, 0] }}
            transition={{ duration: 1.5 }}
            onAnimationComplete={() => setShowPlayerTurn(false)}
            style={{
              background: 'linear-gradient(to bottom right, rgb(34, 211, 238), rgb(37, 99, 235))',
              padding: '1.5rem 3rem',
              borderRadius: '1rem',
              border: '3px solid white',
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.8)'
            }}
          >
            <p className="text-white text-2xl font-bold text-center">{currentTurnPlayer}のターン</p>
          </motion.div>
        </div>
      )}

      {/* カードシャッフル演出 */}
      {showShuffling && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[150]">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1,
              repeat: 3
            }}
            onAnimationComplete={() => setShowShuffling(false)}
          >
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    x: [(i - 2) * 20, 0, (i - 2) * 20],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    repeat: 6
                  }}
                  style={{
                    width: '40px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '4px',
                    border: '2px solid white'
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* バッドビート演出 */}
      {showBadBeat && (
        <div className="absolute inset-0 pointer-events-none z-[150]">
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'black'
            }}
            animate={{
              opacity: [0, 0.8, 0, 0.8, 0]
            }}
            transition={{ duration: 0.8 }}
            onAnimationComplete={() => setShowBadBeat(false)}
          />
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '4px',
                height: '100%',
                background: 'linear-gradient(to bottom, transparent, #fbbf24, transparent)',
                transformOrigin: 'top center'
              }}
              animate={{
                rotate: [i * 60, i * 60],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 0.3,
                delay: i * 0.1,
                repeat: 2
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5 }}
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#ef4444',
                textShadow: '0 0 30px rgba(239, 68, 68, 1)'
              }}
            >
              BAD BEAT!
            </motion.div>
          </div>
        </div>
      )}

      {/* レベルアップ・アチーブメント */}
      {showLevelUp && (
        <div className="absolute inset-0 pointer-events-none z-[150] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            onAnimationComplete={() => setTimeout(() => setShowLevelUp(false), 2000)}
          >
            <div className="relative">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '30px',
                    height: '30px'
                  }}
                  animate={{
                    x: Math.cos(i * 45 * Math.PI / 180) * 100,
                    y: Math.sin(i * 45 * Math.PI / 180) * 100,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3
                  }}
                >
                  <div className="text-4xl">⭐</div>
                </motion.div>
              ))}
              <div style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                padding: '2rem',
                borderRadius: '1rem',
                border: '4px solid white',
                boxShadow: '0 0 60px rgba(251, 191, 36, 0.8)'
              }}>
                <p className="text-white text-4xl font-bold text-center mb-2">🏆</p>
                <p className="text-white text-2xl font-bold text-center">LEVEL UP!</p>
                <p className="text-white text-lg text-center mt-2">レベル 5 達成</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 連勝ストリーク */}
      {winStreak >= 3 && (
        <div className="absolute top-32 right-8 z-[150]">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              border: '3px solid #fbbf24',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)'
            }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                style={{ fontSize: '1.875rem' }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🔥
              </motion.div>
              <div>
                <p className="text-white text-xs font-bold">HOT RUN!</p>
                <p className="text-yellow-300 text-lg font-bold">{winStreak}連勝</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* リバイ/アドオン通知 */}
      {showRebuyNotification && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[150]">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring" }}
            onAnimationComplete={() => setTimeout(() => setShowRebuyNotification(false), 2000)}
          >
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '2rem 3rem',
              borderRadius: '1rem',
              border: '3px solid white',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.8)'
            }}>
              <motion.div
                style={{ textAlign: 'center', marginBottom: '1rem' }}
                animate={{ y: [-20, 0, -20] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {[...Array(10)].map((_, i) => (
                  <motion.span
                    key={i}
                    style={{ display: 'inline-block', fontSize: '1.875rem', marginLeft: '0.25rem', marginRight: '0.25rem' }}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    💰
                  </motion.span>
                ))}
              </motion.div>
              <p className="text-white text-3xl font-bold text-center">チップ追加！</p>
              <p className="text-yellow-300 text-4xl font-bold text-center mt-2">+{Math.floor(rebuyAmount).toLocaleString()}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* テーブルの雰囲気切り替え - ファイナルテーブル */}
      {tableAtmosphere === 'final' && (
        <>
          <div className="absolute inset-0 pointer-events-none z-10">
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-300px)`,
                pointerEvents: 'none',
                zIndex: 5
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity
              }}
            />
          ))}
        </>
      )}

      {/* テーブル情報モーダル */}
      {showTableInfo && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <Info className="w-5 h-5" /> テーブル情報
              </h2>
              <button 
                onClick={() => setShowTableInfo(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-3">
              {/* テーブル基本情報 */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-xs font-bold mb-2">基本情報</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/80 text-xs">テーブル名:</span>
                    <span className="text-white text-xs font-semibold">VIP Table #1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80 text-xs">ゲーム種別:</span>
                    <span className="text-white text-xs font-semibold">Texas Hold&apos;em</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80 text-xs">SB/BB:</span>
                    <span className="text-white text-xs font-semibold">{smallBlind}/{bigBlind}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80 text-xs">最大席数:</span>
                    <span className="text-white text-xs font-semibold">9人</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80 text-xs">現在プレイヤー:</span>
                    <span className="text-white text-xs font-semibold">{players.length}人</span>
                  </div>
                </div>
              </div>

              {/* プレイヤーリスト */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-xs font-bold mb-2">プレイヤー一覧</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {players.map((player) => (
                    <div key={player.id} className="flex justify-between items-center bg-white/10 rounded px-2 py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white text-xs">{player.name}</span>
                        {player.position && (
                          <span className="text-yellow-400 text-xs font-bold">{player.position}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Image src="/chip-icon.png" alt="chip" width={12} height={12} unoptimized />
                        <span className="text-white text-xs font-semibold">{Math.floor(player.chips).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ハンド履歴モーダル */}
      {showHandHistory && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <History className="w-5 h-5" /> ハンド履歴
              </h2>
              <button 
                onClick={() => setShowHandHistory(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-2">
              {[
                { hand: '#157', winner: 'プレイヤー2', pot: 1200, cards: 'A♠ K♠' },
                { hand: '#156', winner: 'プレイヤー6', pot: 850, cards: 'Q♥ Q♦' },
                { hand: '#155', winner: 'プレイヤー9', pot: 600, cards: '10♣ 10♠' }
              ].map((record) => (
                <div key={record.hand} className="bg-white/20 rounded-lg p-3 border border-white/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-xs font-bold">ハンド {record.hand}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-white/80 text-xs">ポット:</span>
                      <Image src="/chip-icon.png" alt="chip" width={12} height={12} unoptimized />
                      <span className="text-white text-xs font-semibold">{record.pot}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-300 text-xs font-semibold">勝者: {record.winner}</span>
                    <span className="text-white text-xs">{record.cards}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* シェアモーダル */}
      {showShare && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">📤 シェア</h2>
              <button 
                onClick={() => setShowShare(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg transition-colors">
                <p className="text-white text-sm font-semibold">🐦 Twitterでシェア</p>
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 py-3 px-4 rounded-lg transition-colors">
                <p className="text-white text-sm font-semibold">💬 LINEでシェア</p>
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 py-3 px-4 rounded-lg border border-white/40 transition-colors">
                <p className="text-white text-sm font-semibold">🔗 リンクをコピー</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フィードバックモーダル */}
      {showFeedback && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">💬 フィードバック</h2>
              <button 
                onClick={() => setShowFeedback(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white text-xs font-semibold mb-1 block">カテゴリー</label>
                <select className="w-full bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/40 focus:outline-none focus:bg-white/30">
                  <option value="bug">🐛 バグ報告</option>
                  <option value="feature">💡 機能要望</option>
                  <option value="other">💬 その他</option>
                </select>
              </div>
              <div>
                <label className="text-white text-xs font-semibold mb-1 block">詳細</label>
                <textarea 
                  className="w-full bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/40 placeholder:text-white/60 focus:outline-none focus:bg-white/30 h-24 resize-none"
                  placeholder="ご意見をお聞かせください..."
                />
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 py-2.5 px-4 rounded-lg transition-colors">
                <p className="text-white text-sm font-bold">送信</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 言語設定モーダル */}
      {showLanguageSettings && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">🌐 言語設定</h2>
              <button 
                onClick={() => setShowLanguageSettings(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-2">
              {['日本語', 'English', '中文'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`w-full py-3 px-4 rounded-lg transition-colors ${
                    selectedLanguage === lang 
                      ? 'bg-white text-blue-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  } border border-white/40`}
                >
                  <p className="text-sm font-semibold">{lang}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* アカウント設定モーダル */}
      {showAccountSettings && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">👤 アカウント設定</h2>
              <button 
                onClick={() => setShowAccountSettings(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-white/20 rounded-lg p-4 border border-white/40 text-center">
                <div className="w-20 h-20 mx-auto rounded-full border-4 border-white mb-2 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {players[0].avatar ? (
                    <Image
                      src={players[0].avatar}
                      alt={players[0].name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <p className="text-white text-sm font-bold">{players[0].name}</p>
                <p className="text-white/80 text-xs">Level 5</p>
              </div>

              <div>
                <label className="text-white text-xs font-semibold mb-1 block">表示名</label>
                <input 
                  type="text"
                  defaultValue="プレイヤー1"
                  className="w-full bg-white/20 text-white text-sm px-3 py-2 rounded-lg border border-white/40 focus:outline-none focus:bg-white/30"
                />
              </div>

              <button className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-4 rounded-lg border border-white/40 transition-colors">
                <p className="text-white text-sm font-semibold">🖼️ アバター変更</p>
              </button>

              <button className="w-full bg-green-500 hover:bg-green-600 py-2.5 px-4 rounded-lg transition-colors">
                <p className="text-white text-sm font-bold">保存</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* リバイモーダル */}
      {showRebuy && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">💰 チップ追加</h2>
              <button 
                onClick={() => setShowRebuy(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white/80 text-xs mb-1">現在のチップ</p>
                <div className="flex items-center gap-2">
                  <Image src="/chip-icon.png" alt="chip" width={20} height={20} unoptimized />
                  <p className="text-white text-2xl font-bold">{Math.floor(user?.chips || 0).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-white text-xs font-semibold mb-1 block">追加するチップ</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1000, 2000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRebuyAmount(amount)}
                      className={`py-2 px-3 rounded-lg transition-colors ${
                        rebuyAmount === amount
                          ? 'bg-white text-blue-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      } border border-white/40`}
                    >
                      <p className="text-xs font-bold">{Math.floor(amount).toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowRebuyNotification(true);
                  setShowRebuy(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 py-3 px-4 rounded-lg transition-colors"
              >
                <p className="text-white text-sm font-bold">購入する</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プレイヤーリストモーダル */}
      {showPlayerList && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">👥 プレイヤーリスト</h2>
              <button 
                onClick={() => setShowPlayerList(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={player.id} className="bg-white/20 rounded-lg p-3 border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {player.avatar ? (
                          <Image
                            src={player.avatar}
                            alt={player.name}
                            width={40}
                            height={40}
                            unoptimized
                            priority
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{player.name}</p>
                        <p className="text-white/80 text-xs">席 #{index + 1}</p>
                      </div>
                    </div>
                    {player.position && (
                      <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                        {player.position}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white/10 rounded px-2 py-1">
                      <p className="text-white/70 text-xs">チップ</p>
                      <div className="flex items-center gap-1">
                        <Image src="/chip-icon.png" alt="chip" width={12} height={12} unoptimized />
                        <p className="text-white text-sm font-semibold">{Math.floor(player.chips).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded px-2 py-1">
                      <p className="text-white/70 text-xs">ステータス</p>
                      <p className="text-green-400 text-sm font-semibold">
                        {player.folded ? '降りた' : player.bet > 0 ? 'ベット中' : 'アクティブ'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 統計モーダル */}
      {showStats && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">📊 統計</h2>
              <button 
                onClick={() => setShowStats(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-3">
              {/* 今日の統計 */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">🗓️ 今日の統計</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 rounded px-2 py-2">
                    <p className="text-white/70 text-xs">プレイハンド数</p>
                    <p className="text-white text-xl font-bold">24</p>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-2">
                    <p className="text-white/70 text-xs">勝率</p>
                    <p className="text-green-400 text-xl font-bold">62%</p>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-2">
                    <p className="text-white/70 text-xs">獲得チップ</p>
                    <div className="flex items-center gap-1">
                      <Image src="/chip-icon.png" alt="chip" width={14} height={14} unoptimized />
                      <p className="text-white text-lg font-bold">+3,500</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-2">
                    <p className="text-white/70 text-xs">最大ポット</p>
                    <div className="flex items-center gap-1">
                      <Image src="/chip-icon.png" alt="chip" width={14} height={14} unoptimized />
                      <p className="text-white text-lg font-bold">1,200</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 累計統計 */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">📈 累計統計</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">総ハンド数</span>
                    <span className="text-white text-sm font-bold">1,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">総勝率</span>
                    <span className="text-green-400 text-sm font-bold">58.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">プリフロップ勝率</span>
                    <span className="text-white text-sm font-bold">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-xs">ショーダウン勝率</span>
                    <span className="text-white text-sm font-bold">48%</span>
                  </div>
                </div>
              </div>

              {/* 最強ハンド */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">🏆 最強ハンド</p>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-3 text-center">
                  <p className="text-white text-xs mb-1">ロイヤルフラッシュ</p>
                  <p className="text-white text-2xl font-bold">A♠ K♠ Q♠ J♠ 10♠</p>
                  <p className="text-white/90 text-xs mt-1">2024/10/15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ルールモーダル */}
      {showRules && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">📖 ルール</h2>
              <button 
                onClick={() => setShowRules(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-3">
              {/* ゲーム概要 */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">🎯 Texas Hold&apos;em とは</p>
                <p className="text-white text-xs leading-relaxed">
                  テキサスホールデムは世界で最も人気のあるポーカーゲームです。2枚の手札と5枚のコミュニティカードで最高の5枚役を作ります。
                </p>
              </div>

              {/* ゲームの流れ */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">🔄 ゲームの流れ</p>
                <div className="space-y-2 text-xs text-white">
                  <div className="flex gap-2">
                    <span className="font-bold text-yellow-400">1.</span>
                    <span>プリフロップ: 2枚の手札が配られる</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-yellow-400">2.</span>
                    <span>フロップ: 3枚のコミュニティカードが開く</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-yellow-400">3.</span>
                    <span>ターン: 4枚目のカードが開く</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-yellow-400">4.</span>
                    <span>リバー: 5枚目のカードが開く</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-yellow-400">5.</span>
                    <span>ショーダウン: 手札を公開して勝敗決定</span>
                  </div>
                </div>
              </div>

              {/* アクション */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">🎮 アクション</p>
                <div className="space-y-1 text-xs text-white">
                  <div><span className="font-bold text-green-400">チェック:</span> ベットせずに次へ</div>
                  <div><span className="font-bold text-blue-400">コール:</span> 相手のベットに同額を払う</div>
                  <div><span className="font-bold text-yellow-400">レイズ:</span> 相手のベットより多く賭ける</div>
                  <div><span className="font-bold text-red-400">フォールド:</span> 降りる（手札を捨てる）</div>
                  <div><span className="font-bold text-purple-400">オールイン:</span> 全チップを賭ける</div>
                </div>
              </div>

              {/* 役の強さ */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">🃏 役の強さ（強い順）</p>
                <div className="space-y-1 text-xs text-white">
                  <div className="flex justify-between">
                    <span>1. ロイヤルフラッシュ</span>
                    <span className="text-yellow-400">A-K-Q-J-10 同じマーク</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. ストレートフラッシュ</span>
                    <span className="text-yellow-400">連番・同マーク</span>
                  </div>
                  <div>3. フォーカード（4枚同じ数字）</div>
                  <div>4. フルハウス（3枚+2枚）</div>
                  <div>5. フラッシュ（5枚同マーク）</div>
                  <div>6. ストレート（5枚連番）</div>
                  <div>7. スリーカード（3枚同じ）</div>
                  <div>8. ツーペア（2枚+2枚）</div>
                  <div>9. ワンペア（2枚同じ）</div>
                  <div>10. ハイカード（役なし）</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 設定モーダル */}
      {showSettings && (
        <div className="absolute inset-0 flex items-center justify-center z-[150] bg-black/60">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">⚙️ 設定</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <p className="text-lg">✕</p>
              </button>
            </div>

            <div className="space-y-4">
              {/* アニメーション設定 */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">⚡ アニメーション速度</p>
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-white text-xs">
                    <span>遅い</span>
                    <span className="font-bold">{animationSpeed}x</span>
                    <span>速い</span>
                  </div>
                </div>
              </div>

              {/* オートアクション */}
              <div className="bg-white/20 rounded-lg p-3 border border-white/40">
                <p className="text-white text-sm font-bold mb-2">🤖 オートアクション</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs">オートチェック</span>
                    <button
                      onClick={() => setAutoCheck(!autoCheck)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        autoCheck ? 'bg-green-500' : 'bg-white/30'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        autoCheck ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs">オートチェック/フォールド</span>
                    <button
                      onClick={() => setAutoCheckFold(!autoCheckFold)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        autoCheckFold ? 'bg-green-500' : 'bg-white/30'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        autoCheckFold ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-green-500 hover:bg-green-600 py-2.5 px-4 rounded-lg transition-colors"
              >
                <p className="text-white text-sm font-bold">閉じる</p>
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
      </div>
    </>
  );
}
export const runtime = "edge";
