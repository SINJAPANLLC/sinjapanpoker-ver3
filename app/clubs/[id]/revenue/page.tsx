'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaDollarSign, FaTable, FaClock, FaTrophy, FaChartPie } from 'react-icons/fa';
import { Users } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function ClubRevenueContent() {
  const params = useParams();
  const clubId = params?.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await fetch(`/api/clubs/${clubId}/revenue?period=${period}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Revenue fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      fetchRevenue();
      const interval = setInterval(fetchRevenue, 60000);
      return () => clearInterval(interval);
    }
  }, [clubId, period]);

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
      <header className="relative z-10 glass-strong border-b border-white/10 p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href={`/clubs/${clubId}`} className="text-blue-400 hover:text-cyan-300">
              <FaArrowLeft className="text-lg md:text-xl" />
            </Link>
            <h1 className="text-lg md:text-2xl font-bold text-gradient-blue">クラブ収益</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-gray-500">
            データを読み込めませんでした
          </div>
        ) : (
          <>
            {/* クラブ情報 */}
            <div className="card mb-6 md:mb-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{data.club.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <span className="badge-primary">コード: {data.club.code}</span>
                    <span className="badge-white">{data.club.memberCount}人</span>
                    <span className={`badge ${
                      data.club.tier === 'platinum' ? 'bg-purple-500' :
                      data.club.tier === 'gold' ? 'bg-yellow-500' :
                      data.club.tier === 'silver' ? 'bg-gray-400' :
                      'bg-orange-600'
                    } text-white`}>
                      {data.club.tier.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-gray-400 text-xs md:text-sm mb-1">レーキシェア</div>
                  <div className="text-2xl md:text-3xl font-bold text-gradient-blue">
                    {data.club.rakePercentage}%
                  </div>
                </div>
              </div>
            </div>

            {/* 期間選択 */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
              {[
                { id: 'daily', label: '今日' },
                { id: 'weekly', label: '今週' },
                { id: 'monthly', label: '今月' },
                { id: 'alltime', label: '全期間' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base ${
                    period === p.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                      : 'glass text-gray-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 収益サマリー */}
            <div className="card-blue mb-6 md:mb-8 animate-scale-in">
              <div className="text-center">
                <div className="text-gray-400 text-xs md:text-sm mb-2">
                  {period === 'daily' ? '今日' : period === 'weekly' ? '今週' : period === 'monthly' ? '今月' : '全期間'}の収益
                </div>
                <div className="text-4xl md:text-6xl font-black text-gradient-blue mb-4 neon-glow">
                  ${data.revenue.totalRevenue.toFixed(2)}
                </div>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <div className="text-xl md:text-3xl font-bold text-green-400">
                      ${data.revenue.rakeRevenue.toFixed(2)}
                    </div>
                    <div className="text-gray-500 text-xs md:text-sm">レーキ収益</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-bold text-yellow-400">
                      ${data.revenue.tournamentRevenue.toFixed(2)}
                    </div>
                    <div className="text-gray-500 text-xs md:text-sm">トーナメント</div>
                  </div>
                </div>
              </div>
            </div>

            {/* テーブル別収益 */}
            <div className="card mb-6 md:mb-8 animate-slide-in-up">
              <h3 className="text-lg md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center space-x-2">
                <FaTable className="text-blue-400 text-lg md:text-2xl" />
                <span>テーブル別収益</span>
              </h3>

              <div className="space-y-2 md:space-y-3">
                {data.revenue.tableBreakdown.map((table: any, index: number) => (
                  <div key={table.tableId} className="glass-strong rounded-xl p-3 md:p-4 hover-lift">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-sm md:text-base truncate mb-1">
                          {table.tableName}
                        </div>
                        <div className="text-gray-500 text-xs md:text-sm">
                          {table.hands}ハンド | 平均 ${table.avgRevenuePerHand.toFixed(2)}/ハンド
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg md:text-2xl font-bold text-gradient-blue">
                          ${table.revenue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* メンバー別貢献度 */}
            <div className="card animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center space-x-2">
                <Users className="text-blue-400 text-lg md:text-2xl" />
                <span>メンバー別貢献度</span>
              </h3>

              <div className="space-y-2 md:space-y-3">
                {data.revenue.memberBreakdown.slice(0, 10).map((member: any, index: number) => (
                  <div key={member.userId} className="glass-strong rounded-xl p-3 md:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-base flex-shrink-0 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' :
                          'bg-gray-700 text-white'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-sm md:text-base truncate">
                            {member.username}
                          </div>
                          <div className="text-gray-500 text-xs md:text-sm">
                            {member.gamesPlayed}ゲーム | {member.contribution.toFixed(1)}%貢献
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base md:text-xl font-bold text-yellow-500">
                          ${member.rakePaid.toFixed(2)}
                        </div>
                        <div className="text-gray-600 text-xs">レーキ</div>
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

export default function ClubRevenuePage() {
  return (
    <ProtectedRoute>
      <ClubRevenueContent />
    </ProtectedRoute>
  );
}
