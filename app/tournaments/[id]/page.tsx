'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Users, Clock, Coins, Crown, AlertCircle, DollarSign } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';
import { useTournamentStore } from '@/store/useTournamentStore';

interface TournamentDetail {
  id: string;
  name: string;
  buyIn: number;
  fee: number;
  guarantee: number;
  players: number;
  maxPlayers: number;
  startTime: string;
  status: 'registering' | 'upcoming' | 'running' | 'finished';
  prizePool: number;
  blindLevels: { level: number; smallBlind: number; bigBlind: number; ante: number; duration: number; }[];
  payouts: { position: number; prize: number; percentage: number; }[];
  registeredPlayers: { name: string; chips: number; rank?: number; }[];
}

function TournamentDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const { joinTournament } = useTournamentStore();
  const [isRegistered, setIsRegistered] = useState(false);

  // モックデータ（実際はAPIから取得）
  const tournament: TournamentDetail = {
    id,
    name: 'Daily Main Event',
    buyIn: 100,
    fee: 10,
    guarantee: 25000,
    players: 256,
    maxPlayers: 500,
    startTime: '20:00 JST',
    status: 'registering',
    prizePool: 28000,
    blindLevels: [
      { level: 1, smallBlind: 10, bigBlind: 20, ante: 0, duration: 10 },
      { level: 2, smallBlind: 15, bigBlind: 30, ante: 0, duration: 10 },
      { level: 3, smallBlind: 25, bigBlind: 50, ante: 5, duration: 10 },
      { level: 4, smallBlind: 50, bigBlind: 100, ante: 10, duration: 10 },
      { level: 5, smallBlind: 75, bigBlind: 150, ante: 15, duration: 10 },
    ],
    payouts: [
      { position: 1, prize: 8400, percentage: 30 },
      { position: 2, prize: 5600, percentage: 20 },
      { position: 3, prize: 3920, percentage: 14 },
      { position: 4, prize: 2800, percentage: 10 },
      { position: 5, prize: 2240, percentage: 8 },
      { position: 6, prize: 1680, percentage: 6 },
      { position: 7, prize: 1400, percentage: 5 },
      { position: 8, prize: 1120, percentage: 4 },
      { position: 9, prize: 840, percentage: 3 },
    ],
    registeredPlayers: [
      { name: 'Player1', chips: 5000 },
      { name: 'Player2', chips: 5000 },
      { name: 'Player3', chips: 5000 },
    ]
  };

  const handleRegister = () => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }
    
    const success = joinTournament(tournament.id, user.id, user.username);
    if (success) {
      setIsRegistered(true);
      alert('トーナメントに登録しました！');
    } else {
      alert('登録に失敗しました');
    }
  };

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'registering':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">登録受付中</span>;
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold">開催予定</span>;
      case 'running':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold animate-pulse">進行中</span>;
      case 'finished':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-sm font-semibold">終了</span>;
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム - 詳細情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <div className="card animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">トーナメント情報</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-sm">バイイン</span>
                  </div>
                  <div className="text-white font-bold text-xl">{tournament.buyIn + tournament.fee}</div>
                  <div className="text-gray-500 text-xs">{tournament.buyIn} + {tournament.fee}</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-sm">賞金総額</span>
                  </div>
                  <div className="text-yellow-400 font-bold text-xl">{tournament.prizePool.toLocaleString()}</div>
                  <div className="text-gray-500 text-xs">GTD: {tournament.guarantee.toLocaleString()}</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400 text-sm">参加者</span>
                  </div>
                  <div className="text-white font-bold text-xl">{tournament.players}/{tournament.maxPlayers}</div>
                  <div className="text-gray-500 text-xs">最大{tournament.maxPlayers}名</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400 text-sm">開始時刻</span>
                  </div>
                  <div className="text-white font-bold text-lg">{tournament.startTime}</div>
                </div>
              </div>
            </div>

            {/* ブラインド構造 */}
            <div className="card animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-2xl font-bold text-white mb-6">ブラインド構造</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 pb-3">レベル</th>
                      <th className="text-left text-gray-400 pb-3">スモールブラインド</th>
                      <th className="text-left text-gray-400 pb-3">ビッグブラインド</th>
                      <th className="text-left text-gray-400 pb-3">アンティ</th>
                      <th className="text-left text-gray-400 pb-3">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.blindLevels.map((level) => (
                      <tr key={level.level} className="border-b border-gray-800">
                        <td className="py-3 text-white font-semibold">{level.level}</td>
                        <td className="py-3 text-gray-300">{level.smallBlind}</td>
                        <td className="py-3 text-gray-300">{level.bigBlind}</td>
                        <td className="py-3 text-gray-300">{level.ante}</td>
                        <td className="py-3 text-gray-300">{level.duration}分</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 賞金配分 */}
            <div className="card animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold text-white mb-6">賞金配分</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tournament.payouts.map((payout) => (
                  <div key={payout.position} className={`bg-gray-800/50 rounded-lg p-4 ${payout.position <= 3 ? 'border-2 border-yellow-500/30' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">{payout.position}位</span>
                      <span className="text-gray-500 text-xs">{payout.percentage}%</span>
                    </div>
                    <div className="text-yellow-400 font-bold text-xl">{payout.prize.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム - 登録 */}
          <div className="space-y-6">
            {/* 登録ボタン */}
            <div className="card animate-scale-in">
              <div className="text-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">トーナメント登録</h3>
                <p className="text-gray-400 text-sm">今すぐ登録して参加しよう！</p>
              </div>
              
              {isRegistered ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-green-400">
                    <AlertCircle />
                    <span className="font-semibold">登録済み</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={tournament.status !== 'registering'}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tournament.status === 'registering' ? '登録する' : '受付終了'}
                </button>
              )}
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>バイイン</span>
                  <span className="text-white font-semibold">{tournament.buyIn + tournament.fee} チップ</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>開始チップ</span>
                  <span className="text-white font-semibold">5,000</span>
                </div>
              </div>
            </div>

            {/* 登録プレイヤー */}
            <div className="card animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-bold text-white mb-4">登録プレイヤー</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tournament.registeredPlayers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{player.name[0]}</span>
                      </div>
                      <span className="text-white font-semibold">{player.name}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{player.chips.toLocaleString()}</span>
                  </div>
                ))}
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

