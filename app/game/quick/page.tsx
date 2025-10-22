'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Zap, ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function QuickGameContent() {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (searching) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            router.push('/game/active');
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [searching, router]);

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
          <h1 className="text-2xl font-bold text-white">クイックゲーム</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-md">
          {!searching ? (
            <div className="card text-center animate-scale-in">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center animate-pulse-slow">
                  <Zap className="text-5xl text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">クイックマッチ</h2>
                <p className="text-gray-400">
                  あなたのレベルに合ったプレイヤーと即座にマッチングします
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="glass-strong rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ステークス</span>
                    <span className="text-white font-semibold">$0.10 / $0.20</span>
                  </div>
                </div>
                <div className="glass-strong rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">最大人数</span>
                    <span className="text-white font-semibold">6人</span>
                  </div>
                </div>
                <div className="glass-strong rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">バイイン</span>
                    <span className="text-white font-semibold">$20 - $200</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSearching(true)}
                className="btn-primary w-full text-xl py-4 animate-pulse-slow"
              >
                マッチング開始
              </button>
            </div>
          ) : (
            <div className="card text-center animate-fade-in">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-blue-500 animate-spin-slow"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="text-5xl text-blue-400 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">プレイヤーを検索中...</h2>
                <p className="text-gray-400 mb-4">
                  {progress}% 完了
                </p>
              </div>

              <div className="progress-bar mb-6">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>

              <button
                onClick={() => {
                  setSearching(false);
                  setProgress(0);
                }}
                className="btn-secondary w-full"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function QuickGamePage() {
  return (
    <ProtectedRoute>
      <QuickGameContent />
    </ProtectedRoute>
  );
}