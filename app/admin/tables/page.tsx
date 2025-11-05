'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  ArrowLeft, 
  Gamepad2, 
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  DollarSign,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';

interface Table {
  id: string;
  name: string;
  type: 'cash' | 'sit-and-go';
  buyIn: number;
  currentPlayers: number;
  maxPlayers: number;
  isPrivate: boolean;
  blinds?: { small: number; big: number };
  status: 'waiting' | 'playing' | 'full' | 'paused';
  createdBy: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  rakePercentage: number;
  totalRake: number;
  handsPlayed: number;
  avgPot: number;
}

function TableManagementContent() {
  const router = useRouter();
  const { adminUser } = useAdminStore();
  
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'playing' | 'full' | 'paused'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cash' | 'sit-and-go'>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [stats, setStats] = useState({ totalTables: 0, activeTables: 0, totalPlayers: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch('/api/admin/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // データをフロントエンドのTable型に変換
        const formattedTables: Table[] = data.tables.map((t: any) => ({
          id: t.id,
          name: t.name,
          type: t.type === 'tournament' ? 'sit-and-go' : 'cash',
          buyIn: parseInt(t.stakes.split('/')[0]) || 0,
          currentPlayers: t.currentPlayers || 0,
          maxPlayers: t.maxPlayers || 9,
          isPrivate: false,
          blinds: t.stakes ? {
            small: parseInt(t.stakes.split('/')[0]) || 0,
            big: parseInt(t.stakes.split('/')[1]) || 0
          } : undefined,
          status: t.status === 'paused' ? 'paused' : t.currentPlayers >= t.maxPlayers ? 'full' : t.currentPlayers > 0 ? 'playing' : 'waiting',
          createdBy: t.clubName || 'Unknown',
          createdById: t.clubId || '',
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.lastHandAt || t.createdAt),
          rakePercentage: 0.05,
          totalRake: t.clubRevenue || 0,
          handsPlayed: t.totalHands || 0,
          avgPot: t.totalHands > 0 ? Math.round((t.totalRakeCollected || 0) / t.totalHands / 0.05) : 0
        }));
        setTables(formattedTables);
        setStats(data.stats);
      } else {
        setMessage('テーブル情報の取得に失敗しました');
        setMessageType('error');
      }
    } catch (error) {
      console.error('テーブル取得エラー:', error);
      setMessage('テーブル情報の取得に失敗しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    const matchesType = typeFilter === 'all' || table.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleTableAction = async (tableId: string, action: 'pause' | 'resume' | 'delete') => {
    try {
      const token = sessionStorage.getItem('adminToken');
      
      if (action === 'delete') {
        const response = await fetch(`/api/admin/tables?id=${tableId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setMessage('テーブルが削除されました');
          setMessageType('success');
          fetchTables(); // リロード
        } else {
          const error = await response.json();
          setMessage(error.message || 'テーブルの削除に失敗しました');
          setMessageType('error');
        }
      } else {
        // pause/resume
        const newStatus = action === 'pause' ? 'paused' : 'active';
        const response = await fetch('/api/admin/tables', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tableId, status: newStatus }),
        });

        if (response.ok) {
          setMessage(`テーブルが${action === 'pause' ? '一時停止' : '再開'}されました`);
          setMessageType('success');
          fetchTables(); // リロード
        } else {
          const error = await response.json();
          setMessage(error.message || 'テーブルの更新に失敗しました');
          setMessageType('error');
        }
      }
    } catch (error) {
      console.error('テーブルアクションエラー:', error);
      setMessage('操作中にエラーが発生しました');
      setMessageType('error');
    }
  };

  const getStatusBadge = (status: Table['status']) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">募集中</span>;
      case 'playing':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium animate-pulse">プレイ中</span>;
      case 'full':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">満員</span>;
      case 'paused':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">一時停止</span>;
    }
  };

  const getTypeBadge = (type: Table['type']) => {
    switch (type) {
      case 'cash':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">キャッシュ</span>;
      case 'sit-and-go':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">シット&ゴー</span>;
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">テーブル管理</h1>
                  <p className="text-gray-400 text-sm">ユーザー作成テーブルの管理</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/admin/tables/create')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>テーブル作成</span>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 検索 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">検索</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="テーブル名または作成者"
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
                  <option value="waiting">募集中</option>
                  <option value="playing">プレイ中</option>
                  <option value="full">満員</option>
                  <option value="paused">一時停止</option>
                </select>
              </div>

              {/* タイプフィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">タイプ</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">すべて</option>
                  <option value="cash">キャッシュ</option>
                  <option value="sit-and-go">シット&ゴー</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg">
                <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-blue-400 text-sm font-semibold">{tables.length}テーブル</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総テーブル数</p>
              <p className="text-white text-lg md:text-xl font-bold">{tables.filter(t => t.status === 'playing').length}</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-semibold">
                  {tables.reduce((sum, t) => sum + t.currentPlayers, 0)}人
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総プレイヤー数</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {tables.reduce((sum, t) => sum + t.maxPlayers, 0)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-yellow-400 text-sm font-semibold">
                  ¥{tables.reduce((sum, t) => sum + t.totalRake, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">総レーキ収益</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {tables.reduce((sum, t) => sum + t.handsPlayed, 0)}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-purple-400 text-sm font-semibold">
                  ¥{Math.round(tables.reduce((sum, t) => sum + t.avgPot, 0) / tables.length).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">平均ポット</p>
              <p className="text-white text-lg md:text-xl font-bold">
                {Math.round(tables.reduce((sum, t) => sum + t.handsPlayed, 0) / tables.length)}
              </p>
            </div>
          </div>
        </div>

        {/* テーブル一覧 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">テーブル一覧</h2>
              <span className="text-gray-400 text-sm">{filteredTables.length}件</span>
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
                        <th className="text-left p-4 text-gray-400 font-medium">テーブル情報</th>
                        <th className="text-left p-4 text-gray-400 font-medium">プレイヤー</th>
                        <th className="text-left p-4 text-gray-400 font-medium">バイイン/ブラインド</th>
                        <th className="text-left p-4 text-gray-400 font-medium">統計</th>
                        <th className="text-left p-4 text-gray-400 font-medium">ステータス</th>
                        <th className="text-left p-4 text-gray-400 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTables.map((table) => (
                        <tr key={table.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                          <td className="p-4">
                            <div>
                              <h3 className="text-white font-semibold">{table.name}</h3>
                              <p className="text-gray-400 text-sm">作成者: {table.createdBy}</p>
                              <p className="text-gray-400 text-xs">ID: {table.id}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {getTypeBadge(table.type)}
                                {table.isPrivate && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">プライベート</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white font-semibold">{table.currentPlayers}/{table.maxPlayers}</p>
                              <p className="text-gray-400 text-sm">プレイヤー</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-green-400 font-semibold">¥{table.buyIn.toLocaleString()}</p>
                              {table.blinds && (
                                <p className="text-gray-400 text-sm">
                                  {table.blinds.small}/{table.blinds.big}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <p className="text-white">{table.handsPlayed}ハンド</p>
                              <p className="text-blue-400">平均: ¥{table.avgPot.toLocaleString()}</p>
                              <p className="text-yellow-400">レーキ: ¥{table.totalRake.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(table.status)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedTable(table)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                                title="詳細表示"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/tables/${table.id}/edit`)}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                                title="編集"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {table.status === 'playing' || table.status === 'waiting' ? (
                                <button
                                  onClick={() => handleTableAction(table.id, 'pause')}
                                  className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all"
                                  title="一時停止"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              ) : table.status === 'paused' ? (
                                <button
                                  onClick={() => handleTableAction(table.id, 'resume')}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                                  title="再開"
                                >
                                  <Zap className="w-4 h-4" />
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleTableAction(table.id, 'delete')}
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
                    {filteredTables.map((table) => (
                      <div key={table.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{table.name}</h3>
                            <p className="text-gray-400 text-sm">作成者: {table.createdBy}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getTypeBadge(table.type)}
                              {getStatusBadge(table.status)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-semibold">¥{table.buyIn.toLocaleString()}</p>
                            <p className="text-white">{table.currentPlayers}/{table.maxPlayers}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <p className="text-gray-400">統計</p>
                            <p className="text-white">{table.handsPlayed}ハンド</p>
                            <p className="text-blue-400">平均: ¥{table.avgPot.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">レーキ</p>
                            <p className="text-yellow-400">¥{table.totalRake.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedTable(table)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/tables/${table.id}/edit`)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTableAction(table.id, 'delete')}
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
      </div>
    </div>
  );
}

export default function TableManagementPage() {
  return (
    <AdminProtectedRoute requiredPermission="table.manage">
      <TableManagementContent />
    </AdminProtectedRoute>
  );
}
