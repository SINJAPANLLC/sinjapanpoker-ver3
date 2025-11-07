'use client';

import { useState } from 'react';
import { FaPlus, FaUser, FaCrown, FaGem } from 'react-icons/fa';

interface Player {
  id: string;
  name: string;
  chips: number;
  avatar?: string;
  isHost?: boolean;
  position: number;
  isActive?: boolean;
}

interface PokerTableOctagonProps {
  players: Player[];
  gameId: string;
  gameType: string;
  blinds: string;
  maxPlayers?: number;
  onPlayerJoin?: (position: number) => void;
  onPlayerLeave?: (playerId: string) => void;
}

export default function PokerTableOctagon({
  players,
  gameId,
  gameType,
  blinds,
  maxPlayers = 8,
  onPlayerJoin,
  onPlayerLeave,
}: PokerTableOctagonProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // 8つのポジションを定義（八角形のテーブル）
  const positions = Array.from({ length: maxPlayers }, (_, i) => i);
  
  // プレイヤーをポジションにマッピング
  const playerPositions = positions.map(position => {
    return players.find(player => player.position === position) || null;
  });

  const getPositionStyle = (position: number) => {
    const angle = (position * 45) - 90; // 45度間隔で配置
    const radius = 200; // テーブルからの距離
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    let y = Math.sin((angle * Math.PI) / 180) * radius;

    // プレイヤー2と1（9番目の位置）のY座標を下げる
    if (position === 2 || position === 1) {
      y += 30; // 30px下に移動
    }

    return {
      position: 'absolute' as const,
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)',
    };
  };

  const getPlayerChipCount = (player: Player) => {
    if (player.chips >= 1000000) {
      return `${(player.chips / 1000000).toFixed(1)}M`;
    } else if (player.chips >= 1000) {
      return `${(player.chips / 1000).toFixed(1)}K`;
    }
    return player.chips.toString();
  };

  return (
    <div className="relative w-full h-full min-h-[600px] flex items-center justify-center">
      {/* 八角形ポーカーテーブル */}
      <div className="relative w-96 h-96">
        {/* テーブル背景 */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc66 50%, #009944 100%)',
            clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
            boxShadow: '0 0 50px rgba(0, 255, 136, 0.5), inset 0 0 50px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* テーブル中央の情報エリア */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            {/* プレイヤー数 */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl font-bold">{players.length}</span>
              <FaUser className="text-xl" />
            </div>

            {/* ゲーム情報 */}
            <div className="text-center space-y-1 mb-4">
              <div className="text-sm opacity-80">自動スタート</div>
              <div className="text-xs opacity-60">ホストのゲーム開始待ち</div>
            </div>

            {/* ゲームルール */}
            <div className="text-center space-y-1 text-xs">
              <div className="font-semibold">{gameType}</div>
              <div>Blinds: {blinds}</div>
              <div>トゥワイス</div>
              <div>ボムポット: 1/9ハンド</div>
            </div>

            {/* テーブルID */}
            <div className="absolute bottom-4 text-xs opacity-60 font-mono">
              ID: {gameId}
            </div>

            {/* NLH PPPOKER.NET ロゴ */}
            <div className="absolute top-4 text-xs opacity-40 font-bold">
              NLH PPPOKER.NET
            </div>
          </div>

          {/* テーブルの縁 */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
              margin: '-4px',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
            }}
          />
        </div>

        {/* プレイヤースロット */}
        {positions.map((position) => {
          const player = playerPositions[position];
          const isEmpty = !player;
          const isHovered = hoveredSlot === position;

          return (
            <div
              key={position}
              style={getPositionStyle(position)}
              className="relative"
            >
              {isEmpty ? (
                <button
                  className={`w-16 h-16 rounded-full border-2 border-dashed transition-all duration-300 ${
                    isHovered
                      ? 'border-green-400 bg-green-400/20 scale-110'
                      : 'border-gray-400 hover:border-green-400 hover:bg-green-400/10'
                  }`}
                  onMouseEnter={() => setHoveredSlot(position)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  onClick={() => onPlayerJoin?.(position)}
                >
                  <FaPlus className="w-6 h-6 mx-auto mt-3 text-gray-400" />
                </button>
              ) : (
                <div className="relative">
                  {/* プレイヤーアバター */}
                  <div className={`w-16 h-16 rounded-full border-2 transition-all duration-300 ${
                    player.isActive 
                      ? 'border-green-400 bg-green-400/20 shadow-lg shadow-green-400/50' 
                      : 'border-gray-600 bg-gray-800'
                  }`}>
                    {player.isHost ? (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                        <FaCrown className="text-white text-xl" />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <FaUser className="text-white text-lg" />
                      </div>
                    )}
                  </div>

                  {/* プレイヤー名 */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="text-xs text-white font-semibold bg-black/80 px-2 py-1 rounded">
                      {player.name}
                    </div>
                  </div>

                  {/* チップ数 */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-1 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                      <FaGem className="text-xs" />
                      <span>{getPlayerChipCount(player)}</span>
                    </div>
                  </div>

                  {/* ホストマーク */}
                  {player.isHost && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <FaCrown className="text-white text-xs" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
