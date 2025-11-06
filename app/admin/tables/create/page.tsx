'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  Gamepad2, 
  Users,
  DollarSign,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

function CreateTableContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as 'cash' | 'sit-and-go',
    buyIn: 1000,
    maxPlayers: 9,
    smallBlind: 10,
    bigBlind: 20,
    isPrivate: false,
    rakePercentage: 0.05,
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.maxPlayers < 2 || formData.maxPlayers > 9) {
        throw new Error('最大プレイヤー数は2-9人の範囲で設定してください');
      }

      if (formData.bigBlind <= formData.smallBlind) {
        throw new Error('ビッグブラインドはスモールブラインドより大きい値に設定してください');
      }

      const token = sessionStorage.getItem('admin_token');
      
      // APIを使用してテーブルを作成
      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          stakes: `${formData.smallBlind}/${formData.bigBlind}`,
          maxPlayers: formData.maxPlayers,
          rakePercentage: formData.rakePercentage,
          rakeCap: Math.round(formData.buyIn * 0.1),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'テーブルの作成に失敗しました');
      }

      console.log('Table created successfully:', data.table);
      router.push('/admin/tables');
    } catch (err: any) {
      setError(err.message || 'テーブルの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/tables')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">テーブル作成</h1>
                <p className="text-gray-400 text-sm">新しいポーカーテーブルを作成します</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-400">{error}</span>
                </div>
              )}

              {/* テーブル名 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  テーブル名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例: 初心者歓迎テーブル"
                />
              </div>

              {/* テーブルタイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  テーブルタイプ *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'cash')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.type === 'cash'
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mx-auto mb-1" />
                    <div className="font-semibold">キャッシュゲーム</div>
                    <div className="text-xs opacity-75">自由入退場</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'sit-and-go')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.type === 'sit-and-go'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Users className="w-6 h-6 mx-auto mb-1" />
                    <div className="font-semibold">シット&ゴー</div>
                    <div className="text-xs opacity-75">定員制トーナメント</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* バイイン */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    バイイン（チップ） *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      value={formData.buyIn}
                      onChange={(e) => handleInputChange('buyIn', parseInt(e.target.value) || 0)}
                      required
                      min="100"
                      className="w-full px-4 py-3 pl-11 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* 最大プレイヤー数 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    最大プレイヤー数 *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      value={formData.maxPlayers}
                      onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value) || 0)}
                      required
                      min="2"
                      max="10"
                      className="w-full px-4 py-3 pl-11 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="9"
                    />
                  </div>
                  <p className="text-gray-500 text-sm mt-1">2-10人まで設定可能</p>
                </div>
              </div>

              {/* ブラインド設定 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    スモールブラインド *
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      value={formData.smallBlind}
                      onChange={(e) => handleInputChange('smallBlind', parseInt(e.target.value) || 0)}
                      required
                      min="1"
                      className="w-full px-4 py-3 pl-11 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ビッグブラインド *
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      value={formData.bigBlind}
                      onChange={(e) => handleInputChange('bigBlind', parseInt(e.target.value) || 0)}
                      required
                      min="2"
                      className="w-full px-4 py-3 pl-11 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>

              {/* レーキ設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  レーキ率 *
                </label>
                <select
                  value={formData.rakePercentage}
                  onChange={(e) => handleInputChange('rakePercentage', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value={0.03}>3%</option>
                  <option value={0.05}>5% (推奨)</option>
                  <option value={0.07}>7%</option>
                  <option value={0.10}>10%</option>
                </select>
                <p className="text-gray-500 text-sm mt-1">
                  各ハンドのポットから差し引かれる手数料
                </p>
              </div>

              {/* プライベート設定 */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                    className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {formData.isPrivate ? (
                        <EyeOff className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-white font-medium">
                        {formData.isPrivate ? 'プライベートテーブル' : '公開テーブル'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {formData.isPrivate 
                        ? '招待されたユーザーのみ参加可能' 
                        : 'すべてのユーザーが参加可能'}
                    </p>
                  </div>
                </label>
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="テーブルの詳細説明（任意）"
                />
              </div>

              {/* ボタン */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={() => router.push('/admin/tables')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>テーブルを作成</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateTablePage() {
  return (
    <AdminProtectedRoute requiredPermission="table.create">
      <CreateTableContent />
    </AdminProtectedRoute>
  );
}
