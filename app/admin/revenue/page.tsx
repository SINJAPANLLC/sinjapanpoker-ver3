'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  Calendar,
  RefreshCw,
  BarChart3,
  Activity,
  AlertCircle
} from 'lucide-react';

interface RevenueData {
  summary: {
    totalGames: number;
    totalPot: number;
    avgPot: number;
    totalHands: number;
    totalRake: number;
    rakeRate: string;
  };
  dailyRevenue: Array<{
    date: string;
    games: number;
    totalPot: number;
    rake: number;
  }>;
  topWinners: Array<{
    userId: string;
    username: string;
    totalWinnings: number;
    handsPlayed: number;
  }>;
  period: string;
}

function RevenueManagementContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const fetchRevenueData = async (period: string) => {
    try {
      setLoading(true);
      setError('');
      
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
      const response = await fetch(`/api/admin/revenue?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRevenueData(data);
      } else {
        setError(data.error || '収益データの取得に失敗しました');
      }
    } catch (err) {
      console.error('収益データ取得エラー:', err);
      setError('収益データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData(selectedPeriod);
  }, [selectedPeriod]);

  const handleRefresh = () => {
    fetchRevenueData(selectedPeriod);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today': return '今日';
      case 'week': return '今週';
      case 'month': return '今月';
      case 'all': return '全期間';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">収益管理</h1>
                <p className="text-gray-400 text-sm">レーキ・手数料の管理と分析</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* 期間選択 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {(['today', 'week', 'month', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {period === 'today' && '今日'}
                {period === 'week' && '今週'}
                {period === 'month' && '今月'}
                {period === 'all' && '全期間'}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>更新</span>
          </button>
        </div>

        {loading && !revenueData ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : revenueData ? (
          <>
            {/* 収益統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm font-semibold">
                      +{revenueData.summary.totalRake.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">総収益（レーキ）</p>
                  <p className="text-white text-lg md:text-xl font-bold">
                    ¥{revenueData.summary.totalRake.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 text-sm font-semibold">{revenueData.summary.rakeRate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">レーキ率</p>
                  <p className="text-white text-lg md:text-xl font-bold">
                    {revenueData.summary.rakeRate}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-sm font-semibold">
                      {revenueData.summary.totalGames}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">総ゲーム数</p>
                  <p className="text-white text-lg md:text-xl font-bold">
                    {revenueData.summary.totalGames.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 text-sm font-semibold">
                      {revenueData.summary.totalHands}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">総ハンド数</p>
                  <p className="text-white text-lg md:text-xl font-bold">
                    {revenueData.summary.totalHands.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* 日別収益 */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 mb-6">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span>日別収益推移</span>
                </h2>
              </div>
              <div className="p-6">
                {revenueData.dailyRevenue.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-400 font-semibold">日付</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-semibold">ゲーム数</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-semibold">総ポット</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-semibold">レーキ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueData.dailyRevenue.map((day, index) => (
                          <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                            <td className="py-3 px-4 text-white">{day.date}</td>
                            <td className="py-3 px-4 text-right text-gray-300">{day.games}</td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              ¥{Math.floor(day.totalPot).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-green-400 font-semibold">
                              ¥{Math.floor(day.rake).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">この期間のデータがありません</p>
                )}
              </div>
            </div>

            {/* トップウィナー */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-xl font-bold text-white">トッププレイヤー（獲得順）</h2>
              </div>
              <div className="p-6">
                {revenueData.topWinners.length > 0 ? (
                  <div className="space-y-3">
                    {revenueData.topWinners.map((winner, index) => (
                      <div
                        key={winner.userId}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-gray-600 text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{winner.username}</h3>
                            <p className="text-gray-400 text-sm">{winner.handsPlayed}ハンドプレイ</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${winner.totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {winner.totalWinnings >= 0 ? '+' : ''}¥{winner.totalWinnings.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">この期間のデータがありません</p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function RevenueManagement() {
  return (
    <AdminProtectedRoute>
      <RevenueManagementContent />
    </AdminProtectedRoute>
  );
}
