'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaDollarSign, FaLock, FaGlobe, FaSearch } from 'react-icons/fa';
import { Plus, Users, BarChart3 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function ClubsContent() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(`/api/clubs${search ? `?search=${search}` : ''}`);
        const data = await response.json();
        setClubs(data.clubs);
      } catch (error) {
        console.error('Clubs fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [search]);

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2 md:space-x-4">
            <img
              src="https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/5b45aaad-02a4-4454-911d-14fb0a0000c5/img/70686fc0-87b1-013e-fa57-0a58a9feac02/SJsP-thumbnail.png"
              alt="SIN JAPAN POKER"
              className="w-20 h-6 md:w-32 md:h-10 rounded-lg object-cover"
            />
            <h1 className="text-lg md:text-2xl font-bold text-gradient-blue">クラブ一覧</h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative flex-1 md:flex-initial">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="クラブ検索..."
                className="w-full md:w-64 pl-8 md:pl-10 pr-3 py-2 text-sm md:text-base"
              />
              <FaSearch className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm md:text-base" />
            </div>
            <Link href="/clubs/create" className="btn-primary px-3 md:px-6 py-2 text-sm md:text-base flex items-center space-x-2 flex-shrink-0">
              <Plus className="text-xs md:text-base" />
              <span className="hidden md:inline">作成</span>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="card text-center py-12 md:py-20">
            <p className="text-gray-500 text-base md:text-xl mb-6">クラブが見つかりません</p>
            <Link href="/clubs/create" className="btn-primary inline-block">
              クラブを作成する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {clubs.map((club, index) => (
              <Link
                key={club.id}
                href={`/clubs/${club.id}`}
                className="card hover-lift hover-glow group animate-slide-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start space-x-3 md:space-x-4 min-w-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 text-xl md:text-2xl">
                      ♠️
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                        {club.name}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm line-clamp-2">{club.description}</p>
                    </div>
                  </div>
                  {club.isPrivate ? (
                    <FaLock className="text-gray-500 flex-shrink-0 text-sm md:text-base" />
                  ) : (
                    <FaGlobe className="text-green-400 flex-shrink-0 text-sm md:text-base" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="badge-secondary text-xs">{club.code}</span>
                  <span className={`badge text-xs ${
                    club.tier === 'platinum' ? 'bg-purple-500 text-white' :
                    club.tier === 'gold' ? 'bg-yellow-500 text-black' :
                    club.tier === 'silver' ? 'bg-gray-400 text-black' :
                    'bg-orange-600 text-white'
                  }`}>
                    {club.tier.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
                  <div>
                    <div className="text-base md:text-xl font-bold text-white">{club.memberCount}</div>
                    <div className="text-gray-500 text-xs">メンバー</div>
                  </div>
                  <div>
                    <div className="text-base md:text-xl font-bold text-white">{club.activeTables}</div>
                    <div className="text-gray-500 text-xs">テーブル</div>
                  </div>
                  <div>
                    <div className="text-base md:text-xl font-bold text-gradient-blue">
                      ${club.totalRevenue.toFixed(0)}
                    </div>
                    <div className="text-gray-500 text-xs">収益</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-500">オーナー: {club.ownerUsername}</span>
                  <Link
                    href={`/clubs/${club.id}/revenue`}
                    className="text-blue-400 hover:text-cyan-300 flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BarChart3 className="text-xs md:text-sm" />
                    <span>収益詳細</span>
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ClubsPage() {
  return (
    <ProtectedRoute>
      <ClubsContent />
    </ProtectedRoute>
  );
}
