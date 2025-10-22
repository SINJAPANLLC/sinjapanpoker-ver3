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
  Link as LinkIcon,
  Copy,
  X,
  Send,
} from 'lucide-react';

function PaymentContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentLinkForm, setPaymentLinkForm] = useState({
    userId: '',
    amount: '',
    description: '',
  });
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGeneratePaymentLink = async () => {
    if (!paymentLinkForm.userId || !paymentLinkForm.amount) {
      alert('ユーザーIDと金額を入力してください');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/stripe/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: paymentLinkForm.userId,
          amount: parseInt(paymentLinkForm.amount),
          description: paymentLinkForm.description || 'チップ購入',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedLink(data.url);
      } else {
        alert('決済リンクの生成に失敗しました: ' + data.error);
      }
    } catch (error) {
      console.error('Payment link generation error:', error);
      alert('決済リンクの生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('リンクをコピーしました！');
  };

  const handleResetForm = () => {
    setPaymentLinkForm({
      userId: '',
      amount: '',
      description: '',
    });
    setGeneratedLink('');
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
            
            <button
              onClick={() => setShowPaymentLinkModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all"
            >
              <LinkIcon className="w-5 h-5" />
              <span>決済リンク作成</span>
            </button>
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

      {/* 決済リンク作成モーダル */}
      {showPaymentLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-lg w-full border border-gray-700">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <LinkIcon className="text-cyan-400" />
                  <span>決済リンク作成</span>
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentLinkModal(false);
                    handleResetForm();
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-6">
              {!generatedLink ? (
                <>
                  {/* フォーム */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">ユーザーID</label>
                      <input
                        type="text"
                        value={paymentLinkForm.userId}
                        onChange={(e) => setPaymentLinkForm({...paymentLinkForm, userId: e.target.value})}
                        placeholder="user123"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">金額（円）</label>
                      <input
                        type="number"
                        value={paymentLinkForm.amount}
                        onChange={(e) => setPaymentLinkForm({...paymentLinkForm, amount: e.target.value})}
                        placeholder="10000"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
                        min="100"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">説明（オプション）</label>
                      <input
                        type="text"
                        value={paymentLinkForm.description}
                        onChange={(e) => setPaymentLinkForm({...paymentLinkForm, description: e.target.value})}
                        placeholder="チップ購入"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 生成ボタン */}
                  <button
                    onClick={handleGeneratePaymentLink}
                    disabled={isGenerating}
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>決済リンクを生成</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* 生成されたリンク */}
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-400 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">決済リンクを生成しました！</span>
                      </div>
                      <p className="text-gray-300 text-sm">このリンクをユーザーに送信してください。</p>
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2">決済リンク</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={generatedLink}
                          readOnly
                          className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => window.open(generatedLink, '_blank')}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                      >
                        リンクを開く
                      </button>
                      <button
                        onClick={() => {
                          handleResetForm();
                        }}
                        className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                      >
                        新しく作成
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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
