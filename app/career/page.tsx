'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaTrophy, FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa';
import { BarChart3, ShoppingCart, User, MessageCircle, Gamepad2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAppStore } from '@/store/useAppStore';

function CareerContent() {
  const [activePeriod, setActivePeriod] = useState('all');
  const { gameStats, user } = useAppStore();
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/stats/user?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setUserStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch user stats:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // 実際のデータを使用
  const gamesPlayed = userStats?.gamesPlayed || gameStats.gamesPlayed || 0;
  const winRate = userStats?.winRate || gameStats.winRate || 0;
  const totalEarnings = userStats?.totalEarnings || gameStats.totalEarnings || 0;
  const recentEarnings = userStats?.recentEarnings || gameStats.recentEarnings || 0;

  const stats = [
    { label: '総ゲーム数', value: gamesPlayed, color: 'text-white' },
    { label: '勝率', value: `${winRate.toFixed(1)}%`, color: 'text-blue-400' },
    { label: '総獲得', value: `$${totalEarnings.toFixed(2)}`, color: 'text-green-400' },
    { label: '最近の獲得', value: `$${recentEarnings.toFixed(2)}`, color: 'text-yellow-400' }
  ];

  // 実際のハンド履歴を使用（データがない場合は空配列）
  const recentGames = userStats?.handHistory || [];

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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/70686fc0-87b1-013e-fa57-0a58a9feac02/SJsP-thumbnail.png"
              alt="SIN JAPAN POKER"
              className="w-32 h-10 rounded-lg object-cover"
            />
            <h1 className="text-2xl font-bold text-gradient-blue">キャリア</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* 期間選択 */}
        <div className="flex justify-center space-x-4 mb-8 animate-fade-in">
          {[
            { id: 'day', label: '今日' },
            { id: 'week', label: '今週' },
            { id: 'month', label: '今月' },
            { id: 'all', label: '全期間' }
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setActivePeriod(period.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activePeriod === period.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* 統計サマリー */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="card mb-8 animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="text-gray-500 text-sm mb-2">総収益</h2>
              <div className="text-6xl font-black text-gradient-blue mb-2 neon-glow">
                {totalEarnings >= 0 ? '+' : ''}${totalEarnings.toFixed(2)}
              </div>
              {recentEarnings > 0 && (
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <FaArrowUp />
                  <span>直近: +${recentEarnings.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* グラフ */}
        <div className="card mb-8 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <BarChart3 className="text-blue-400" />
            <span>収益推移</span>
          </h3>

          <div className="h-64 flex items-end justify-between space-x-2">
            {[20, 45, 30, 60, 40, 70, 55, 80, 65, 90, 75, 85].map((height, i) => (
              <div key={i} className="flex-1 relative group">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 hover-lift cursor-pointer transition-all"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
                    +${(height * 10).toFixed(0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近のゲーム */}
        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <FaClock className="text-blue-400" />
            <span>最近のゲーム</span>
          </h3>

          {recentGames.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-500 mb-4">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              </div>
              <p className="text-gray-400 text-lg mb-2">まだゲーム履歴がありません</p>
              <p className="text-gray-500 text-sm">ゲームをプレイして履歴を作成しましょう</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGames.map((game: any, i: number) => (
                <div key={i} className="card hover-lift">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold mb-1">
                        {game.gameType} - {game.blinds}
                      </div>
                      <div className="text-gray-500 text-sm">{game.date}</div>
                    </div>
                    <div className={`text-2xl font-bold ${game.result === 'win' ? 'text-green-400' : 'text-blue-400'} flex items-center space-x-2`}>
                      {game.result === 'win' ? <FaArrowUp /> : <FaArrowDown />}
                      <span>{game.chips > 0 ? '+' : ''}{game.chips}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-6 z-20">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/shop" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ショップ</span>
          </Link>
          <Link href="/forum" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">フォーラム</span>
          </Link>
          <Link href="/lobby" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ロビー</span>
          </Link>
          <Link href="/career" className="flex flex-col items-center space-y-2 text-blue-400 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-cyan-400/20 rounded-full blur-sm animate-pulse"></div>
            </div>
            <span className="text-sm font-semibold">キャリア</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">プロフ</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function CareerPage() {
  return (
    <ProtectedRoute>
      <CareerContent />
    </ProtectedRoute>
  );
}