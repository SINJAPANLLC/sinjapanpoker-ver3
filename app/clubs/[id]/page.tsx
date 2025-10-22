'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaDollarSign, FaTable, FaCog } from 'react-icons/fa';
import { Users, Crown, BarChart3 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function ClubDetailContent() {
  const params = useParams();
  const clubId = params?.id;
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await fetch(`/api/clubs/${clubId}`);
        const data = await response.json();
        setClub(data);
      } catch (error) {
        console.error('Failed to fetch club:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clubId) {
      fetchClub();
    }
  }, [clubId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">クラブが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/clubs"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FaArrowLeft className="h-6 w-6" />
              </Link>
              <div className="text-white">
                <h1 className="text-xl font-bold">{club.name}</h1>
                <p className="text-sm text-blue-300">クラブ詳細</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <Users className="h-5 w-5 text-blue-400" />
                <span>{club.memberCount || 0} メンバー</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Club Info */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{club.name}</h2>
                  <p className="text-blue-300">{club.description || 'クラブの説明'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-semibold">メンバー</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{club.memberCount || 0}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaTable className="h-5 w-5 text-green-400" />
                    <span className="text-white font-semibold">テーブル</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{club.tableCount || 0}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaDollarSign className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold">総収益</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">¥{club.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-semibold">レート</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{club.rakeRate || 5}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">最近のアクティビティ</h3>
                <div className="space-y-2">
                  {club.recentActivity?.map((activity: any, index: number) => (
                    <div key={index} className="bg-black/20 rounded-lg p-3">
                      <p className="text-white text-sm">{activity}</p>
                    </div>
                  )) || (
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">最近のアクティビティはありません</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">アクション</h3>
              <div className="space-y-3">
                <Link
                  href={`/clubs/${clubId}/revenue`}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>収益レポート</span>
                </Link>
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                  <FaCog className="h-5 w-5" />
                  <span>設定</span>
                </button>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">クラブ統計</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">今月の収益</span>
                  <span className="text-white font-semibold">¥{club.monthlyRevenue?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">アクティブプレイヤー</span>
                  <span className="text-white font-semibold">{club.activePlayers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">平均セッション</span>
                  <span className="text-white font-semibold">{club.avgSessionTime || '0分'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClubDetailPage() {
  return (
    <ProtectedRoute>
      <ClubDetailContent />
    </ProtectedRoute>
  );
}