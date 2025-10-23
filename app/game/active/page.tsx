'use client';

import { useState, useEffect } from 'react';
import { User, Menu, MessageCircle } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';
import Image from 'next/image';

export default function ActiveGamePage() {
  const [raiseAmount, setRaiseAmount] = useState(200);
  const [turnTimer, setTurnTimer] = useState(15);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
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
    { id: 1, name: 'プレイヤー1', chips: 5000, cardSide: 'right' as const, showCards: false, position: null, bet: 0, lastAction: null, folded: false, chatMessage: null, cards: [
      { rank: 'A' as Rank, suit: 'hearts' as Suit, id: 'p1-card-1' },
      { rank: 'K' as Rank, suit: 'diamonds' as Suit, id: 'p1-card-2' },
    ]},
    { id: 2, name: 'プレイヤー2', chips: 8500, cardSide: 'right' as const, showCards: true, position: 'D', bet: 200, lastAction: 'RAISE', folded: false, chatMessage: 'いい手だ！', cards: [
      { rank: 'Q' as Rank, suit: 'clubs' as Suit, id: 'p2-card-1' },
      { rank: 'J' as Rank, suit: 'spades' as Suit, id: 'p2-card-2' },
    ]},
    { id: 3, name: 'プレイヤー3', chips: 12000, cardSide: 'right' as const, showCards: true, position: 'SB', bet: 50, lastAction: null, folded: false, chatMessage: null, cards: [
      { rank: '10' as Rank, suit: 'hearts' as Suit, id: 'p3-card-1' },
      { rank: '9' as Rank, suit: 'diamonds' as Suit, id: 'p3-card-2' },
    ]},
    { id: 4, name: 'プレイヤー4', chips: 6200, cardSide: 'right' as const, showCards: true, position: 'BB', bet: 100, lastAction: null, folded: false, chatMessage: null, cards: [
      { rank: '8' as Rank, suit: 'clubs' as Suit, id: 'p4-card-1' },
      { rank: '7' as Rank, suit: 'spades' as Suit, id: 'p4-card-2' },
    ]},
    { id: 5, name: 'プレイヤー5', chips: 9800, cardSide: 'right' as const, showCards: true, position: null, bet: 0, lastAction: 'FOLD', folded: true, chatMessage: null, cards: [
      { rank: '6' as Rank, suit: 'hearts' as Suit, id: 'p5-card-1' },
      { rank: '5' as Rank, suit: 'diamonds' as Suit, id: 'p5-card-2' },
    ]},
    { id: 6, name: 'プレイヤー6', chips: 7500, cardSide: 'left' as const, showCards: true, position: null, bet: 200, lastAction: 'CALL', folded: false, chatMessage: 'よし、勝負！', cards: [
      { rank: '4' as Rank, suit: 'clubs' as Suit, id: 'p6-card-1' },
      { rank: '3' as Rank, suit: 'spades' as Suit, id: 'p6-card-2' },
    ]},
    { id: 7, name: 'プレイヤー7', chips: 11000, cardSide: 'left' as const, showCards: true, position: null, bet: 0, lastAction: 'FOLD', folded: true, chatMessage: null, cards: [
      { rank: '2' as Rank, suit: 'hearts' as Suit, id: 'p7-card-1' },
      { rank: 'A' as Rank, suit: 'clubs' as Suit, id: 'p7-card-2' },
    ]},
    { id: 8, name: 'プレイヤー8', chips: 4500, cardSide: 'left' as const, showCards: true, position: null, bet: 0, lastAction: null, folded: false, chatMessage: null, cards: [
      { rank: 'K' as Rank, suit: 'spades' as Suit, id: 'p8-card-1' },
      { rank: 'Q' as Rank, suit: 'hearts' as Suit, id: 'p8-card-2' },
    ]},
    { id: 9, name: 'プレイヤー9', chips: 8200, cardSide: 'left' as const, showCards: true, position: null, bet: 200, lastAction: 'CALL', folded: false, chatMessage: null, cards: [
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

        {/* ターンタイマー */}
        {isActive && (
          <div className="absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
            <p className="text-white text-sm font-bold">{turnTimer}</p>
          </div>
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
        <button className="bg-gradient-to-br from-cyan-400 to-blue-600 p-3 rounded-full border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity">
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

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
        <div className="absolute top-16 right-4 w-72 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg border-2 border-white/30 shadow-2xl">
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
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-2 py-1 rounded border border-white/30 shadow-sm">
          <div className="flex items-center justify-center gap-2">
            <p className="text-white text-[8px]">Hand #{handNumber}</p>
            <p className="text-white text-[8px]">•</p>
            <p className="text-white text-[8px]">SB/BB: {smallBlind}/{bigBlind}</p>
          </div>
        </div>
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

      {/* ポット */}
      <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-[250%]">
        <div className="bg-gradient-to-br from-cyan-400 to-blue-600 px-4 py-2 rounded-lg border-2 border-white/30 shadow-lg">
          <p className="text-white text-xs font-bold text-center">POT</p>
          <div className="flex items-center justify-center gap-1">
            <Image src="/chip-icon.png" alt="chip" width={16} height={16} />
            <p className="text-white text-sm font-semibold">{pot.toLocaleString()}</p>
          </div>
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
      <div className="absolute top-44 left-6">
        <PlayerComponent player={players[3]} />
      </div>

      {/* プレイヤー5 - 上左 */}
      <div className="absolute top-6 left-1/4 transform -translate-x-1/2">
        <PlayerComponent player={players[4]} />
      </div>

      {/* プレイヤー6 - 上右 */}
      <div className="absolute top-6 right-1/4 transform translate-x-1/2">
        <PlayerComponent player={players[5]} />
      </div>

      {/* プレイヤー7 - 右上 */}
      <div className="absolute top-44 right-6">
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
              
              {/* クイックベットボタン */}
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
          <div className="flex gap-2">
            <button 
              onClick={() => setShowRaiseSlider(false)}
              className="bg-red-500 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity"
            >
              <p className="text-white text-sm font-bold">フォールド</p>
            </button>
            <button className="bg-gradient-to-br from-cyan-400 to-blue-600 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity">
              <p className="text-white text-sm font-bold">
                {callAmount > 0 ? `コール ${callAmount}` : 'チェック'}
              </p>
            </button>
            <button 
              onClick={() => setShowRaiseSlider(!showRaiseSlider)}
              className="bg-green-500 flex-1 py-3 rounded-md border-2 border-white/30 shadow-lg hover:opacity-90 transition-opacity"
            >
              <p className="text-white text-sm font-bold">
                {showRaiseSlider ? (raiseAmount >= maxRaise ? 'ALL IN' : `レイズ ${raiseAmount}`) : 'レイズ'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
