'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaClock } from 'react-icons/fa';
import { Users, Coins } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function GameCreateContent() {
  const router = useRouter();
  const [gameType, setGameType] = useState('nlh');
  const [stakes, setStakes] = useState({ sb: 0.1, bb: 0.2 });
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [minBuyIn, setMinBuyIn] = useState(20);
  const [maxBuyIn, setMaxBuyIn] = useState(200);
  const [tableName, setTableName] = useState('');

  const handleCreate = () => {
    router.push('/game/active');
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/lobby" className="text-blue-400 hover:text-cyan-300">
            <ArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-white">テーブル作成</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card animate-scale-in">
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">テーブル名</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="例: ハイローラーテーブル"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-3">ゲームタイプ</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'nlh', label: 'No-Limit Hold\'em' },
                  { id: 'plo', label: 'Pot-Limit Omaha' },
                  { id: 'plo5', label: '5-Card PLO' },
                  { id: 'shortdeck', label: 'Short Deck' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setGameType(type.id)}
                    className={`p-4 rounded-xl font-semibold transition-all ${
                      gameType === type.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                        : 'glass text-gray-400 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-3">スモールブラインド</label>
                <input
                  type="number"
                  value={stakes.sb}
                  onChange={(e) => setStakes({ ...stakes, sb: parseFloat(e.target.value) })}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-3">ビッグブラインド</label>
                <input
                  type="number"
                  value={stakes.bb}
                  onChange={(e) => setStakes({ ...stakes, bb: parseFloat(e.target.value) })}
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-3">最大人数: {maxPlayers}人</label>
              <input
                type="range"
                min="2"
                max="9"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-3">最小バイイン</label>
                <input
                  type="number"
                  value={minBuyIn}
                  onChange={(e) => setMinBuyIn(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-3">最大バイイン</label>
                <input
                  type="number"
                  value={maxBuyIn}
                  onChange={(e) => setMaxBuyIn(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={handleCreate}
                className="btn-primary w-full text-lg py-4"
              >
                テーブルを作成
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GameCreatePage() {
  return (
    <ProtectedRoute>
      <GameCreateContent />
    </ProtectedRoute>
  );
}