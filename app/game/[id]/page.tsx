'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const gameId = params?.id as string;

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // ローディングシミュレーション
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">ゲームを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      {/* ヘッダー */}
      <header className="bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/lobby"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-white text-xl font-bold">ゲーム #{gameId}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-white text-sm">
            プレイヤー: {user?.username || 'ゲスト'}
          </span>
        </div>
      </header>

      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-3xl font-bold text-white mb-4">ゲーム #{gameId}</h2>
            <p className="text-gray-300 text-lg mb-6">
              このゲームルームは準備中です
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-6 max-w-md">
            <h3 className="text-white font-semibold mb-4">利用可能な機能</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-gray-300">
                <span>リアルタイムゲーム</span>
                <span className="text-yellow-400">準備中</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>マルチプレイヤー</span>
                <span className="text-yellow-400">準備中</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>チャット機能</span>
                <span className="text-yellow-400">準備中</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-x-4">
            <Link
              href="/game/active"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              デモゲームをプレイ
            </Link>
            <Link
              href="/lobby"
              className="inline-block bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors font-semibold"
            >
              ロビーに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}