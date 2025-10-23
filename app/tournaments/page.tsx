'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trophy, Crown, Users, Clock, Coins, Plus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  type: 'sit-n-go' | 'scheduled' | 'bounty';
  buyIn: number;
  prizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'registering' | 'in-progress' | 'completed' | 'cancelled';
  startTime?: string;
  createdAt: string;
}

function TournamentsContent() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? '' : filter === 'active' ? 'registering,in-progress' : filter;
      const response = await fetch(`/api/tournament${status ? `?status=${status}` : ''}`);
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('トーナメント一覧の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'registering':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">登録受付中</span>;
      case 'in-progress':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold animate-pulse">進行中</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-sm font-semibold">終了</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold">キャンセル</span>;
    }
  };

  const getTypeLabel = (type: Tournament['type']) => {
    switch (type) {
      case 'sit-n-go':
        return 'シットアンドゴー';
      case 'scheduled':
        return 'スケジュール';
      case 'bounty':
        return 'バウンティ';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0a0a] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4 animate-slide-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/lobby" className="text-blue-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Image
              src="/logo.png"
              alt="SIN JAPAN POKER"
              width={128}
              height={40}
              className="w-32 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-gradient-blue">トーナメント</h1>
          </div>
          <Link
            href="/admin/tournaments/create"
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>トーナメント作成</span>
          </Link>
        </div>
      </header>

      {/* フィルター */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center space-x-4 glass-strong rounded-2xl p-2">
          {[
            { id: 'all', label: 'すべて' },
            { id: 'registering', label: '登録受付中' },
            { id: 'in-progress', label: '進行中' },
            { id: 'completed', label: '終了' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* トーナメント一覧 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 mt-4">読み込み中...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12 glass-strong rounded-2xl">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">トーナメントがありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament, index) => (
              <div
                key={tournament.id}
                className="glass-strong rounded-2xl p-6 hover:bg-white/5 transition-all cursor-pointer animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => router.push(`/tournaments/${tournament.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                      {getStatusBadge(tournament.status)}
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                        {getTypeLabel(tournament.type)}
                      </span>
                    </div>
                    {tournament.description && (
                      <p className="text-gray-400 text-sm mb-4">{tournament.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-xs text-gray-400">バイイン</p>
                          <p className="text-white font-semibold">{tournament.buyIn.toLocaleString()}チップ</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-400">賞金プール</p>
                          <p className="text-white font-semibold">{tournament.prizePool.toLocaleString()}チップ</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-xs text-gray-400">参加者</p>
                          <p className="text-white font-semibold">{tournament.currentPlayers} / {tournament.maxPlayers}</p>
                        </div>
                      </div>
                      {tournament.startTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-400">開始時刻</p>
                            <p className="text-white font-semibold">
                              {new Date(tournament.startTime).toLocaleString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {tournament.status === 'registering' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tournaments/${tournament.id}`);
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-all ml-4"
                    >
                      登録する
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TournamentsPage() {
  return (
    <ProtectedRoute>
      <TournamentsContent />
    </ProtectedRoute>
  );
}
