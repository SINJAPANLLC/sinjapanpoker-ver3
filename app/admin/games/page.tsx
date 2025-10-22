'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPause, FaPlay, FaStop } from 'react-icons/fa';
import { Eye, Users } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminGamesContent() {
  const [games, setGames] = useState([
    {
      id: '1',
      name: 'NLH 720/ボムポット',
      type: 'cash',
      blinds: '$0.10/$0.20',
      players: [
        { id: '1', name: 'Player1', chips: 180, cards: ['♠A', '♥K'], position: 'BTN', action: 'Raise $2' },
        { id: '2', name: 'Player2', chips: 220, cards: ['♣Q', '♦Q'], position: 'SB', action: 'Call' },
        { id: '3', name: 'Player3', chips: 150, cards: ['♥9', '♠7'], position: 'BB', action: 'Fold' },
        { id: '4', name: 'Player4', chips: 200, cards: ['♦A', '♣K'], position: 'UTG', action: 'Fold' }
      ],
      board: ['♠K', '♥10', '♣5'],
      pot: 450,
      status: 'active'
    },
    {
      id: '2',
      name: 'High Stakes',
      type: 'cash',
      blinds: '$5/$10',
      players: [
        { id: '5', name: 'HighRoller', chips: 5000, cards: ['♠K', '♠Q'], position: 'BTN', action: 'All-in' },
        { id: '6', name: 'Whale', chips: 8000, cards: ['♥A', '♦A'], position: 'BB', action: 'Call' }
      ],
      board: ['♠J', '♠10', '♥9', '♠2'],
      pot: 12000,
      status: 'active'
    }
  ]);

  const handlePauseGame = (gameId: string) => {
    if (confirm('このゲームを一時停止しますか？')) {
      alert('ゲームを一時停止しました');
    }
  };

  const handleStopGame = (gameId: string) => {
    if (confirm('このゲームを強制終了しますか？')) {
      alert('ゲームを強制終了しました');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0000] to-black"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/admin/dashboard" className="text-blue-400 hover:text-cyan-300">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">ゲーム監視</h1>
          <div className="badge-primary ml-4">
            リアルタイム監視中
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="card-blue hover-lift animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* ゲームヘッダー */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{game.name}</h3>
                  <p className="text-gray-400">Blinds: {game.blinds} | Pot: ${game.pot.toLocaleString()}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePauseGame(game.id)}
                    className="glass hover-lift px-4 py-2 rounded-xl text-yellow-400"
                  >
                    <FaPause />
                  </button>
                  <button
                    onClick={() => handleStopGame(game.id)}
                    className="glass-blue hover-lift px-4 py-2 rounded-xl text-blue-400"
                  >
                    <FaStop />
                  </button>
                </div>
              </div>

              {/* ボード */}
              <div className="mb-6">
                <div className="text-gray-400 text-sm mb-2">コミュニティカード</div>
                <div className="flex space-x-2">
                  {game.board.map((card, i) => (
                    <div key={i} className="playing-card w-16 h-22 flex items-center justify-center text-black font-bold text-xl">
                      {card}
                    </div>
                  ))}
                </div>
              </div>

              {/* プレイヤー */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.players.map((player) => (
                  <div key={player.id} className="glass-strong rounded-xl p-4 hover-lift">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-white font-bold mb-1">{player.name}</div>
                        <div className="text-gray-500 text-sm">{player.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 font-bold">${player.chips}</div>
                        <div className="text-gray-500 text-xs">チップ</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-gray-400 text-xs mb-1">ホールカード（管理者のみ表示）</div>
                      <div className="flex space-x-2">
                        {player.cards.map((card, i) => (
                          <div key={i} className="playing-card w-12 h-16 flex items-center justify-center text-black font-bold">
                            {card}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="badge-secondary w-full text-center">
                      {player.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function AdminGamesPage() {
  return (
    <ProtectedRoute>
      <AdminGamesContent />
    </ProtectedRoute>
  );
}
