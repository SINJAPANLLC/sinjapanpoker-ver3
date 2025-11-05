'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaChartBar, FaDollarSign, FaDownload } from 'react-icons/fa';
import { ArrowLeft, BarChart3, Users } from 'lucide-react';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

function AdminAnalyticsContent() {
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState<any>(null);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('admin_token');
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        
        setStats({
          revenue: data.revenue || { total: 0, rake: 0, tournament: 0, vip: 0 },
          users: data.users || { total: 0, new: 0, active: 0, retention: 0 },
          games: data.games || { total: 0, today: 0, week: 0, active: 0 }
        });
        
        setTopPlayers((data.topRakePlayers || []).map((p: any, i: number) => ({
          rank: i + 1,
          name: p.username,
          rakePaid: p.rakePaid || 0,
          games: p.gamesPlayed || 0
        })));
      } catch (error) {
        console.error('Stats fetch error:', error);
        setStats({
          revenue: { total: 0, rake: 0, tournament: 0, vip: 0 },
          users: { total: 0, new: 0, active: 0, retention: 0 },
          games: { total: 0, today: 0, week: 0, active: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // 1分ごとに更新
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [period]);

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0000] to-black"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="text-blue-400 hover:text-cyan-300">
              <ArrowLeft className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-gradient-blue">分析・統計</h1>
          </div>

          <button className="btn-primary flex items-center space-x-2">
            <FaDownload />
            <span>レポート出力</span>
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : !stats ? (
          <div className="text-center py-20 text-gray-500">
            データを読み込めませんでした
          </div>
        ) : (
          <>
        {/* 期間選択 */}
        <div className="flex justify-center space-x-4 mb-8 animate-fade-in">
          {[
            { id: 'day', label: '今日' },
            { id: 'week', label: '今週' },
            { id: 'month', label: '今月' },
            { id: 'year', label: '今年' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-6 py-3 rounded-xl font-semibold ${
                period === p.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                  : 'glass text-gray-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 収益統計 */}
        <div className="card mb-8 animate-scale-in">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <FaDollarSign className="text-yellow-500" />
            <span>収益分析</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-blue mb-2">
                ${stats.revenue.total.toLocaleString()}
              </div>
              <div className="text-gray-400">総収益</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                ${stats.revenue.rake.toLocaleString()}
              </div>
              <div className="text-gray-400">レーキ収益</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                ${stats.revenue.tournament.toLocaleString()}
              </div>
              <div className="text-gray-400">トーナメント</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                ${stats.revenue.vip.toLocaleString()}
              </div>
              <div className="text-gray-400">VIP販売</div>
            </div>
          </div>

          {/* グラフ */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {[45, 52, 48, 65, 58, 72, 68].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-blue-500 to-cyan-400 hover-lift cursor-pointer"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="text-center text-gray-500 text-xs mt-2">
                  {['月', '火', '水', '木', '金', '土', '日'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ユーザー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-in-up">
          <div className="card hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">新規ユーザー</div>
                <div className="text-3xl font-bold text-white">{stats.users.new.toLocaleString()}</div>
              </div>
              <Users className="text-4xl text-blue-400 opacity-20" />
            </div>
          </div>

          <div className="card hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">アクティブユーザー</div>
                <div className="text-3xl font-bold text-gradient-blue">{stats.users.active.toLocaleString()}</div>
              </div>
              <Users className="text-4xl text-green-400 opacity-20" />
            </div>
          </div>

          <div className="card hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">総ユーザー数</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.users.total.toLocaleString()}</div>
              </div>
              <BarChart3 className="text-4xl text-yellow-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* トッププレイヤー */}
        <div className="card animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <FaChartBar className="text-blue-400" />
            <span>トップレーキ貢献者</span>
          </h2>

          <div className="space-y-3">
            {topPlayers.map((player) => (
              <div key={player.rank} className="glass-strong rounded-xl p-4 hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                      player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                      'bg-gradient-to-br from-orange-400 to-orange-600 text-black'
                    }`}>
                      #{player.rank}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{player.name}</div>
                      <div className="text-gray-500 text-sm">{player.games}ゲーム</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gradient-blue">
                      ${player.rakePaid.toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs">レーキ貢献</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AdminProtectedRoute requiredPermission="analytics.view">
      <AdminAnalyticsContent />
    </AdminProtectedRoute>
  );
}
