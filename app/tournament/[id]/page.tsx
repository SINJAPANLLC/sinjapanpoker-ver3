'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

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
  players: Array<{
    userId: string;
    username: string;
    chips: number;
    position?: number;
    prize?: number;
  }>;
}

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTournament();
    const interval = setInterval(fetchTournament, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/tournament/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setTournament(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      setError('ログインが必要です');
      return;
    }

    setError('');
    setRegistering(true);

    try {
      const response = await fetch(`/api/tournament/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          userId: user.id,
          username: user.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || '登録に失敗しました';
        setError(errorMessage);
        alert(errorMessage);
        throw new Error(errorMessage);
      }

      setTournament(data.tournament);
      alert(data.message);
    } catch (err: any) {
      console.error('Tournament registration error:', err);
      if (!err.message.includes('登録に失敗しました')) {
        setError('トーナメントに参加できませんでした。' + (err.message || ''));
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleStart = async () => {
    setError('');
    setStarting(true);

    try {
      const response = await fetch(`/api/tournament/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '開始に失敗しました');
      }

      setTournament(data.tournament);
      alert(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{error || 'トーナメントが見つかりません'}</div>
      </div>
    );
  }

  const isRegistered = user && tournament.players.some(p => p.userId === user.id);
  const entryFee = Math.floor(tournament.buyIn * 0.1);
  const totalCost = tournament.buyIn + entryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
          <Link href="/tournament">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              戻る
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：トーナメント情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-lg border-2 border-white/30">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  tournament.status === 'registering' ? 'bg-green-500 text-white' :
                  tournament.status === 'in-progress' ? 'bg-yellow-500 text-black' :
                  tournament.status === 'completed' ? 'bg-gray-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {tournament.status === 'registering' ? '登録受付中' :
                   tournament.status === 'in-progress' ? '進行中' :
                   tournament.status === 'completed' ? '終了' : 'キャンセル'}
                </div>
                <div className="px-4 py-2 rounded-full bg-purple-500 text-white text-sm font-bold">
                  {tournament.type === 'sit-n-go' ? 'シット&ゴー' :
                   tournament.type === 'scheduled' ? 'スケジュール' : 'バウンティ'}
                </div>
              </div>

              {tournament.description && (
                <p className="text-white/80 mb-4">{tournament.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">バイイン</p>
                  <p className="text-yellow-400 text-2xl font-bold">{tournament.buyIn.toLocaleString()}円</p>
                  <p className="text-white/60 text-xs mt-1">+参加料 {entryFee}円</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">賞金プール</p>
                  <p className="text-green-400 text-2xl font-bold">{tournament.prizePool.toLocaleString()}円</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <p className="text-white/60 text-sm mb-1">参加者</p>
                  <p className="text-white text-2xl font-bold">{tournament.currentPlayers}/{tournament.maxPlayers}人</p>
                </div>
                {tournament.startTime && (
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-white/60 text-sm mb-1">開始時刻</p>
                    <p className="text-white text-lg font-bold">
                      {new Date(tournament.startTime).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              {tournament.status === 'registering' && (
                <div className="mt-6">
                  {isRegistered ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded text-center">
                      ✓ 登録済み
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={registering || tournament.currentPlayers >= tournament.maxPlayers}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg disabled:opacity-50"
                    >
                      {registering ? '登録中...' : `登録する（${totalCost.toLocaleString()}円）`}
                    </button>
                  )}
                  {user && (
                    <button
                      onClick={handleStart}
                      disabled={starting || tournament.currentPlayers < 2}
                      className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50"
                    >
                      {starting ? '開始中...' : 'トーナメント開始'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 賞金分配 */}
            <div className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-lg border-2 border-white/30">
              <h2 className="text-white text-xl font-bold mb-4">賞金分配</h2>
              <div className="space-y-3">
                {[
                  { place: 1, percentage: 0.5, color: 'text-yellow-400', icon: '🥇' },
                  { place: 2, percentage: 0.3, color: 'text-gray-300', icon: '🥈' },
                  { place: 3, percentage: 0.2, color: 'text-orange-400', icon: '🥉' },
                ].map(({ place, percentage, color, icon }) => (
                  <div key={place} className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                    <span className="text-white text-lg">
                      {icon} {place}位
                    </span>
                    <span className={`${color} text-xl font-bold`}>
                      {Math.floor(tournament.prizePool * percentage).toLocaleString()}円
                      <span className="text-white/60 text-sm ml-2">({percentage * 100}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右側：参加者リスト */}
          <div>
            <div className="bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-sm p-6 rounded-lg border-2 border-white/30">
              <h2 className="text-white text-xl font-bold mb-4">参加者 ({tournament.currentPlayers}人)</h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tournament.players.map((player, index) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {player.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{player.username}</p>
                        <p className="text-white/60 text-xs">{player.chips.toLocaleString()} チップ</p>
                      </div>
                    </div>
                    {player.position && (
                      <div className="text-yellow-400 font-bold">
                        {player.position}位
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {tournament.currentPlayers === 0 && (
                <p className="text-white/60 text-center py-8">まだ参加者がいません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
