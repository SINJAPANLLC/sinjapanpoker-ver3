'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  ArrowLeft, 
  Trophy,
  Plus,
  Play,
  Ban,
  CheckCircle,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  type: 'sit-n-go' | 'scheduled' | 'bounty';
  buyIn: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'registering' | 'in-progress' | 'completed' | 'cancelled';
  startTime: string | null;
  endTime: string | null;
  players: any[];
  createdAt: string;
}

function TournamentManagementContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registering' | 'in-progress' | 'completed' | 'cancelled'>('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [stats, setStats] = useState({ total: 0, registering: 0, inProgress: 0, completed: 0, cancelled: 0, totalPlayers: 0, totalPrizePool: 0 });

  useEffect(() => {
    fetchTournaments();
  }, [statusFilter]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const url = statusFilter === 'all' 
        ? '/api/admin/tournaments' 
        : `/api/admin/tournaments?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTournaments(data.tournaments);
        setStats(data.stats);
      } else {
        setMessage(data.message || 'トーナメント情報の取得に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('トーナメント取得エラー:', error);
      setMessage('トーナメント情報の取得に失敗しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => 
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTournamentAction = async (tournamentId: string, action: 'start' | 'cancel' | 'complete' | 'delete') => {
    try {
      const token = sessionStorage.getItem('admin_token');
      
      if (action === 'delete') {
        if (!confirm('本当にこのトーナメントを削除しますか？')) return;
        
        const response = await fetch(`/api/admin/tournaments?id=${tournamentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || 'トーナメントを削除しました');
          setMessageType('success');
          fetchTournaments();
        } else {
          setMessage(data.message || 'トーナメントの削除に失敗しました');
          setMessageType('error');
        }
      } else {
        const response = await fetch('/api/admin/tournaments', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tournamentId, action }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message);
          setMessageType('success');
          fetchTournaments();
        } else {
          setMessage(data.message || 'トーナメントの更新に失敗しました');
          setMessageType('error');
        }
      }
    } catch (error) {
      console.error('トーナメントアクションエラー:', error);
      setMessage('操作中にエラーが発生しました');
      setMessageType('error');
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'registering':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">登録受付中</span>;
      case 'in-progress':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium animate-pulse">進行中</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">終了</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">キャンセル</span>;
    }
  };

  const getTypeBadge = (type: Tournament['type']) => {
    switch (type) {
      case 'sit-n-go':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">シット&ゴー</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">スケジュール</span>;
      case 'bounty':
        return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">バウンティ</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                  <h1 className="text-2xl font-bold text-white">トーナメント管理</h1>
                  <p className="text-gray-400 text-sm">トーナメントの作成・管理</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/admin/tournaments/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>トーナメント作成</span>
            </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 検索 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">検索</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="トーナメント名"
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="all">すべて</option>
                  <option value="registering">登録受付中</option>
                  <option value="in-progress">進行中</option>
                  <option value="completed">終了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総トーナメント数</p>
              <p className="text-white text-lg md:text-xl font-bold">{stats.total}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総参加者数</p>
              <p className="text-white text-lg md:text-xl font-bold">{stats.totalPlayers}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総賞金額</p>
              <p className="text-white text-lg md:text-xl font-bold">¥{stats.totalPrizePool.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">進行中</p>
              <p className="text-white text-lg md:text-xl font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        {/* トーナメント一覧 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white">トーナメント一覧</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">トーナメントがありません</p>
                <p className="text-gray-500 text-sm">新しいトーナメントを作成してください</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="p-4 rounded-lg border border-gray-600 bg-gray-700/30 hover:border-gray-500 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-white font-semibold text-lg">{tournament.name}</h3>
                          {getStatusBadge(tournament.status)}
                          {getTypeBadge(tournament.type)}
                        </div>
                        {tournament.description && (
                          <p className="text-gray-400 text-sm mb-3">{tournament.description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-gray-500 text-xs">バイイン</p>
                            <p className="text-white font-semibold">¥{tournament.buyIn.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">参加者</p>
                            <p className="text-white font-semibold">{tournament.currentPlayers}/{tournament.maxPlayers}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">賞金総額</p>
                            <p className="text-white font-semibold">¥{tournament.prizePool.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">開始時刻</p>
                            <p className="text-white font-semibold">
                              {tournament.startTime 
                                ? new Date(tournament.startTime).toLocaleString('ja-JP') 
                                : '未定'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {tournament.status === 'registering' && (
                          <button
                            onClick={() => handleTournamentAction(tournament.id, 'start')}
                            className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            <span>開始</span>
                          </button>
                        )}
                        {tournament.status === 'in-progress' && (
                          <button
                            onClick={() => handleTournamentAction(tournament.id, 'complete')}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>完了</span>
                          </button>
                        )}
                        {(tournament.status === 'registering' || tournament.status === 'in-progress') && (
                          <button
                            onClick={() => handleTournamentAction(tournament.id, 'cancel')}
                            className="flex items-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                            <span>キャンセル</span>
                          </button>
                        )}
                        {tournament.status !== 'in-progress' && (
                          <button
                            onClick={() => handleTournamentAction(tournament.id, 'delete')}
                            className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>削除</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TournamentManagement() {
  return (
    <AdminProtectedRoute>
      <TournamentManagementContent />
    </AdminProtectedRoute>
  );
}
