'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  createdAt: string;
}

export default function TournamentPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<'all' | 'registering' | 'in-progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/tournament' 
        : `/api/tournament?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('トーナメント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: Tournament['status']) => {
    switch (status) {
      case 'registering': return '登録受付中';
      case 'in-progress': return '進行中';
      case 'completed': return '終了';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getTypeLabel = (type: Tournament['type']) => {
    switch (type) {
      case 'sit-n-go': return 'シット&ゴー';
      case 'scheduled': return 'スケジュール';
      case 'bounty': return 'バウンティ';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">トーナメント</h1>
          <div className="flex gap-2">
            <Link href="/lobby">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                ロビーに戻る
              </button>
            </Link>
            <Link href="/tournament/create">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg">
                トーナメント作成
              </button>
            </Link>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex gap-2 mb-6">
          {(['all', 'registering', 'in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {status === 'all' ? 'すべて' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* トーナメントリスト */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white/10 rounded-lg p-12 text-center">
            <p className="text-white text-xl">トーナメントがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <Link key={tournament.id} href={`/tournament/${tournament.id}`}>
                <div
                  className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-lg border-2 border-white/30 cursor-pointer hover:border-cyan-400 transition-all hover:scale-[1.02]"
                >
                  {/* ステータスバッジ */}
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tournament.status === 'registering' ? 'bg-green-500 text-white' :
                      tournament.status === 'in-progress' ? 'bg-yellow-500 text-black' :
                      tournament.status === 'completed' ? 'bg-gray-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {getStatusLabel(tournament.status)}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-bold">
                      {getTypeLabel(tournament.type)}
                    </div>
                  </div>

                  {/* トーナメント名 */}
                  <h3 className="text-white text-xl font-bold mb-2">{tournament.name}</h3>
                  
                  {/* 説明 */}
                  {tournament.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                  )}

                  {/* 情報 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">バイイン:</span>
                      <span className="text-yellow-400 font-bold">{tournament.buyIn.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">賞金プール:</span>
                      <span className="text-green-400 font-bold">{tournament.prizePool.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">参加者:</span>
                      <span className="text-white font-bold">{tournament.currentPlayers}/{tournament.maxPlayers}人</span>
                    </div>
                    {tournament.startTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">開始時刻:</span>
                        <span className="text-white">
                          {new Date(tournament.startTime).toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* プログレスバー */}
                  <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300"
                      style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
