'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  DollarSign, 
  CreditCard,
  Banknote,
  Bitcoin,
  Settings,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface RealMoneySettings {
  id: string;
  name: string;
  enabled: boolean;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  feePercentage: number;
  processingTime: string;
  description: string;
  icon: string;
}

interface Transaction {
  id: string;
  userId: string;
  username: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'crypto' | 'paypal';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  processedAt?: Date;
  fee: number;
  netAmount: number;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: 'bank_transfer' | 'credit_card' | 'crypto' | 'paypal';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  reason?: string;
  adminNotes?: string;
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

function RealMoneyManagementContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [settings, setSettings] = useState<RealMoneySettings[]>([
    {
      id: 'credit_card',
      name: 'クレジットカード',
      enabled: true,
      minDeposit: 1000,
      maxDeposit: 1000000,
      minWithdrawal: 5000,
      maxWithdrawal: 500000,
      feePercentage: 3.5,
      processingTime: '即座',
      description: 'Visa, Mastercard, JCB対応',
      icon: '💳'
    },
    {
      id: 'bank_transfer',
      name: '銀行振込',
      enabled: true,
      minDeposit: 10000,
      maxDeposit: 5000000,
      minWithdrawal: 10000,
      maxWithdrawal: 1000000,
      feePercentage: 0,
      processingTime: '1-3営業日',
      description: '国内銀行振込',
      icon: '🏦'
    },
    {
      id: 'crypto',
      name: '暗号通貨',
      enabled: false,
      minDeposit: 5000,
      maxDeposit: 10000000,
      minWithdrawal: 5000,
      maxWithdrawal: 2000000,
      feePercentage: 1.0,
      processingTime: '10-30分',
      description: 'Bitcoin, Ethereum対応',
      icon: '₿'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: false,
      minDeposit: 1000,
      maxDeposit: 500000,
      minWithdrawal: 5000,
      maxWithdrawal: 300000,
      feePercentage: 2.9,
      processingTime: '即座',
      description: 'PayPalアカウント連携',
      icon: '📧'
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [withdrawalSearchTerm, setWithdrawalSearchTerm] = useState('');
  const [selectedWithdrawalStatus, setSelectedWithdrawalStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // モック取引データ
    const mockTransactions: Transaction[] = [
      {
        id: 'tx_1',
        userId: 'user_1',
        username: 'Player1',
        type: 'deposit',
        amount: 50000,
        method: 'credit_card',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        fee: 1750,
        netAmount: 48250
      },
      {
        id: 'tx_2',
        userId: 'user_2',
        username: 'Player2',
        type: 'withdrawal',
        amount: 100000,
        method: 'bank_transfer',
        status: 'processing',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        fee: 0,
        netAmount: 100000
      },
      {
        id: 'tx_3',
        userId: 'user_3',
        username: 'Player3',
        type: 'deposit',
        amount: 25000,
        method: 'credit_card',
        status: 'pending',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        fee: 875,
        netAmount: 24125
      },
      {
        id: 'tx_4',
        userId: 'user_4',
        username: 'Player4',
        type: 'withdrawal',
        amount: 75000,
        method: 'bank_transfer',
        status: 'completed',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        fee: 0,
        netAmount: 75000
      }
    ];
    
    // モック出金申請データ
    const mockWithdrawalRequests: WithdrawalRequest[] = [
      {
        id: 'wd_1',
        userId: 'user_1',
        username: 'Player1',
        amount: 50000,
        method: 'bank_transfer',
        bankAccount: {
          bankName: '三菱UFJ銀行',
          accountNumber: '****1234',
          accountHolder: 'タナカ タロウ'
        },
        status: 'pending',
        reason: '生活費のため',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'wd_2',
        userId: 'user_2',
        username: 'Player2',
        amount: 100000,
        method: 'credit_card',
        status: 'approved',
        reason: '緊急の支払い',
        adminNotes: '本人確認完了',
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        processedBy: 'admin1'
      },
      {
        id: 'wd_3',
        userId: 'user_3',
        username: 'Player3',
        amount: 25000,
        method: 'bank_transfer',
        bankAccount: {
          bankName: 'みずほ銀行',
          accountNumber: '****5678',
          accountHolder: 'ヤマダ ハナコ'
        },
        status: 'processing',
        reason: '投資のため',
        adminNotes: '処理中',
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 30 * 60 * 1000),
        processedBy: 'admin1'
      },
      {
        id: 'wd_4',
        userId: 'user_4',
        username: 'Player4',
        amount: 150000,
        method: 'crypto',
        status: 'rejected',
        reason: '大口出金のため',
        adminNotes: '本人確認書類不備',
        submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        processedBy: 'admin2'
      }
    ];
    
    setTransactions(mockTransactions);
    setWithdrawalRequests(mockWithdrawalRequests);
    setLoading(false);
  }, []);

  const handleToggleMethod = async (methodId: string) => {
    try {
      setSettings(prev => prev.map(setting => 
        setting.id === methodId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      ));
      
      setMessage('設定が更新されました');
      setMessageType('success');
    } catch (error) {
      setMessage('設定の更新に失敗しました');
      setMessageType('error');
    }
  };

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject' | 'cancel') => {
    try {
      // 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)); // モック遅延
      
      let newStatus: Transaction['status'];
      switch (action) {
        case 'approve':
          newStatus = 'completed';
          break;
        case 'reject':
          newStatus = 'failed';
          break;
        case 'cancel':
          newStatus = 'cancelled';
          break;
      }
      
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId 
          ? { 
              ...tx, 
              status: newStatus,
              processedAt: newStatus === 'completed' ? new Date() : undefined
            }
          : tx
      ));
      
      setMessage(`取引が${action === 'approve' ? '承認' : action === 'reject' ? '拒否' : 'キャンセル'}されました`);
      setMessageType('success');
    } catch (error) {
      setMessage('操作に失敗しました');
      setMessageType('error');
    }
  };

  const handleWithdrawalAction = async (requestId: string, action: 'approve' | 'reject' | 'process') => {
    try {
      setWithdrawalLoading(true);
      
      // 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)); // モック遅延
      
      let newStatus: WithdrawalRequest['status'];
      switch (action) {
        case 'approve':
          newStatus = 'approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'process':
          newStatus = 'processing';
          break;
      }
      
      setWithdrawalRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: newStatus,
              processedAt: new Date(),
              processedBy: adminUser?.username || 'admin'
            }
          : req
      ));
      
      setMessage(`出金申請が${action === 'approve' ? '承認' : action === 'reject' ? '拒否' : '処理開始'}されました`);
      setMessageType('success');
    } catch (error) {
      setMessage('操作に失敗しました');
      setMessageType('error');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const loadWithdrawalRequests = async () => {
    try {
      setWithdrawalLoading(true);
      // 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 500));
      // データは既にuseEffectでロード済み
    } catch (error) {
      setMessage('出金申請の読み込みに失敗しました');
      setMessageType('error');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const filteredWithdrawalRequests = withdrawalRequests.filter(request => {
    const matchesSearch = request.username.toLowerCase().includes(withdrawalSearchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(withdrawalSearchTerm.toLowerCase());
    const matchesStatus = selectedWithdrawalStatus === 'all' || request.status === selectedWithdrawalStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">待機中</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium animate-pulse">処理中</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">完了</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">失敗</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">キャンセル</span>;
    }
  };

  const getWithdrawalStatusBadge = (status: WithdrawalRequest['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">審査中</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">承認済み</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">却下</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium animate-pulse">処理中</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">完了</span>;
    }
  };

  const getMethodIcon = (method: Transaction['method']) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      case 'bank_transfer':
        return <Banknote className="w-4 h-4 text-green-400" />;
      case 'crypto':
        return <Bitcoin className="w-4 h-4 text-orange-400" />;
      case 'paypal':
        return <DollarSign className="w-4 h-4 text-purple-400" />;
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    return type === 'deposit' 
      ? <TrendingUp className="w-4 h-4 text-green-400" />
      : <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const totalDeposits = transactions
    .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawals = transactions
    .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalFees = transactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.fee, 0);

  const pendingTransactions = transactions.filter(tx => 
    tx.status === 'pending' || tx.status === 'processing'
  ).length;

  const pendingWithdrawals = withdrawalRequests.filter(req => req.status === 'pending').length;
  const totalWithdrawalRequests = withdrawalRequests.length;

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
                <h1 className="text-2xl font-bold text-white">リアルマネー管理</h1>
                <p className="text-gray-400 text-sm">入出金と決済方法の管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            messageType === 'success' 
              ? 'bg-green-500/10 border border-green-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className={messageType === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message}
            </span>
          </div>
        )}

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-semibold">+¥{totalDeposits.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総入金</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {transactions.filter(tx => tx.type === 'deposit' && tx.status === 'completed').length}件
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-red-500/20 rounded-lg">
                <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
              </div>
              <div className="text-right">
                <p className="text-red-400 text-sm font-semibold">-¥{totalWithdrawals.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総出金</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {transactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'completed').length}件
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-yellow-400 text-sm font-semibold">¥{totalFees.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総手数料収益</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {transactions.filter(tx => tx.status === 'completed' && tx.fee > 0).length}件
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-blue-400 text-sm font-semibold">{pendingTransactions}件</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">処理待ち</p>
              <p className="text-white text-lg md:text-xl font-bold">取引</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-orange-500/20 rounded-lg">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
              </div>
              <div className="text-right">
                <p className="text-orange-400 text-sm font-semibold">{totalWithdrawalRequests}件</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">出金申請</p>
              <p className="text-white text-lg md:text-xl font-bold">総数</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-purple-400 text-sm font-semibold">{pendingWithdrawals}件</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">審査待ち</p>
              <p className="text-white text-lg md:text-xl font-bold">出金申請</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 決済方法設定 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <span>決済方法設定</span>
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {settings.map((setting) => (
                  <div key={setting.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{setting.icon}</span>
                        <div>
                          <h3 className="text-white font-semibold">{setting.name}</h3>
                          <p className="text-gray-400 text-sm">{setting.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleMethod(setting.id)}
                        className={`flex items-center space-x-2 ${
                          setting.enabled ? 'text-green-400' : 'text-gray-400'
                        }`}
                      >
                        {setting.enabled ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                        <span className="text-sm font-medium">
                          {setting.enabled ? '有効' : '無効'}
                        </span>
                      </button>
                    </div>
                    
                    {setting.enabled && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1">入金制限</p>
                          <p className="text-white">¥{setting.minDeposit.toLocaleString()} - ¥{setting.maxDeposit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">出金制限</p>
                          <p className="text-white">¥{setting.minWithdrawal.toLocaleString()} - ¥{setting.maxWithdrawal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">手数料</p>
                          <p className="text-white">{setting.feePercentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1">処理時間</p>
                          <p className="text-white">{setting.processingTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 取引履歴 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-400" />
                <span>取引履歴</span>
              </h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(tx.type)}
                          <div>
                            <h3 className="text-white font-semibold">{tx.username}</h3>
                            <p className="text-gray-400 text-sm">
                              {tx.type === 'deposit' ? '入金' : '出金'} - ¥{tx.amount.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {tx.createdAt.toLocaleDateString('ja-JP')} {tx.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(tx.status)}
                          <div className="flex items-center space-x-1 mt-2">
                            {getMethodIcon(tx.method)}
                            <span className="text-gray-400 text-xs">
                              {tx.method === 'credit_card' ? 'クレジットカード' :
                               tx.method === 'bank_transfer' ? '銀行振込' :
                               tx.method === 'crypto' ? '暗号通貨' : 'PayPal'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {tx.fee > 0 && (
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-400">手数料</p>
                            <p className="text-yellow-400">¥{tx.fee.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">実際の金額</p>
                            <p className="text-white">¥{tx.netAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      
                      {(tx.status === 'pending' || tx.status === 'processing') && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTransactionAction(tx.id, 'approve')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleTransactionAction(tx.id, 'reject')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            拒否
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 出金申請管理 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <span>出金申請管理</span>
                </h2>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={loadWithdrawalRequests}
                    disabled={withdrawalLoading}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${withdrawalLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden md:inline">更新</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* 検索 */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ユーザー名で検索..."
                    value={withdrawalSearchTerm}
                    onChange={(e) => setWithdrawalSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none text-sm"
                  />
                </div>
                
                {/* フィルター */}
                <select
                  value={selectedWithdrawalStatus}
                  onChange={(e) => setSelectedWithdrawalStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="pending">審査中</option>
                  <option value="approved">承認済み</option>
                  <option value="processing">処理中</option>
                  <option value="completed">完了</option>
                  <option value="rejected">却下</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              {/* 出金申請テーブル */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">申請ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">ユーザー</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">金額</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">方法</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">ステータス</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">申請日</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawalRequests.map((request, index) => (
                      <tr key={request.id} className="border-b border-gray-800/50 hover:bg-gray-700/20 transition-colors">
                        <td className="py-3 px-4 text-white font-mono text-xs">{request.id.slice(-8)}</td>
                        <td className="py-3 px-4 text-white text-sm">{request.username}</td>
                        <td className="py-3 px-4 text-white text-sm font-semibold">¥{request.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(request.method)}
                            <span>
                              {request.method === 'bank_transfer' ? '銀行振込' :
                               request.method === 'credit_card' ? 'クレジットカード' :
                               request.method === 'crypto' ? '暗号通貨' : 'PayPal'}
                            </span>
                          </div>
                          {request.bankAccount && (
                            <div className="text-xs text-gray-500 mt-1">
                              {request.bankAccount.bankName} {request.bankAccount.accountNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getWithdrawalStatusBadge(request.status)}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {request.submittedAt.toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleWithdrawalAction(request.id, 'approve')}
                                  className="p-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded transition-colors"
                                  title="承認"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleWithdrawalAction(request.id, 'reject')}
                                  className="p-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                                  title="却下"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <button
                                onClick={() => handleWithdrawalAction(request.id, 'process')}
                                className="p-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
                                title="処理開始"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                // 詳細モーダルを表示（実装予定）
                                console.log('View withdrawal details:', request);
                              }}
                              className="p-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded transition-colors"
                              title="詳細"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredWithdrawalRequests.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold text-white mb-2">出金申請がありません</h3>
                    <p className="text-gray-400">該当する出金申請が見つかりませんでした</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealMoneyManagementPage() {
  return (
    <AdminProtectedRoute requiredPermission="realmoney.manage">
      <RealMoneyManagementContent />
    </AdminProtectedRoute>
  );
}
