'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  Trophy, 
  Calendar,
  Users,
  DollarSign,
  Save,
  AlertCircle
} from 'lucide-react';

function CreateTournamentContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'sit-n-go' as 'sit-n-go' | 'scheduled' | 'bounty',
    buyIn: 1000,
    maxPlayers: 100,
    startTime: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!adminUser) {
        throw new Error('Admin認証が必要です');
      }

      if (formData.maxPlayers < 2 || formData.maxPlayers > 1000) {
        throw new Error('最大プレイヤー数は2～1000人の範囲で設定してください');
      }

      if (formData.buyIn < 10) {
        throw new Error('バイインは10チップ以上に設定してください');
      }

      const token = sessionStorage.getItem('admin_token');
      
      // データベースに保存するためにAPIにPOSTリクエスト
      const response = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          buyIn: formData.buyIn,
          maxPlayers: formData.maxPlayers,
          description: formData.description || '',
          startTime: formData.startTime || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'トーナメントの作成に失敗しました');
      }

      console.log('Tournament created:', data.tournament);
      router.push('/admin/tournaments');
    } catch (err: any) {
      setError(err.message || 'トーナメントの作成に失敗しました');
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
              onClick={() => router.push('/admin/tournaments')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">トーナメント作成</h1>
                <p className="text-gray-400 text-sm">新しいトーナメントを作成します</p>
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

              {/* トーナメント名 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  トーナメント名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="例: 週末メインイベント"
                />
              </div>

              {/* トーナメントタイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  トーナメントタイプ *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'sit-n-go')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.type === 'sit-n-go'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Trophy className="w-6 h-6 mx-auto mb-1" />
                    <div className="font-semibold text-sm">シット&ゴー</div>
                    <div className="text-xs opacity-75">満席で開始</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'scheduled')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.type === 'scheduled'
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Calendar className="w-6 h-6 mx-auto mb-1" />
                    <div className="font-semibold text-sm">スケジュール</div>
                    <div className="text-xs opacity-75">時刻指定</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'bounty')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.type === 'bounty'
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <DollarSign className="w-6 h-6 mx-auto mb-1" />
                    <div className="font-semibold text-sm">バウンティ</div>
                    <div className="text-xs opacity-75">賞金あり</div>
                  </button>
                </div>
              </div>

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
                    min="1"
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* 最大参加者数 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  最大参加者数 *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="number"
                    value={formData.maxPlayers}
                    onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value) || 0)}
                    required
                    min="2"
                    max="1000"
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* 開始時刻（スケジュールタイプの場合のみ） */}
              {formData.type === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    開始時刻
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                  placeholder="トーナメントの詳細説明（任意）"
                />
              </div>

              {/* ボタン */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={() => router.push('/admin/tournaments')}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-500 hover:from-yellow-700 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>トーナメントを作成</span>
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

export default function CreateTournamentPage() {
  return (
    <AdminProtectedRoute>
      <CreateTournamentContent />
    </AdminProtectedRoute>
  );
}
