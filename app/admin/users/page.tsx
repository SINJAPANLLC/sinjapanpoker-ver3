'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  Users, 
  Search,
  Filter,
  Ban,
  Unlock,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'banned' | 'suspended';
  role: 'user' | 'vip' | 'admin';
  realChips: number;
  gameChips: number;
  diamonds: number;
  energy: number;
  points: number;
  level: number;
  joinDate: Date;
  lastLogin: Date;
  gamesPlayed: number;
  totalWinnings: number;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  kycSubmittedAt?: Date;
  kycApprovedAt?: Date;
  kycRejectedAt?: Date;
  kycDocuments: {
    id: string;
    type: 'id_card' | 'passport' | 'driver_license' | 'utility_bill' | 'bank_statement';
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: Date;
    url: string;
  }[];
  realMoneyEnabled: boolean;
}

function UserManagementContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'vip' | 'admin'>('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'not_submitted'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        const formattedUsers: User[] = data.users.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email || `${u.username}@example.com`,
          status: 'active' as const,
          role: u.username === 'admin' ? 'admin' as const : 'user' as const,
          realChips: u.realChips || 0,
          gameChips: u.gameChips || u.chips || 0,
          diamonds: 0,
          energy: u.experience || 0,
          points: 0,
          level: u.level || 1,
          joinDate: new Date(u.createdAt || Date.now()),
          lastLogin: new Date(u.lastLogin || Date.now()),
          gamesPlayed: u.gamesPlayed || 0,
          totalWinnings: u.totalWinnings || 0,
          kycStatus: 'not_submitted' as const,
          kycDocuments: [],
          realMoneyEnabled: (u.realChips || 0) > 0,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesKyc = kycFilter === 'all' || user.kycStatus === kycFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesKyc;
  });

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'suspend' | 'delete') => {
    try {
      // 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)); // モック遅延
      
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'ban':
              return { ...user, status: 'banned' as const };
            case 'unban':
              return { ...user, status: 'active' as const };
            case 'suspend':
              return { ...user, status: 'suspended' as const };
            default:
              return user;
          }
        }
        return user;
      }));

      if (action === 'delete') {
        setUsers(prev => prev.filter(user => user.id !== userId));
      }

      setMessage(`${action}操作が完了しました`);
      setMessageType('success');
    } catch (error) {
      setMessage('操作に失敗しました');
      setMessageType('error');
    }
  };

  const handleKycAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      // 実際のAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)); // モック遅延
      
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          const now = new Date();
          return {
            ...user,
            kycStatus: action === 'approve' ? 'approved' as const : 'rejected' as const,
            kycApprovedAt: action === 'approve' ? now : undefined,
            kycRejectedAt: action === 'reject' ? now : undefined,
            realMoneyEnabled: action === 'approve' ? true : false
          };
        }
        return user;
      }));

      setMessage(`KYCが${action === 'approve' ? '承認' : '拒否'}されました`);
      setMessageType('success');
    } catch (error) {
      setMessage('KYC操作に失敗しました');
      setMessageType('error');
    }
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">アクティブ</span>;
      case 'banned':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">BAN</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">停止中</span>;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'user':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">ユーザー</span>;
      case 'vip':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">VIP</span>;
      case 'admin':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">ADMIN</span>;
    }
  };

  const getKycBadge = (kycStatus: User['kycStatus']) => {
    switch (kycStatus) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium animate-pulse">KYC待機中</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">KYC承認済み</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">KYC拒否</span>;
      case 'not_submitted':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">未提出</span>;
    }
  };

  const getDocumentTypeLabel = (type: User['kycDocuments'][0]['type']) => {
    switch (type) {
      case 'id_card':
        return '身分証明書';
      case 'passport':
        return 'パスポート';
      case 'driver_license':
        return '運転免許証';
      case 'utility_bill':
        return '公共料金請求書';
      case 'bank_statement':
        return '銀行明細書';
      default:
        return type;
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ユーザー管理</h1>
                <p className="text-gray-400 text-sm">ユーザーの管理と操作</p>
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

        {/* フィルターと検索 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* 検索 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">検索</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="ユーザー名またはメールアドレス"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* ステータスフィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ステータス</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">すべて</option>
                  <option value="active">アクティブ</option>
                  <option value="banned">BAN</option>
                  <option value="suspended">停止中</option>
                </select>
              </div>

              {/* ロールフィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ロール</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">すべて</option>
                  <option value="user">ユーザー</option>
                  <option value="vip">VIP</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>

              {/* KYCフィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">KYC</label>
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">すべて</option>
                  <option value="pending">KYC待機中</option>
                  <option value="approved">KYC承認済み</option>
                  <option value="rejected">KYC拒否</option>
                  <option value="not_submitted">未提出</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ユーザー一覧 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">ユーザー一覧</h2>
              <span className="text-gray-400 text-sm">{filteredUsers.length}件</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="min-w-full">
                {/* デスクトップ表示 */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="text-left p-4 text-gray-400 font-medium">ユーザー</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ステータス</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ロール</th>
                        <th className="text-left p-4 text-gray-400 font-medium">通貨</th>
                        <th className="text-left p-4 text-gray-400 font-medium">KYC</th>
                        <th className="text-left p-4 text-gray-400 font-medium">統計</th>
                        <th className="text-left p-4 text-gray-400 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                          <td className="p-4">
                            <div>
                              <h3 className="text-white font-semibold">{user.username}</h3>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                              <p className="text-gray-500 text-xs">Lv.{user.level}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="p-4">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <p className="text-green-400">{user.realChips.toLocaleString()}チップ</p>
                              <p className="text-blue-400">{user.diamonds}ダイヤ</p>
                              <p className="text-yellow-400">{user.energy}エネルギー</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              {getKycBadge(user.kycStatus)}
                              {user.kycStatus === 'pending' && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <button
                                    onClick={() => handleKycAction(user.id, 'approve')}
                                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                                  >
                                    承認
                                  </button>
                                  <button
                                    onClick={() => handleKycAction(user.id, 'reject')}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                                  >
                                    拒否
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <p className="text-white">{user.gamesPlayed}ゲーム</p>
                              <p className="text-green-400">+{user.totalWinnings.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                                title="詳細表示"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {user.status === 'active' ? (
                                <button
                                  onClick={() => handleUserAction(user.id, 'ban')}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                                  title="BAN"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user.id, 'unban')}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                                  title="BAN解除"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleUserAction(user.id, 'delete')}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                                title="削除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* モバイル表示 */}
                <div className="lg:hidden">
                  <div className="space-y-4 p-6">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{user.username}</h3>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                          <div className="flex space-x-2">
                            {getStatusBadge(user.status)}
                            {getRoleBadge(user.role)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <p className="text-gray-400">通貨</p>
                            <p className="text-green-400">{user.realChips.toLocaleString()}チップ</p>
                            <p className="text-blue-400">{user.diamonds}ダイヤ</p>
                          </div>
                          <div>
                            <p className="text-gray-400">統計</p>
                            <p className="text-white">{user.gamesPlayed}ゲーム</p>
                            <p className="text-green-400">+{user.totalWinnings.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'ban')}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'unban')}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ユーザー詳細モーダル */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">ユーザー詳細</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">ユーザー名</p>
                        <p className="text-white">{selectedUser.username}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">メールアドレス</p>
                        <p className="text-white">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">レベル</p>
                        <p className="text-white">Lv.{selectedUser.level}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">参加日</p>
                        <p className="text-white">{selectedUser.joinDate.toLocaleDateString('ja-JP')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">最終ログイン</p>
                        <p className="text-white">{selectedUser.lastLogin.toLocaleString('ja-JP')}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">通貨・統計</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-sm">リアルチップ</p>
                        <p className="text-green-400">{selectedUser.realChips.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">ゲームチップ</p>
                        <p className="text-blue-400">{selectedUser.gameChips.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">ダイヤモンド</p>
                        <p className="text-purple-400">{selectedUser.diamonds}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">ゲーム数</p>
                        <p className="text-white">{selectedUser.gamesPlayed}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">総獲得金額</p>
                        <p className="text-green-400">{selectedUser.totalWinnings.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* KYC情報 */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">KYC情報</h3>
                    <div className="flex items-center space-x-2">
                      {getKycBadge(selectedUser.kycStatus)}
                      {selectedUser.kycStatus === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleKycAction(selectedUser.id, 'approve')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleKycAction(selectedUser.id, 'reject')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            拒否
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedUser.kycDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser.kycDocuments.map((doc) => (
                        <div key={doc.id} className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">{getDocumentTypeLabel(doc.type)}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              doc.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              doc.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {doc.status === 'approved' ? '承認済み' :
                               doc.status === 'rejected' ? '拒否' : '審査中'}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-400">
                              アップロード日: {doc.uploadedAt.toLocaleDateString('ja-JP')}
                            </p>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => window.open(doc.url, '_blank')}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                              >
                                表示
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">KYCドキュメントが提出されていません</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <AdminProtectedRoute requiredPermission="user.manage">
      <UserManagementContent />
    </AdminProtectedRoute>
  );
}