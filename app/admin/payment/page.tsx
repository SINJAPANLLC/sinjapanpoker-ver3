'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Bitcoin,
  Calendar,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

function PaymentContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // ダミーの決済データ
  const payments = [
    {
      id: 'PAY-001',
      type: 'deposit',
      user: 'user123',
      amount: 10000,
      method: 'credit_card',
      status: 'completed',
      date: '2025-10-22 18:30:00',
    },
    {
      id: 'PAY-002',
      type: 'withdrawal',
      user: 'user456',
      amount: 5000,
      method: 'bank_transfer',
      status: 'pending',
      date: '2025-10-22 17:15:00',
    },
    {
      id: 'PAY-003',
      type: 'deposit',
      user: 'user789',
      amount: 25000,
      method: 'crypto',
      status: 'completed',
      date: '2025-10-22 16:45:00',
    },
    {
      id: 'PAY-004',
      type: 'withdrawal',
      user: 'user234',
      amount: 15000,
      method: 'bank_transfer',
      status: 'completed',
      date: '2025-10-22 15:20:00',
    },
    {
      id: 'PAY-005',
      type: 'deposit',
      user: 'user567',
      amount: 50000,
      method: 'credit_card',
      status: 'failed',
      date: '2025-10-22 14:10:00',
    },
  ];

  const stats = [
    {
      title: '総入金額',
      value: '¥85,000',
      change: '+12%',
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      color: 'green',
    },
    {
      title: '総出金額',
      value: '¥20,000',
      change: '+5%',
      icon: <TrendingDown className="w-6 h-6 text-red-400" />,
      color: 'red',
    },
    {
      title: '保留中',
      value: '3件',
      change: '1件',
      icon: <Clock className="w-6 h-6 text-yellow-400" />,
      color: 'yellow',
    },
    {
      title: '純利益',
      value: '¥65,000',
      change: '+18%',
      icon: <DollarSign className="w-6 h-6 text-blue-400" />,
      color: 'blue',
    },
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesTab = activeTab === 'all' || payment.type === activeTab.replace('s', '');
    const matchesSearch = payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels = {
      completed: '完了',
      pending: '保留中',
      failed: '失敗',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'crypto':
        return <Bitcoin className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      credit_card: 'クレジットカード',
      bank_transfer: '銀行振込',
      crypto: '仮想通貨',
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">決済ページ</h1>
                <p className="text-gray-400 text-sm">入出金・決済履歴の管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-500/20 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className={`text-sm font-semibold text-${stat.color}-400`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* フィルターとタブ */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* タブ */}
              <div className="flex space-x-2 bg-gray-700/30 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'all'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setActiveTab('deposits')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'deposits'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  入金
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'withdrawals'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  出金
                </button>
              </div>

              {/* 検索とアクション */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ユーザーID・取引IDで検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 決済履歴テーブル */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">取引ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">種類</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">ユーザー</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">金額</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">決済方法</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">ステータス</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">日時</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-mono text-sm">{payment.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {payment.type === 'deposit' ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">入金</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-medium">出金</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white">{payment.user}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-semibold">
                        ¥{payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-gray-300">
                        {getMethodIcon(payment.method)}
                        <span>{getMethodLabel(payment.method)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{payment.date}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">該当する決済履歴がありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPaymentPage() {
  return (
    <AdminProtectedRoute>
      <PaymentContent />
    </AdminProtectedRoute>
  );
}
