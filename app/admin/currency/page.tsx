'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  Coins, 
  Zap,
  Gem,
  Gift,
  User,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  realChips: number;
  gameChips: number;
  diamonds: number;
  energy: number;
  points: number;
}

function CurrencyManagementContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  const [currencyForm, setCurrencyForm] = useState({
    realChips: 0,
    gameChips: 0,
    diamonds: 0,
    energy: 0,
    points: 0,
    reason: ''
  });

  useEffect(() => {
    // 実際のユーザーデータを取得
    const fetchUsers = async () => {
      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
          // APIレスポンスをUser型に変換
          const mappedUsers: User[] = data.users.map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            realChips: u.realChips || 0,
            gameChips: u.gameChips || 0,
            diamonds: 0,
            energy: 0,
            points: 0,
          }));
          setUsers(mappedUsers);
        } else {
          console.error('ユーザー取得エラー:', data.error);
        }
      } catch (error) {
        console.error('ユーザー取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setCurrencyForm({
      realChips: 0,
      gameChips: 0,
      diamonds: 0,
      energy: 0,
      points: 0,
      reason: ''
    });
    setMessage('');
  };

  const handleCurrencyChange = (type: keyof typeof currencyForm, value: number | string) => {
    setCurrencyForm(prev => ({ ...prev, [type]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !currencyForm.reason.trim()) return;

    setSaving(true);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
      
      // 実際のチップ付与API呼び出し
      const response = await fetch('/api/admin/grant-currency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          chips: currencyForm.realChips,
          reason: currencyForm.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ユーザーの通貨を更新
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? {
                ...user,
                realChips: data.user.chips,
              }
            : user
        ));

        setSelectedUser(prev => prev ? {
          ...prev,
          realChips: data.user.chips,
        } : null);

        setMessage(data.message || '通貨の付与が完了しました');
        setMessageType('success');
        
        // フォームをリセット
        setCurrencyForm({
          realChips: 0,
          gameChips: 0,
          diamonds: 0,
          energy: 0,
          points: 0,
          reason: ''
        });
      } else {
        setMessage(data.error || '通貨の付与に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('チップ付与エラー:', error);
      setMessage('通貨の付与に失敗しました');
      setMessageType('error');
    } finally {
      setSaving(false);
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
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">通貨管理</h1>
                <p className="text-gray-400 text-sm">ユーザーへの通貨付与</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ユーザー一覧 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-400" />
                <span>ユーザー一覧</span>
              </h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedUser?.id === user.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">{user.username}</h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">
                            {(user.realChips || 0).toLocaleString()}リアルチップ
                          </p>
                          <p className="text-blue-400 text-sm">
                            {(user.gameChips || 0).toLocaleString()}ゲームチップ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 通貨付与フォーム */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Gift className="w-5 h-5 text-green-400" />
                <span>通貨付与</span>
              </h2>
            </div>
            
            <div className="p-6">
              {selectedUser ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message && (
                    <div className={`p-4 rounded-lg flex items-center space-x-3 ${
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

                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">選択中のユーザー</h3>
                    <p className="text-blue-400">{selectedUser.username} ({selectedUser.email})</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        リアルチップ
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={currencyForm.realChips}
                          onChange={(e) => handleCurrencyChange('realChips', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ゲームチップ
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={currencyForm.gameChips}
                          onChange={(e) => handleCurrencyChange('gameChips', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ダイヤモンド
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={currencyForm.diamonds}
                          onChange={(e) => handleCurrencyChange('diamonds', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                        <Gem className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        エネルギー
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={currencyForm.energy}
                          onChange={(e) => handleCurrencyChange('energy', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      付与理由 *
                    </label>
                    <textarea
                      value={currencyForm.reason}
                      onChange={(e) => handleCurrencyChange('reason', e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      placeholder="通貨付与の理由を入力してください"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !currencyForm.reason.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>付与中...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>通貨を付与</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">ユーザーを選択してください</p>
                  <p className="text-gray-500 text-sm">左側のリストからユーザーを選択して通貨を付与できます</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CurrencyManagementPage() {
  return (
    <AdminProtectedRoute requiredPermission="currency.manage">
      <CurrencyManagementContent />
    </AdminProtectedRoute>
  );
}