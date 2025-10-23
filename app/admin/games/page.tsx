'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Game {
  id: string;
  gameId: string;
  type: string;
  phase: string;
  players: any[];
  communityCards: any[];
  pot: number;
  smallBlind: number;
  bigBlind: number;
  winner: string | null;
  winningHand: string | null;
  createdAt: string;
  endedAt: string | null;
}

interface GameStats {
  totalGames: number;
  totalHands: number;
  totalPot: number;
  gamesByType: Array<{ type: string; count: number }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function AdminGamesContent() {
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [handHistory, setHandHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchGames(1);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/games/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchGames = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/games?page=${page}&limit=${pagination.limit}`);
      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewGameDetails = async (game: Game) => {
    try {
      const response = await fetch(`/api/games/${game.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedGame(data.game);
        setHandHistory(data.hands);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const formatChips = (amount: number) => {
    return amount.toLocaleString();
  };

  const getCardSymbol = (suit: string) => {
    const symbols: Record<string, string> = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    };
    return symbols[suit] || suit;
  };

  const getCardColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };

  return (
    <div className="relative min-h-screen overflow-hidden page-transition">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a0000] to-black"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      </div>

      <header className="relative z-10 glass-strong border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Link href="/admin/dashboard" className="text-blue-400 hover:text-cyan-300">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">ゲームテーブル管理</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-in-up">
            <div className="card-blue">
              <p className="text-gray-400 text-sm mb-2">総ゲーム数</p>
              <p className="text-3xl font-bold text-gradient-blue">{stats.totalGames}</p>
            </div>
            <div className="card-blue">
              <p className="text-gray-400 text-sm mb-2">総ハンド数</p>
              <p className="text-3xl font-bold text-gradient-blue">{stats.totalHands}</p>
            </div>
            <div className="card-blue">
              <p className="text-gray-400 text-sm mb-2">総ポット額</p>
              <p className="text-3xl font-bold text-gradient-blue">{formatChips(stats.totalPot)}</p>
            </div>
            <div className="card-blue">
              <p className="text-gray-400 text-sm mb-2">ゲームタイプ</p>
              {stats.gamesByType.length === 0 ? (
                <p className="text-sm text-gray-500">データなし</p>
              ) : (
                stats.gamesByType.map((type) => (
                  <div key={type.type} className="flex justify-between mt-2">
                    <span className="text-sm">{type.type}</span>
                    <span className="text-sm font-bold text-blue-400">{type.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="card-blue overflow-hidden animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ゲームID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">タイプ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ブラインド</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ポット</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">プレイヤー</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">勝者</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">終了日時</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : games.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <p className="mb-2">ゲームデータがありません</p>
                      <p className="text-sm text-gray-500">ゲームをプレイするとここに履歴が表示されます</p>
                    </td>
                  </tr>
                ) : (
                  games.map((game, index) => (
                    <tr key={game.id} className="border-b border-white/5 hover:bg-white/5 transition-colors animate-slide-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-300">{game.gameId.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-blue-400">{game.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{game.smallBlind}/{game.bigBlind}</td>
                      <td className="px-6 py-4 text-sm font-bold text-yellow-400">{formatChips(game.pot)}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{Array.isArray(game.players) ? game.players.length : 0}</td>
                      <td className="px-6 py-4 text-sm text-green-400">{game.winner || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{game.endedAt ? formatDate(game.endedAt) : '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => viewGameDetails(game)}
                          className="btn-primary-small"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                {pagination.total}件中 {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}件表示
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchGames(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-secondary-small disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <span className="px-4 py-2 glass rounded-xl text-sm text-gray-300">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchGames(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary-small disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && selectedGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: '56rem' }}
          >
            <div className="card-blue max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gradient-blue">ゲーム詳細</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">ゲームID</p>
                <p className="font-mono text-sm text-gray-300">{selectedGame.gameId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">タイプ</p>
                <p className="text-blue-400">{selectedGame.type}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">ブラインド</p>
                <p className="text-gray-300">{selectedGame.smallBlind}/{selectedGame.bigBlind}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">ポット</p>
                <p className="font-bold text-yellow-400">{formatChips(selectedGame.pot)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">勝者</p>
                <p className="text-green-400">{selectedGame.winner || '-'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">勝利ハンド</p>
                <p className="text-gray-300">{selectedGame.winningHand || '-'}</p>
              </div>
            </div>

            {selectedGame.communityCards && selectedGame.communityCards.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">コミュニティカード</p>
                <div className="flex gap-2">
                  {selectedGame.communityCards.map((card: any, index: number) => (
                    <div key={index} className="playing-card w-16 h-22 flex flex-col items-center justify-center">
                      <div className={`text-2xl font-bold ${getCardColor(card.suit)}`}>
                        {card.rank}
                      </div>
                      <div className={`text-xl ${getCardColor(card.suit)}`}>
                        {getCardSymbol(card.suit)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold mb-4 text-gradient-blue">ハンド履歴</h3>
              <div className="space-y-2">
                {handHistory.length === 0 ? (
                  <p className="text-gray-400">ハンド履歴がありません</p>
                ) : (
                  handHistory.map((hand: any) => (
                    <div key={hand.id} className="glass-strong rounded-xl p-4 border border-white/10 hover-lift">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-200">ユーザーID: {hand.userId}</p>
                          <p className="text-sm text-gray-400">ブラインド: {hand.blinds}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-xl ${hand.chipsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {hand.chipsChange >= 0 ? '+' : ''}{formatChips(hand.chipsChange)}
                          </p>
                          <p className="text-sm mt-1">
                            <span className={`px-3 py-1 rounded-lg ${
                              hand.result === 'win' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              hand.result === 'loss' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {hand.result === 'win' ? '勝利' : hand.result === 'loss' ? '敗北' : '引き分け'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function AdminGamesPage() {
  return (
    <AdminProtectedRoute>
      <AdminGamesContent />
    </AdminProtectedRoute>
  );
}
