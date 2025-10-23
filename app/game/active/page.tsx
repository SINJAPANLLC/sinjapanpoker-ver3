'use client';

import { useState, useEffect } from 'react';
import { User, Menu, MessageCircle, Volume2, VolumeX, Music, Wifi, WifiOff, Maximize, Minimize, Info, History, Eye } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActiveGamePage() {
  const [raiseAmount, setRaiseAmount] = useState(200);
  const [turnTimer, setTurnTimer] = useState(15);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);
  const [autoCheckFold, setAutoCheckFold] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
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
  const [chatMessages, setChatMessages] = useState([
    { id: 1, player: 'プレイヤー2', message: 'よろしく！', time: '12:30' },
    { id: 2, player: 'プレイヤー6', message: 'いい手だ！', time: '12:32' },
    { id: 3, player: 'プレイヤー9', message: 'よし、勝負！', time: '12:34' },
  ]);
  
  const callAmount = 200;
  const minRaise = 200;
  const maxRaise = 5000;

  const actionLog = [
    { player: 'プレイヤー2', action: 'レイズ 200', time: '12:34' },
    { player: 'プレイヤー6', action: 'コール 200', time: '12:35' },
    { player: 'プレイヤー9', action: 'コール 200', time: '12:35' },
    { player: 'プレイヤー5', action: 'フォールド', time: '12:36' },
    { player: 'プレイヤー7', action: 'フォールド', time: '12:36' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  const communityCards: CardType[] = [
    { rank: 'A' as Rank, suit: 'spades' as Suit, id: 'comm-1' },
    { rank: 'K' as Rank, suit: 'hearts' as Suit, id: 'comm-2' },
    { rank: 'Q' as Rank, suit: 'diamonds' as Suit, id: 'comm-3' },
    { rank: 'J' as Rank, suit: 'clubs' as Suit, id: 'comm-4' },
    { rank: '10' as Rank, suit: 'spades' as Suit, id: 'comm-5' },
  ];

  const pot = 15000;
  const potAmount = 1050;
  const tableName = "SIN JAPAN TABLE #1";
  const handNumber = 42;
  const smallBlind = 50;
  const bigBlind = 100;
  const gamePhase = "FLOP"; // PREFLOP, FLOP, TURN, RIVER, SHOWDOWN

  const player1HandCards: CardType[] = [
    { rank: 'A' as Rank, suit: 'hearts' as Suit, id: 'p1-hand-1' },
    { rank: 'K' as Rank, suit: 'diamonds' as Suit, id: 'p1-hand-2' },
  ];

  const activePlayerId = 3;

  const players = [
    { id: 1, name: 'プレイヤー1', chips: 5000, cardSide: 'right' as const, showCards: false, position: null, bet: 0, lastAction: null, folded: false, chatMessage: null, isWinner: false, cards: [
      { rank: 'A' as Rank, suit: 'hearts' as Suit, id: 'p1-card-1' },
      { rank: 'K' as Rank, suit: 'diamonds' as Suit, id: 'p1-card-2' },
    ]},
    { id: 2, name: 'プレイヤー2', chips: 8500, cardSide: 'right' as const, showCards: true, position: 'D', bet: 200, lastAction: 'RAISE', folded: false, chatMessage: 'いい手だ！', isWinner: true, cards: [
      { rank: 'Q' as Rank, suit: 'clubs' as Suit, id: 'p2-card-1' },
      { rank: 'J' as Rank, suit: 'spades' as Suit, id: 'p2-card-2' },
    ]},
    { id: 3, name: 'プレイヤー3', chips: 12000, cardSide: 'right' as const, showCards: true, position: 'SB', bet: 50, lastAction: null, folded: false, chatMessage: null, isWinner: false, cards: [
      { rank: '10' as Rank, suit: 'hearts' as Suit, id: 'p3-card-1' },
      { rank: '9' as Rank, suit: 'diamonds' as Suit, id: 'p3-card-2' },
    ]},
    { id: 4, name: 'プレイヤー4', chips: 6200, cardSide: 'right' as const, showCards: true, position: 'BB', bet: 100, lastAction: null, folded: false, chatMessage: null, isWinner: false, cards: [
      { rank: '8' as Rank, suit: 'clubs' as Suit, id: 'p4-card-1' },
      { rank: '7' as Rank, suit: 'spades' as Suit, id: 'p4-card-2' },
    ]},
    { id: 5, name: 'プレイヤー5', chips: 9800, cardSide: 'right' as const, showCards: true, position: null, bet: 0, lastAction: 'FOLD', folded: true, chatMessage: null, isWinner: false, cards: [
      { rank: '6' as Rank, suit: 'hearts' as Suit, id: 'p5-card-1' },
      { rank: '5' as Rank, suit: 'diamonds' as Suit, id: 'p5-card-2' },
    ]},
    { id: 6, name: 'プレイヤー6', chips: 7500, cardSide: 'left' as const, showCards: true, position: null, bet: 200, lastAction: 'CALL', folded: false, chatMessage: 'よし、勝負！', isWinner: false, cards: [
      { rank: '4' as Rank, suit: 'clubs' as Suit, id: 'p6-card-1' },
      { rank: '3' as Rank, suit: 'spades' as Suit, id: 'p6-card-2' },
    ]},
    { id: 7, name: 'プレイヤー7', chips: 11000, cardSide: 'left' as const, showCards: true, position: null, bet: 0, lastAction: 'FOLD', folded: true, chatMessage: null, isWinner: false, cards: [
      { rank: '2' as Rank, suit: 'hearts' as Suit, id: 'p7-card-1' },
      { rank: 'A' as Rank, suit: 'clubs' as Suit, id: 'p7-card-2' },
    ]},
    { id: 8, name: 'プレイヤー8', chips: 4500, cardSide: 'left' as const, showCards: true, position: null, bet: 0, lastAction: null, folded: false, chatMessage: null, isWinner: false, cards: [
      { rank: 'K' as Rank, suit: 'spades' as Suit, id: 'p8-card-1' },
      { rank: 'Q' as Rank, suit: 'hearts' as Suit, id: 'p8-card-2' },
    ]},
    { id: 9, name: 'プレイヤー9', chips: 8200, cardSide: 'left' as const, showCards: true, position: null, bet: 200, lastAction: 'CALL', folded: false, chatMessage: null, isWinner: false, cards: [
      { rank: 'J' as Rank, suit: 'diamonds' as Suit, id: 'p9-card-1' },
      { rank: '10' as Rank, suit: 'clubs' as Suit, id: 'p9-card-2' },
    ]},
  ];

  const PlayerComponent = ({ player }: { player: typeof players[0] }) => {
    const isActive = player.id === activePlayerId;
    
    return (
      <div className="relative">
        {/* アクティブターンのハイライト */}
        {isActive && (
          <div className="absolute inset-0 -m-2">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></div>
          </div>
        )}

        {/* ハンドカード - アバターに重ねる */}
        {player.showCards && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${
            player.cardSide === 'right' 
              ? 'right-0 translate-x-1/2' 
              : 'left-0 -translate-x-1/2'
          }`}>
            <div className="flex items-end" style={{ perspective: '400px' }}>
              {player.cards.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="relative"
                  style={{
                    transform: `rotate(${cardIndex === 0 ? '-10deg' : '10deg'})`,
                    marginLeft: cardIndex === 1 ? '-60px' : '0',
                    zIndex: cardIndex,
                  }}
                >
                  <div className={`scale-[0.35] origin-center ${player.folded ? 'opacity-30' : ''}`}>
                    <Card card={card} faceUp={false} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* ベット額表示 - カードの横 */}
            {player.bet > 0 && !player.folded && (
              <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                player.cardSide === 'right' ? '-right-12' : '-left-12'
              }`}>
                <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-2 py-1 rounded-md border-2 border-white shadow-lg">
                  <div className="flex items-center gap-1">
                    <Image src="/chip-icon.png" alt="chip" width={14} height={14} />
                    <p className="text-white text-xs font-bold">{player.bet}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* アバターアイコン */}
        <div className={`w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg ${player.folded ? 'opacity-40' : ''}`}>
          <User className="w-10 h-10 text-white" strokeWidth={2} />
        </div>

        {/* ポジションマーカー（D, SB, BB） */}
        {player.position && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
            <p className="text-white text-xs font-bold">{player.position}</p>
          </div>
        )}

        {/* ターンタイマーとプログレスバー */}
        {isActive && (
          <>
            <div className="absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
              <p className="text-white text-sm font-bold">{turnTimer}</p>
            </div>
            {/* タイマープログレスバー */}
            <div className="absolute -bottom-3 left-0 right-0 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${turnTimer <= 5 ? 'bg-red-500' : 'bg-cyan-400'}`}
                style={{ width: `${(turnTimer / 15) * 100}%` }}
              ></div>
            </div>
          </>
        )}

        {/* チャット吹き出し */}
        {player.chatMessage && (
          <div className={`absolute top-0 ${
            player.cardSide === 'right' ? 'left-full ml-2' : 'right-full mr-2'
          } transform -translate-y-1/2`}>
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
          </div>
        )}

        {/* ユーザー情報（アバターの下部に被せる） */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-gradient-to-br from-cyan-400 to-blue-600 backdrop-blur-sm px-2 py-1 rounded-lg border-2 border-white/30 shadow-lg min-w-[90px] z-10 ${player.folded ? 'opacity-40' : ''}`}>
          <p className="text-white text-[10px] font-bold text-center whitespace-nowrap">
            {player.name}
          </p>
          <p className="text-white text-[10px] font-semibold text-center whitespace-nowrap">
            {player.chips.toLocaleString()}
          </p>
        </div>

        {/* 最後のアクション表示 - 所持チップの下 */}
        {player.lastAction && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[calc(100%+24px)]">
            <div className={`px-2 py-0.5 rounded-md border border-white/50 shadow-md ${
              player.lastAction === 'FOLD' ? 'bg-red-500' : 
              player.lastAction === 'RAISE' ? 'bg-green-500' : 
              'bg-blue-500'
            }`}>
              <p className="text-white text-[9px] font-bold text-center">{player.lastAction}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-screen"
      style={{
        backgroundImage: 'url(/poker-table-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: '55% 32%',
        backgroundRepeat: 'no-repeat',
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
        <div className="absolute top-16 left-4 w-64 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-50">
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
              <button className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left">
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
              
              <button className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left">
                <p className="text-white text-sm font-semibold">👥 プレイヤーリスト</p>
              </button>
              
              <button className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left">
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
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  サウンド {soundEnabled ? 'ON' : 'OFF'}
                </p>
              </button>
              
              <button 
                onClick={() => setMusicEnabled(!musicEnabled)}
                className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-semibold flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  音楽 {musicEnabled ? 'ON' : 'OFF'}
                </p>
              </button>
              
              <button className="w-full bg-white/20 hover:bg-white/30 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left">
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
              
              <button 
                onClick={() => {
                  setShowRebuy(true);
                  setShowMenu(false);
                }}
                className="w-full bg-green-500/80 hover:bg-green-500 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left"
              >
                <p className="text-white text-sm font-bold">💰 チップ追加</p>
              </button>
              
              <button 
                onClick={() => setIsSpectator(!isSpectator)}
                className={`w-full ${isSpectator ? 'bg-purple-600' : 'bg-white/20'} hover:bg-purple-500 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left`}
              >
                <p className="text-white text-sm font-bold">👁️ 観戦モード {isSpectator ? 'ON' : 'OFF'}</p>
              </button>
              
              <button className="w-full bg-orange-500/80 hover:bg-orange-500 py-2.5 px-3 rounded-lg border border-white/40 transition-colors text-left">
                <p className="text-white text-sm font-bold">🪑 離席中</p>
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
        <div className="absolute top-16 right-4 w-72 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-50">
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
                onClick={() => setChatMessage('よろしく！')}
                className="bg-white/20 hover:bg-white/30 py-1 rounded border border-white/40 transition-colors"
              >
                <p className="text-white text-[8px] font-semibold">よろしく！</p>
              </button>
              <button
                onClick={() => setChatMessage('いい手だ！')}
                className="bg-white/20 hover:bg-white/30 py-1 rounded border border-white/40 transition-colors"
              >
                <p className="text-white text-[8px] font-semibold">いい手だ！</p>
              </button>
              <button
                onClick={() => setChatMessage('GG')}
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
                    const newMessage = {
                      id: chatMessages.length + 1,
                      player: 'プレイヤー1',
                      message: chatMessage,
                      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                    };
                    setChatMessages([...chatMessages, newMessage]);
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
                    const newMessage = {
                      id: chatMessages.length + 1,
                      player: 'プレイヤー1',
                      message: chatMessage,
                      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                    };
                    setChatMessages([...chatMessages, newMessage]);
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
            <p className="text-white text-[8px]">Hand #{handNumber}</p>
            <p className="text-white text-[8px]">•</p>
            <p className="text-white text-[8px]">SB/BB: {smallBlind}/{bigBlind}</p>
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

      {/* コミュニティカード */}
      <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-3">
          {communityCards.map((card) => (
            <div key={card.id} className="scale-110">
              <Card card={card} faceUp={true} />
            </div>
          ))}
        </div>
      </div>

      {/* ゲームフェーズ */}
      <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-[700%]">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-3 py-1 rounded-md border border-white/30 shadow-md">
          <p className="text-white text-xs font-bold text-center">{gamePhase}</p>
        </div>
      </div>

      {/* ポットとサイドポット */}
      <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-[250%] flex gap-3 items-center">
        {/* サイドポット（複数オールインがある場合） */}
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-3 py-1.5 rounded border-2 border-white/30 shadow-md">
          <p className="text-white text-[8px] font-bold text-center">SIDE POT</p>
          <div className="flex items-center justify-center gap-0.5">
            <Image src="/chip-icon.png" alt="chip" width={12} height={12} />
            <p className="text-white text-[10px] font-semibold">3,200</p>
          </div>
        </div>
        
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
                <Image src="/chip-icon.png" alt="chip" width={24} height={24} className="drop-shadow-lg" />
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div 
            style={{
              background: 'linear-gradient(to bottom right, rgb(34, 211, 238), rgb(37, 99, 235))',
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
              <Image src="/chip-icon.png" alt="chip" width={16} height={16} />
              <p className="text-white text-sm font-semibold">{pot.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* プレイヤー1 - 中央下（少し左） */}
      <div className="absolute bottom-32 left-[45%] transform -translate-x-1/2">
        <PlayerComponent player={players[0]} />
      </div>

      {/* プレイヤー1のハンドカード - 右側に大きく扇形で表示 */}
      <div className="absolute bottom-24 left-[45%] transform translate-x-[80px]">
        <div className="flex items-end">
          {player1HandCards.map((card, cardIndex) => (
            <div
              key={card.id}
              className="relative"
              style={{
                transform: `rotate(${cardIndex === 0 ? '-10deg' : '10deg'})`,
                marginLeft: cardIndex === 1 ? '-30px' : '0',
                zIndex: cardIndex,
              }}
            >
              <div className="scale-110">
                <Card card={card} faceUp={true} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* プレイヤー2 - 左下 */}
      <div className="absolute bottom-72 left-6">
        <PlayerComponent player={players[1]} />
      </div>

      {/* プレイヤー3 - 左中 */}
      <div className="absolute top-[40%] left-6 transform -translate-y-1/2">
        <PlayerComponent player={players[2]} />
      </div>

      {/* プレイヤー4 - 左上 */}
      <div className="absolute top-56 left-6">
        <PlayerComponent player={players[3]} />
      </div>

      {/* プレイヤー5 - 上左 */}
      <div className="absolute top-16 left-1/4 transform -translate-x-1/2">
        <PlayerComponent player={players[4]} />
      </div>

      {/* プレイヤー6 - 上右 */}
      <div className="absolute top-16 right-1/4 transform translate-x-1/2">
        <PlayerComponent player={players[5]} />
      </div>

      {/* プレイヤー7 - 右上 */}
      <div className="absolute top-56 right-6">
        <PlayerComponent player={players[6]} />
      </div>

      {/* プレイヤー8 - 右中 */}
      <div className="absolute top-[40%] right-6 transform -translate-y-1/2">
        <PlayerComponent player={players[7]} />
      </div>

      {/* プレイヤー9 - 右下 */}
      <div className="absolute bottom-72 right-6">
        <PlayerComponent player={players[8]} />
      </div>

      {/* アクションボタン - 画面下部 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4">
        <div className="max-w-md mx-auto space-y-3">
          {/* レイズスライダー */}
          {showRaiseSlider && (
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-lg border-2 border-white/30 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-xs font-bold">
                  {raiseAmount >= maxRaise ? 'ALL IN' : 'レイズ額'}
                </p>
                <div className="flex items-center gap-1">
                  <Image src="/chip-icon.png" alt="chip" width={16} height={16} />
                  <p className="text-white text-sm font-bold">{raiseAmount}</p>
                </div>
              </div>
              
              {/* クイックベットボタン - POTサイズ */}
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                <button
                  onClick={() => setRaiseAmount(Math.floor(potAmount / 3))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">1/3 POT</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.floor(potAmount * 2 / 3))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">2/3 POT</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(potAmount)}
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

              {/* BB倍数ボタン */}
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, bigBlind * 2.5))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">2.5 BB</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, bigBlind * 3))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">3 BB</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, bigBlind * 4))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">4 BB</p>
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, bigBlind * 5))}
                  className="bg-white/20 hover:bg-white/30 py-1.5 rounded border border-white/40 transition-colors"
                >
                  <p className="text-white text-[9px] font-bold">5 BB</p>
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
              onClick={() => setShowRaiseSlider(false)}
              className="bg-red-500 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity"
            >
              <p className="text-white text-sm font-bold">フォールド</p>
            </button>
            <button 
              onClick={() => {
                console.log(`${callAmount > 0 ? 'コール' : 'チェック'}: ${callAmount}`);
                if (callAmount > 0) {
                  // チップアニメーションをトリガー
                  const newChipAnim = { id: Date.now(), playerId: 1 };
                  setChipAnimations([...chipAnimations, newChipAnim]);
                  setTimeout(() => {
                    setChipAnimations(prev => prev.filter(a => a.id !== newChipAnim.id));
                  }, 500);
                }
              }}
              className="bg-gradient-to-br from-cyan-400 to-blue-600 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity"
            >
              <p className="text-white text-sm font-bold">
                {callAmount > 0 ? `コール ${callAmount}` : 'チェック'}
              </p>
            </button>
            <button 
              onClick={() => {
                if (showRaiseSlider) {
                  console.log(`レイズ: ${raiseAmount}`);
                  setShowRaiseSlider(false);
                  // チップアニメーションをトリガー
                  const newChipAnim = { id: Date.now(), playerId: 1 };
                  setChipAnimations([...chipAnimations, newChipAnim]);
                  setTimeout(() => {
                    setChipAnimations(prev => prev.filter(a => a.id !== newChipAnim.id));
                  }, 500);
                } else {
                  setShowRaiseSlider(true);
                }
              }}
              className="bg-green-500 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity"
            >
              <p className="text-white text-sm font-bold">
                {showRaiseSlider ? (raiseAmount >= maxRaise ? 'ALL IN' : `レイズ ${raiseAmount}`) : 'レイズ'}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* テーブル情報パネル */}
      {showTableInfo && (
        <div className="absolute top-20 left-4 w-64 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-50">
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
        <div className="absolute top-20 left-20 w-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl z-50">
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
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

    </div>
  );
}
