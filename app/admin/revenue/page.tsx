'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { useRevenueStore, GameTransaction } from '@/store/useRevenueStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

function RevenueManagementContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  const { 
    transactions, 
    stats, 
    getTransactionsByDateRange,
    getTransactionsByType,
    updateStats,
    addTransaction
  } = useRevenueStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedType, setSelectedType] = useState<'all' | 'rake' | 'tournament_fee' | 'table_fee'>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    const txDate = new Date(tx.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDate = txDate >= startDate && txDate <= endDate;
    
    return matchesType && matchesDate;
  });

  const getRevenueByPeriod = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return getTransactionsByDateRange(startDate, now);
  };

  const periodTransactions = getRevenueByPeriod();
  const periodRevenue = periodTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const getTransactionTypeLabel = (type: GameTransaction['type']) => {
    switch (type) {
      case 'rake':
        return 'レーキ収益';
      case 'tournament_fee':
        return 'トーナメント手数料';
      case 'table_fee':
        return 'テーブル手数料';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: GameTransaction['type']) => {
    switch (type) {
      case 'rake':
        return 'text-green-400 bg-green-500/20';
      case 'tournament_fee':
        return 'text-blue-400 bg-blue-500/20';
      case 'table_fee':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
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
        {/* 収益統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-semibold">+{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総収益</p>
              <p className="text-white text-lg md:text-xl font-bold">¥{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-blue-400 text-sm font-semibold">5%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">レーキ収益</p>
              <p className="text-white text-lg md:text-xl font-bold">¥{stats.totalRake.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-purple-400 text-sm font-semibold">10%</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">トーナメント手数料</p>
              <p className="text-white text-lg md:text-xl font-bold">¥{stats.totalTournamentFees.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-yellow-400 text-sm font-semibold">
                  {selectedPeriod === 'daily' ? '日' : selectedPeriod === 'weekly' ? '週' : '月'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">期間収益</p>
              <p className="text-white text-lg md:text-xl font-bold">¥{periodRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">期間</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="daily">日別</option>
                  <option value="weekly">週別</option>
                  <option value="monthly">月別</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">種類</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="all">すべて</option>
                  <option value="rake">レーキ収益</option>
                  <option value="tournament_fee">トーナメント手数料</option>
                  <option value="table_fee">テーブル手数料</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">開始日</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">終了日</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 取引履歴 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">取引履歴</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={updateStats}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>更新</span>
                </button>
                <span className="text-gray-400 text-sm">{filteredTransactions.length}件</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">取引履歴がありません</p>
                <p className="text-gray-500 text-sm">指定した条件に一致する取引が見つかりません</p>
              </div>
            ) : (
              <div className="min-w-full">
                {/* デスクトップ表示 */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left p-4 text-gray-400 font-medium">日時</th>
                        <th className="text-left p-4 text-gray-400 font-medium">種類</th>
                        <th className="text-left p-4 text-gray-400 font-medium">プレイヤー</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ゲーム/トーナメント</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ポットサイズ</th>
                        <th className="text-left p-4 text-gray-400 font-medium">収益</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ステータス</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                          <td className="p-4">
                            <p className="text-white text-sm">
                              {tx.createdAt.toLocaleDateString('ja-JP')}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {tx.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTransactionTypeColor(tx.type)}`}>
                              {getTransactionTypeLabel(tx.type)}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-white font-semibold">{tx.playerName}</p>
                            <p className="text-gray-400 text-xs">{tx.playerId}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-white text-sm">{tx.gameId}</p>
                            {tx.tableId && <p className="text-gray-400 text-xs">テーブル: {tx.tableId}</p>}
                            {tx.tournamentId && <p className="text-gray-400 text-xs">トーナメント: {tx.tournamentId}</p>}
                          </td>
                          <td className="p-4">
                            <p className="text-white font-semibold">¥{tx.originalPot.toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">
                              {tx.type === 'rake' ? `${(tx.rakePercentage * 100).toFixed(1)}%` : 
                               tx.feePercentage ? `${(tx.feePercentage * 100).toFixed(1)}%` : ''}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="text-green-400 font-bold">¥{tx.amount.toLocaleString()}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tx.status === 'processed' ? 'bg-green-500/20 text-green-400' :
                              tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.status === 'processed' ? '処理済み' :
                               tx.status === 'pending' ? '処理中' : '失敗'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* モバイル表示 */}
                <div className="lg:hidden">
                  <div className="space-y-4 p-6">
                    {filteredTransactions.map((tx) => (
                      <div key={tx.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTransactionTypeColor(tx.type)}`}>
                              {getTransactionTypeLabel(tx.type)}
                            </span>
                            <p className="text-white font-semibold mt-2">{tx.playerName}</p>
                            <p className="text-gray-400 text-sm">{tx.gameId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold">¥{tx.amount.toLocaleString()}</p>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tx.status === 'processed' ? 'bg-green-500/20 text-green-400' :
                              tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.status === 'processed' ? '処理済み' :
                               tx.status === 'pending' ? '処理中' : '失敗'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">ポットサイズ</p>
                            <p className="text-white">¥{tx.originalPot.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">手数料率</p>
                            <p className="text-white">
                              {tx.type === 'rake' ? `${(tx.rakePercentage * 100).toFixed(1)}%` : 
                               tx.feePercentage ? `${(tx.feePercentage * 100).toFixed(1)}%` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-xs">
                            {tx.createdAt.toLocaleDateString('ja-JP')} {tx.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RevenueManagementPage() {
  return (
    <AdminProtectedRoute requiredPermission="revenue.view">
      <RevenueManagementContent />
    </AdminProtectedRoute>
  );
}