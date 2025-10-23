'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { useTournamentStore } from '@/store/useTournamentStore';
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
  const { addTournament } = useTournamentStore();
  
  const [formData, setFormData] = useState({
    name: '',
    buyIn: 1000,
    maxPlayers: 50,
    prize: 45000,
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

      const startTime = new Date(formData.startTime);
      if (startTime <= new Date()) {
        throw new Error('開始時刻は現在時刻より後に設定してください');
      }

      // データベースに保存するためにAPIにPOSTリクエスト
      const response = await fetch('/api/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: 'tournament',
          buyIn: formData.buyIn,
          maxPlayers: formData.maxPlayers,
          description: formData.description || '',
          startTime: startTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'トーナメントの作成に失敗しました');
      }

      const data = await response.json();
      console.log('Tournament created:', data);

      // Zustand storeにも追加（LocalStorage用）
      addTournament({
        ...data.tournament,
        prize: data.tournament.prizePool || formData.prize,
        status: 'registering',
        createdBy: adminUser.username,
        createdById: adminUser.id,
        type: 'tournament',
      });

      router.push('/admin/dashboard');
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
              onClick={() => router.push('/admin/dashboard')}
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

              {/* バイイン */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  バイイン（チップ） *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.buyIn}
                    onChange={(e) => handleInputChange('buyIn', parseInt(e.target.value) || 0)}
                    required
                    min="1"
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="1000"
                  />
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* 最大参加者数 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  最大参加者数 *
                </label>
                <div className="relative">
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
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* 賞金総額 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  賞金総額（チップ） *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.prize}
                    onChange={(e) => handleInputChange('prize', parseInt(e.target.value) || 0)}
                    required
                    min="1"
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="45000"
                  />
                  <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  通常は (バイイン × 最大参加者数 × 0.9) を設定
                </p>
              </div>

              {/* 開始時刻 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  開始時刻 *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  />
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                  placeholder="トーナメントの詳細説明（任意）"
                />
              </div>

              {/* ボタン */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={() => router.push('/admin/dashboard')}
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
    <AdminProtectedRoute requiredPermission="tournament.create">
      <CreateTournamentContent />
    </AdminProtectedRoute>
  );
}
