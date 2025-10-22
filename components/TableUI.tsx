'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaClock, FaTrophy, FaFire, FaHeart, FaGem } from 'react-icons/fa';

interface Player {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  position: string;
  cards?: string[];
  status: 'active' | 'folded' | 'all-in' | 'winner';
  bet?: number;
  isDealer?: boolean;
  isCurrentPlayer?: boolean;
}

interface TableUIProps {
  players: Player[];
  communityCards: string[];
  pot: number;
  currentBet: number;
  timer: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  onAction: (action: string, amount?: number) => void;
  isSpectating?: boolean;
}

export default function TableUI({
  players,
  communityCards,
  pot,
  currentBet,
  timer,
  gamePhase,
  onAction,
  isSpectating = false
}: TableUIProps) {
  const [chipSlider, setChipSlider] = useState(currentBet);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // プレイヤーポジション計算
  const getPlayerPosition = (index: number, total: number) => {
    const positions = [
      { top: '8%', left: '50%', transform: 'translateX(-50%)' }, // Top
      { top: '20%', right: '8%', transform: 'translateY(-50%)' }, // Right Top
      { bottom: '8%', right: '20%', transform: 'translateY(50%)' }, // Bottom Right
      { bottom: '8%', left: '20%', transform: 'translateY(50%)' }, // Bottom Left
      { top: '20%', left: '8%', transform: 'translateY(-50%)' }, // Left Top
      { top: '50%', right: '4%', transform: 'translateY(-50%)' }, // Right Center
      { bottom: '4%', left: '50%', transform: 'translateX(-50%)' }, // Bottom Center
      { top: '50%', left: '4%', transform: 'translateY(-50%)' }, // Left Center
      { top: '35%', left: '50%', transform: 'translateX(-50%)' }, // Top Center
    ];
    return positions[index] || positions[0];
  };

  // 勝利アニメーション
  useEffect(() => {
    const winner = players.find(p => p.status === 'winner');
    if (winner) {
      setWinnerId(winner.id);
      setShowWinAnimation(true);
      setTimeout(() => setShowWinAnimation(false), 3000);
    }
  }, [players]);

  return (
    <div className="relative w-full h-full">
      {/* メインテーブル */}
      <div className="relative mx-auto w-[600px] h-[600px]">
        {/* テーブル背景 */}
        <div className="absolute inset-4 bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-full border-4 border-green-400 shadow-2xl animate-pulse">
          <div className="absolute inset-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-green-300">
            {/* テーブル模様 */}
            <div className="absolute inset-0 rounded-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-300/30 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-green-200/20 rounded-full"></div>
            </div>

            {/* コミュニティカード */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex space-x-2">
                {communityCards.map((card, index) => (
                  <div
                    key={index}
                    className={`w-12 h-18 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center text-black font-bold text-sm shadow-lg transform transition-all duration-500 ${
                      showWinAnimation ? 'animate-bounce' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {card}
                  </div>
                ))}
              </div>
            </div>

            {/* ポット表示 */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
              <div className="bg-yellow-500/90 backdrop-blur-sm rounded-xl px-6 py-3 border-2 border-yellow-300 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">${pot.toLocaleString()}</div>
                  <div className="text-yellow-200 text-sm">ポット</div>
                </div>
              </div>
            </div>

            {/* ゲームフェーズ表示 */}
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-600">
                <div className="text-white font-semibold capitalize">{gamePhase}</div>
              </div>
            </div>
          </div>
        </div>

        {/* プレイヤー表示 */}
        {players.map((player, index) => {
          const position = getPlayerPosition(index, players.length);
          const isWinner = player.status === 'winner';

          return (
            <div
              key={player.id}
              className={`absolute w-24 h-20 transition-all duration-500 ${
                showWinAnimation && isWinner ? 'animate-pulse scale-110' : ''
              }`}
              style={position}
            >
              <div className={`relative w-full h-full bg-black/90 rounded-xl border-3 backdrop-blur-sm ${
                player.status === 'active' ? 'border-green-400 shadow-green-400/50 shadow-lg' :
                player.status === 'folded' ? 'border-gray-500 opacity-60' :
                player.status === 'all-in' ? 'border-blue-400 shadow-blue-400/50 shadow-lg' :
                'border-yellow-400 shadow-yellow-400/50 shadow-lg'
              }`}>
                {/* ディーラーボタン */}
                {player.isDealer && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    D
                  </div>
                )}

                {/* アクティブプレイヤーインジケーター */}
                {player.isCurrentPlayer && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                )}

                {/* プレイヤー情報 */}
                <div className="p-2 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Image
                      src={player.avatar}
                      alt={player.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full border border-white"
                    />
                    <span className="text-white text-xs font-semibold truncate">{player.name}</span>
                  </div>
                  <div className="text-green-400 text-xs font-bold">${player.chips.toLocaleString()}</div>
                  <div className="text-yellow-400 text-xs">{player.position}</div>

                  {/* ベット表示 */}
                  {player.bet && player.bet > 0 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      ${player.bet.toLocaleString()}
                    </div>
                  )}

                  {/* 手札表示 */}
                  {player.cards && player.status !== 'folded' && (
                    <div className="flex justify-center space-x-1 mt-1">
                      {player.cards.map((card, cardIndex) => (
                        <div
                          key={cardIndex}
                          className={`w-5 h-7 rounded border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            player.status === 'winner' ? 'bg-yellow-400 text-black animate-bounce' :
                            'bg-white text-black'
                          }`}
                          style={{ animationDelay: `${cardIndex * 0.1}s` }}
                        >
                          {card}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 勝利エフェクト */}
                  {isWinner && showWinAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaTrophy className="text-yellow-400 text-xl animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* アクションUI */}
      {!isSpectating && (
        <div className="mt-8 flex flex-col items-center space-y-4">
          {/* タイマー */}
          <div className="flex items-center space-x-2">
            <FaClock className="text-blue-400" />
            <div className={`text-2xl font-bold ${timer <= 5 ? 'text-blue-400 animate-pulse' : 'text-white'}`}>
              {timer}s
            </div>
          </div>

          {/* チップスライダー */}
          <div className="w-full max-w-md">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">ベット額</span>
                <span className="text-green-400 font-bold">${chipSlider.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={currentBet}
                max={players.find(p => p.isCurrentPlayer)?.chips || 0}
                value={chipSlider}
                onChange={(e) => setChipSlider(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-4">
            <button
              onClick={() => onAction('fold')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              フォールド
            </button>
            <button
              onClick={() => onAction('call', currentBet)}
              className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
            >
              コール ${currentBet.toLocaleString()}
            </button>
            <button
              onClick={() => onAction('raise', chipSlider)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              レイズ ${chipSlider.toLocaleString()}
            </button>
            <button
              onClick={() => onAction('all-in')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              オールイン
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
