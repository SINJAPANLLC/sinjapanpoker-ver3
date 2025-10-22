'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Dice6 as Dice } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function SpinUpContent() {
  const [selectedBuyIn, setSelectedBuyIn] = useState(10);

  const buyInOptions = [
    { amount: 1, multipliers: [2, 3, 5, 10, 25] },
    { amount: 5, multipliers: [2, 3, 5, 10, 50] },
    { amount: 10, multipliers: [2, 3, 5, 10, 100] },
    { amount: 50, multipliers: [2, 3, 5, 10, 500] },
    { amount: 100, multipliers: [2, 3, 5, 10, 1000] }
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
            <Link href="/" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">Spin & Go</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center animate-spin-slow">
            <Star className="text-6xl text-white" />
          </div>
          <h2 className="text-5xl font-black text-gradient-blue mb-4 neon-glow">Spin & Go</h2>
          <p className="text-gray-400 text-xl">3人制ハイパーターボ | 賞金は最大1000倍！</p>
        </div>

        {/* バイイン選択 */}
        <div className="card mb-8 animate-scale-in">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">バイイン額を選択</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {buyInOptions.map((option) => (
              <button
                key={option.amount}
                onClick={() => setSelectedBuyIn(option.amount)}
                className={`card-blue hover-lift hover-glow p-6 text-center transition-all ${
                  selectedBuyIn === option.amount ? 'ring-2 ring-blue-400 scale-105' : ''
                }`}
              >
                <div className="text-4xl font-bold text-gradient-blue mb-2">
                  ${option.amount}
                </div>
                <div className="text-gray-400 text-sm">
                  最大 {Math.max(...option.multipliers)}倍
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 賞金マルチプライヤー */}
        <div className="card mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-2xl font-bold text-white mb-6 text-center">賞金マルチプライヤー</h3>

          <div className="space-y-3">
            {buyInOptions
              .find(o => o.amount === selectedBuyIn)
              ?.multipliers.reverse()
              .map((mult, i) => (
                <div
                  key={mult}
                  className={`glass-strong rounded-xl p-4 flex justify-between items-center hover-lift ${
                    mult >= 100 ? 'border border-yellow-500/30' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      mult >= 100 ? 'from-yellow-500 to-yellow-700' :
                      mult >= 10 ? 'from-blue-500 to-cyan-400' :
                      'from-gray-600 to-gray-800'
                    } flex items-center justify-center`}>
                      <span className="text-xl font-bold">{mult}x</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        ${(selectedBuyIn * mult).toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-sm">賞金総額</div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {mult >= 100 ? '0.1%' : mult >= 10 ? '5%' : '20%'}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* プレイボタン */}
        <div className="card-blue text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="mb-6">
            <div className="text-gray-400 mb-2">選択中のバイイン</div>
            <div className="text-5xl font-bold text-gradient-blue mb-4">
              ${selectedBuyIn}
            </div>
            <div className="text-gray-400">
              エントリーフィー込み: ${selectedBuyIn + (selectedBuyIn * 0.1)}
            </div>
          </div>

          <button className="btn-primary w-full text-2xl py-5 animate-pulse-slow">
            <div className="flex items-center justify-center space-x-3">
              <Dice className="animate-float" />
              <span>スピン！</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function SpinUpPage() {
  return (
    <ProtectedRoute>
      <SpinUpContent />
    </ProtectedRoute>
  );
}
