'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function InviteContent() {
  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/profile" className="text-blue-400 hover:text-cyan-300">
            <ArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">友達紹介</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 近日公開メッセージ */}
        <div className="text-center py-20 animate-fade-in">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full mx-auto mb-8 flex items-center justify-center animate-glow">
            <span className="text-6xl">🎁</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">友達紹介機能</h2>
          <p className="text-gray-400 text-xl mb-8">友達紹介機能は近日公開予定です</p>
          <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-gray-300">
              友達を招待してボーナスを獲得できる機能を準備中です。<br />
              公開をお待ちください。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InvitePage() {
  return (
    <ProtectedRoute>
      <InviteContent />
    </ProtectedRoute>
  );
}