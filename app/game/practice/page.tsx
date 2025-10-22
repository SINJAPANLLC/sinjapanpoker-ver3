'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coins, Flame, ArrowLeft, GraduationCap, Zap, Crown } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCurrencyStore } from '@/store/useCurrencyStore';

function PracticeContent() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState('medium');
  const { currency } = useCurrencyStore();

  const difficulties = [
    {
      id: 'easy',
      name: '初心者',
      icon: <GraduationCap className="w-12 h-12 text-white" />,
      description: 'ルールを学ぶのに最適',
      color: 'from-green-500 to-green-700'
    },
    {
      id: 'medium',
      name: '中級者',
      icon: <Zap className="w-12 h-12 text-white" />,
      description: '戦略を練習',
      color: 'from-yellow-500 to-yellow-700'
    },
    {
      id: 'hard',
      name: '上級者',
      icon: <Crown className="w-12 h-12 text-white" />,
      description: 'プロレベルのAI',
      color: 'from-blue-500 to-cyan-400'
    }
  ];

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/lobby" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-white">練習モード</h1>
          </div>
          <div className="flex items-center space-x-2 glass px-3 py-2 rounded-full">
            <Coins className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold">{(currency?.gameChips || 0).toLocaleString()}</span>
            <span className="text-gray-400 text-xs">練習用</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-gradient-blue mb-4 neon-glow">AIと対戦</h2>
          <p className="text-gray-400 text-lg">難易度を選択してください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {difficulties.map((diff, index) => (
            <button
              key={diff.id}
              onClick={() => setDifficulty(diff.id)}
              className={`card-blue hover-lift hover-glow group relative overflow-hidden ${
                difficulty === diff.id ? 'ring-2 ring-blue-400' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 text-center">
                <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${diff.color} flex items-center justify-center shadow-lg border border-white/20`}>
                  {diff.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{diff.name}</h3>
                <p className="text-gray-400 text-sm">{diff.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="card text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="mb-6">
            <div className="inline-block badge-primary px-6 py-2 mb-4">
              選択中: {difficulties.find(d => d.id === difficulty)?.name}
            </div>
            <p className="text-gray-400">
              {difficulty === 'easy' && '基本的な戦略を学びましょう'}
              {difficulty === 'medium' && '実戦的なスキルを磨きましょう'}
              {difficulty === 'hard' && '最高難度のチャレンジ'}
            </p>
          </div>

          <button
            onClick={() => router.push('/game/active')}
            className="btn-primary w-full text-xl py-4"
          >
            ゲーム開始
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <ProtectedRoute>
      <PracticeContent />
    </ProtectedRoute>
  );
}