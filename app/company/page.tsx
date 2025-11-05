'use client';

import Link from 'next/link';
import { FaGlobe } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function CompanyContent() {
  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a1a] to-black"></div>
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
          <h1 className="text-2xl font-bold text-gradient-blue">会社概要</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="card animate-fade-in text-center">
          <div className="mb-6">
            <FaGlobe className="text-6xl text-blue-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">SIN JAPAN LIBERIA CO.,INC</h2>
            <p className="text-gray-400 text-lg">ポーカーゲームプラットフォーム</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <ProtectedRoute>
      <CompanyContent />
    </ProtectedRoute>
  );
}