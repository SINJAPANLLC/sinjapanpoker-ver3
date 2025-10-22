'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';

export default function ActiveGamePage() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/lobby');
    }, 3000);
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-[#1a0a0a] to-black flex items-center justify-center">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center px-4">
        <div className="card max-w-md mx-auto animate-fade-in">
          <Gamepad2 className="w-24 h-24 mx-auto mb-6 text-blue-400 animate-pulse" />
          <h1 className="text-4xl font-bold text-gradient-blue mb-4">ゲームページ準備中</h1>
          <p className="text-gray-400 mb-6">
            アクティブゲーム機能は現在開発中です
          </p>
          <p className="text-sm text-gray-500">
            3秒後にロビーに戻ります...
          </p>
        </div>
      </div>
    </div>
  );
}
