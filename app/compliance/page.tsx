'use client';

import Link from 'next/link';
import { FaArrowLeft, FaShieldAlt, FaFileAlt } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';

function ComplianceContent() {
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
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">法令遵守</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="card animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <FaFileAlt className="text-blue-400" />
              <span>利用規約</span>
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>本サービスは18歳以上の方のみご利用いただけます。</p>
              <p>SIN JAPAN LIBERIA CO.,INCが提供するポーカーゲームサービスです。</p>
            </div>
          </div>

          <div className="card animate-slide-in-up">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <FaShieldAlt className="text-blue-400" />
              <span>プライバシーポリシー</span>
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>個人情報は適切に管理され、第三者に提供されることはありません。</p>
              <p>AML/CFT対策により、一定の取引には本人確認が必要です。</p>
            </div>
          </div>

          <div className="card-blue animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-white mb-4">責任あるゲーミング</h2>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>• プレイ時間を管理し、休憩を取りましょう</p>
              <p>• 余裕のある金額でのみプレイしてください</p>
              <p>• ギャンブル依存症相談窓口: 03-1234-5678</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CompliancePage() {
  return (
    <ProtectedRoute>
      <ComplianceContent />
    </ProtectedRoute>
  );
}