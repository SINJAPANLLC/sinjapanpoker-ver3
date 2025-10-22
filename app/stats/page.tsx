'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';
import { ArrowLeft, Trophy, BarChart3, Coins, Flame } from 'lucide-react';
import { PlayerStats } from '@/types';

export default function StatsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await axios.get(`/api/stats/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    loadStats();
  }, [token, user, router, loadStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/lobby')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            <ArrowLeft />
            <span>戻る</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <BarChart3 className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">プレイヤー統計</h1>
          <p className="text-gray-400">{user?.username}さんの戦績</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 総ゲーム数 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Flame className="text-3xl text-orange-500" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stats.totalGames}</div>
                  <div className="text-sm text-gray-400">総ゲーム数</div>
                </div>
              </div>
            </div>

            {/* 勝率 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="text-3xl text-yellow-500" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {stats.totalGames > 0
                      ? Math.round((stats.gamesWon / stats.totalGames) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-400">勝率</div>
                </div>
              </div>
            </div>

            {/* 獲得チップ */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Coins className="text-3xl text-green-500" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {stats.totalChipsWon.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">獲得チップ</div>
                </div>
              </div>
            </div>

            {/* 最大ポット */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="text-3xl text-purple-500" />
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {stats.biggestPot.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">最大ポット</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 詳細統計 */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">基本統計</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">プレイしたハンド数</span>
                  <span className="text-white font-semibold">{stats.handsPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">勝利数</span>
                  <span className="text-white font-semibold">{stats.gamesWon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ベストハンド</span>
                  <span className="text-white font-semibold">
                    {stats.bestHand || '未記録'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">高度な統計</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">VPIP</span>
                  <span className="text-white font-semibold">{stats.vpip}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PFR</span>
                  <span className="text-white font-semibold">{stats.pfr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">アグレッション</span>
                  <span className="text-white font-semibold">{stats.aggression.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 統計の説明 */}
        <div className="mt-8 bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-white font-bold mb-3">統計用語の説明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-200">
            <div>
              <strong>VPIP:</strong> プリフロップで自発的にポットに参加した割合
            </div>
            <div>
              <strong>PFR:</strong> プリフロップでレイズした割合
            </div>
            <div>
              <strong>アグレッション:</strong> ベット/レイズの頻度を示す指標
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

