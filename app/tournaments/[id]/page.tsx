'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Users, Clock, Coins, Crown, AlertCircle, DollarSign, Play, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface TournamentDetail {
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
  endTime?: string;
  players: Array<{
    userId: string;
    username: string;
    chips: number;
    position?: number;
    prize?: number;
  }>;
  createdAt: string;
}

function TournamentDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tournament/${id}`);
      const data = await response.json();
      setTournament(data);
    } catch (error) {
      console.error('トーナメント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !tournament) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/tournament/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          userId: user.id,
          username: user.username,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('トーナメントに登録しました！');
        fetchTournament();
      } else {
        alert(data.error || '登録に失敗しました');
      }
    } catch (error) {
      console.error('登録エラー:', error);
      alert('登録に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (!user || !tournament) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/tournament/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('トーナメントを開始しました！');
        fetchTournament();
        // ゲームページにリダイレクト
        router.push(`/game/active?tournament=${id}`);
      } else {
        alert(data.error || '開始に失敗しました');
      }
    } catch (error) {
      console.error('開始エラー:', error);
      alert('開始に失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user || !tournament) return;
    if (!confirm('トーナメントをキャンセルしますか？参加費は全員に返金されます。')) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/tournament/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('トーナメントをキャンセルしました');
        fetchTournament();
      } else {
        alert(data.error || 'キャンセルに失敗しました');
      }
    } catch (error) {
      console.error('キャンセルエラー:', error);
      alert('キャンセルに失敗しました');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!tournament) return null;
    
    switch (tournament.status) {
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

  const calculatePrizes = () => {
    if (!tournament) return [];
    
    const distribution = [
      { position: 1, percentage: 50 },
      { position: 2, percentage: 30 },
      { position: 3, percentage: 20 },
    ];

    return distribution.map(d => ({
      ...d,
      prize: Math.floor((tournament.prizePool * d.percentage) / 100),
    }));
  };

  const isRegistered = tournament?.players.some(p => p.userId === user?.id) || false;
  const isAdmin = user?.isAdmin || false;

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#1a0a0a] to-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="text-gray-400 mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#1a0a0a] to-black">
        <div className="text-center glass-strong rounded-2xl p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-xl mb-4">トーナメントが見つかりません</p>
          <Link href="/tournaments" className="text-cyan-400 hover:text-cyan-300">
            トーナメント一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/tournaments" className="text-blue-400 hover:text-cyan-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
            <div className="flex items-center space-x-3 mt-1">
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-24">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左カラム */}
          <div className="lg:col-span-2 space-y-6">
            {/* トーナメント情報 */}
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                トーナメント情報
              </h2>
              {tournament.description && (
                <p className="text-gray-300 mb-4">{tournament.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">バイイン</p>
                  <p className="text-white text-2xl font-bold">{tournament.buyIn.toLocaleString()}<span className="text-sm ml-1">チップ</span></p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">賞金プール</p>
                  <p className="text-cyan-400 text-2xl font-bold">{tournament.prizePool.toLocaleString()}<span className="text-sm ml-1">チップ</span></p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">参加者</p>
                  <p className="text-white text-2xl font-bold">{tournament.currentPlayers} / {tournament.maxPlayers}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">タイプ</p>
                  <p className="text-white text-lg font-bold">
                    {tournament.type === 'sit-n-go' ? 'シット＆ゴー' : tournament.type === 'scheduled' ? 'スケジュール' : 'バウンティ'}
                  </p>
                </div>
              </div>
            </div>

            {/* 賞金分配 */}
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <DollarSign className="w-6 h-6 text-green-400 mr-2" />
                賞金分配
              </h2>
              <div className="space-y-3">
                {calculatePrizes().map((prize) => (
                  <div key={prize.position} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      {prize.position === 1 && <Crown className="w-6 h-6 text-yellow-400" />}
                      {prize.position === 2 && <Crown className="w-6 h-6 text-gray-300" />}
                      {prize.position === 3 && <Crown className="w-6 h-6 text-orange-400" />}
                      <span className="text-white font-semibold">{prize.position}位</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{prize.prize.toLocaleString()}チップ</p>
                      <p className="text-gray-400 text-sm">{prize.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 参加者一覧 */}
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 text-blue-400 mr-2" />
                参加者一覧 ({tournament.currentPlayers}人)
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tournament.players.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">まだ参加者がいません</p>
                ) : (
                  tournament.players.map((player, index) => (
                    <div key={player.userId} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 font-mono w-8">{index + 1}</span>
                        <span className="text-white font-semibold">{player.username}</span>
                        {player.userId === user?.id && (
                          <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-400 rounded text-xs">あなた</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white">{player.chips.toLocaleString()}チップ</p>
                        {player.position && (
                          <p className="text-gray-400 text-sm">{player.position}位</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 右カラム */}
          <div className="space-y-6">
            {/* アクションパネル */}
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">アクション</h2>
              <div className="space-y-3">
                {tournament.status === 'registering' && !isRegistered && (
                  <button
                    onClick={handleRegister}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? '処理中...' : '登録する'}
                  </button>
                )}
                {tournament.status === 'registering' && isRegistered && (
                  <div className="bg-green-500/20 text-green-400 py-4 rounded-lg text-center font-semibold">
                    ✓ 登録済み
                  </div>
                )}
                {tournament.status === 'registering' && isAdmin && tournament.currentPlayers >= 2 && (
                  <button
                    onClick={handleStart}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>{actionLoading ? '処理中...' : 'トーナメント開始'}</span>
                  </button>
                )}
                {tournament.status === 'registering' && isAdmin && (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>{actionLoading ? '処理中...' : 'キャンセル'}</span>
                  </button>
                )}
                {tournament.status === 'in-progress' && isRegistered && (
                  <button
                    onClick={() => router.push(`/game/active?tournament=${id}`)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-4 rounded-lg font-bold text-lg transition-all animate-pulse"
                  >
                    ゲームに参加
                  </button>
                )}
              </div>
            </div>

            {/* タイムライン */}
            <div className="glass-strong rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Clock className="w-6 h-6 text-cyan-400 mr-2" />
                スケジュール
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">作成日時</p>
                  <p className="text-white">
                    {new Date(tournament.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                {tournament.startTime && (
                  <div>
                    <p className="text-gray-400 text-sm">開始日時</p>
                    <p className="text-white">
                      {new Date(tournament.startTime).toLocaleString('ja-JP')}
                    </p>
                  </div>
                )}
                {tournament.endTime && (
                  <div>
                    <p className="text-gray-400 text-sm">終了日時</p>
                    <p className="text-white">
                      {new Date(tournament.endTime).toLocaleString('ja-JP')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <TournamentDetailContent params={params} />
    </ProtectedRoute>
  );
}
