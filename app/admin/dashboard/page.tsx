'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/useAdminStore';
import { useTournamentStore, Tournament } from '@/store/useTournamentStore';
import { useSystemStore } from '@/store/useSystemStore';
import { useGameStore } from '@/store/useGameStore';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  Shield, 
  Trophy, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Plus,
  Settings,
  BarChart3,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Coins,
  Monitor,
  Gamepad2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  CreditCard,
  FileText,
  Banknote,
} from 'lucide-react';


interface AdminStats {
  activeTournaments: {
    count: number;
    totalPlayers: number;
    totalPrizePool: number;
    tournaments: any[];
  };
  activeGames: {
    count: number;
    games: any[];
  };
  systemStats: {
    totalUsers: number;
    totalChips: number;
    todayGames: number;
  };
}

function AdminDashboardContent() {
  const router = useRouter();
  const { adminUser, logout, adminToken } = useAdminStore();
  const { tournaments, getActiveTournaments, getTournamentsByAdmin } = useTournamentStore();
  const { settings, toggleRealMoney } = useSystemStore();
  const { activeGames } = useGameStore();
  
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [activeTables, setActiveTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // データベースから統計を取得
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setAdminStats(data);
          setActiveTournaments(data.activeTournaments.tournaments || []);
          setActiveTables(data.activeTables?.tables || []);
        } else {
          console.error('Failed to fetch admin stats:', data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (adminUser && adminToken) {
      fetchAdminStats();
      // 30秒ごとに更新
      const interval = setInterval(fetchAdminStats, 30000);
      return () => clearInterval(interval);
    }
  }, [adminUser, adminToken]);

  // Fallback: Zustand storeからもデータ取得
  useEffect(() => {
    if (adminUser) {
      const storeTournaments = getActiveTournaments();
      if (storeTournaments.length > 0 && !adminStats) {
        setActiveTournaments(storeTournaments);
      }
      setMyTournaments(getTournamentsByAdmin(adminUser.id));
    }
  }, [tournaments, adminUser, getActiveTournaments, getTournamentsByAdmin, adminStats]);


  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleToggleRealMoney = () => {
    if (adminUser) {
      toggleRealMoney(adminUser.id);
      // localStorageにも保存（SHOPページで参照するため）
      localStorage.setItem('admin_real_money_mode', (!settings.realMoneyEnabled).toString());
    }
  };

  const stats = [
    {
      title: 'アクティブトーナメント',
      value: adminStats?.activeTournaments.count || activeTournaments.length,
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      change: '+2',
      changeType: 'positive'
    },
    {
      title: '総参加者数',
      value: adminStats?.activeTournaments.totalPlayers || activeTournaments.reduce((sum, t) => sum + (t.currentPlayers || 0), 0),
      icon: <Users className="w-6 h-6 text-blue-500" />,
      change: '+15',
      changeType: 'positive'
    },
    {
      title: '賞金総額',
      value: ((adminStats?.activeTournaments?.totalPrizePool ?? activeTournaments.reduce((sum, t) => sum + ((t as any).prizePool || (t as any).prize || 0), 0)) || 0).toLocaleString(),
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      change: '+25%',
      changeType: 'positive'
    },
    {
      title: 'アクティブゲーム',
      value: adminStats?.activeGames.count || activeGames.length,
      icon: <Gamepad2 className="w-6 h-6 text-purple-500" />,
      change: '+' + (adminStats?.systemStats.todayGames || 0),
      changeType: 'positive'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-gray-400 text-xs md:text-sm hidden sm:block">SIN JAPAN POKER</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-white font-semibold text-sm md:text-base">{adminUser?.username}</p>
                <p className="text-gray-400 text-xs md:text-sm">{adminUser?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm md:text-base"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">ログアウト</span>
                <span className="md:hidden">退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* リアルマネーモード切り替え */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className={`p-3 rounded-lg ${settings.realMoneyEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  <DollarSign className={`w-6 h-6 ${settings.realMoneyEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">リアルマネーモード</h3>
                  <p className="text-gray-400 text-sm">
                    {settings.realMoneyEnabled 
                      ? 'ユーザーはチップを購入できます' 
                      : 'チップは管理者から付与されます'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleToggleRealMoney}
                className={`flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all ${
                  settings.realMoneyEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {settings.realMoneyEnabled ? (
                  <>
                    <ToggleRight className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="hidden md:inline font-semibold">有効</span>
                    <span className="md:hidden font-semibold">ON</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="hidden md:inline font-semibold">無効</span>
                    <span className="md:hidden font-semibold">OFF</span>
                  </>
                )}
              </button>
            </div>
            
            {settings.realMoneyEnabled && (
              <div className="mt-4 flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">ユーザーはポイントでチップを購入できます</span>
              </div>
            )}
            
            {!settings.realMoneyEnabled && (
              <div className="mt-4 flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">チップは管理者が直接付与する必要があります</span>
              </div>
            )}
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-3 md:p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="p-2 md:p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-5 h-5 md:w-6 md:h-6">
                    {stat.icon}
                  </div>
                </div>
                <div className={`text-xs md:text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">{stat.title}</p>
                <p className="text-lg md:text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6 mb-6 md:mb-8">
          <button
            onClick={() => router.push('/admin/tournaments')}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 md:p-6 hover:border-yellow-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                <Trophy className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">トーナメント管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">トーナメントの確認・管理</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/tournaments/create')}
            className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl p-3 md:p-6 hover:border-orange-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                <Plus className="w-4 h-4 md:w-6 md:h-6 text-orange-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">トーナメント作成</h3>
                <p className="text-gray-400 text-xs hidden md:block">新しいトーナメントを作成</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/users')}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 md:p-6 hover:border-blue-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">ユーザー管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">ユーザーの管理と操作</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/currency')}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 md:p-6 hover:border-green-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <Coins className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">通貨管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">ユーザーへの通貨付与</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/revenue')}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 md:p-6 hover:border-green-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">収益管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">レーキ・手数料の管理</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/monitor')}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-3 md:p-6 hover:border-orange-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                <Monitor className="w-4 h-4 md:w-6 md:h-6 text-orange-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">ゲーム監視</h3>
                <p className="text-gray-400 text-xs hidden md:block">リアルタイムゲーム監視</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/tables')}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-3 md:p-6 hover:border-blue-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Gamepad2 className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">テーブル管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">ユーザー作成テーブル管理</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/payment')}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 md:p-6 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">決済管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">Stripe・仮想通貨決済</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/settings')}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-3 md:p-6 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                <Settings className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">システム設定</h3>
                <p className="text-gray-400 text-xs hidden md:block">システム全体の設定</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/analytics')}
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-3 md:p-6 hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-indigo-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">分析レポート</h3>
                <p className="text-gray-400 text-xs hidden md:block">詳細な統計と分析</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/kyc')}
            className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-3 md:p-6 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                <FileText className="w-4 h-4 md:w-6 md:h-6 text-amber-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">KYC管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">本人確認書類の審査</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/realmoney')}
            className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-3 md:p-6 hover:border-emerald-500/50 transition-all group"
          >
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                <Banknote className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold mb-1 text-xs md:text-base">リアルマネー管理</h3>
                <p className="text-gray-400 text-xs hidden md:block">入出金・残高管理</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboardContent />
    </AdminProtectedRoute>
  );
}