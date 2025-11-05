'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Trophy, TrendingUp, Clock, DollarSign, Eye } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface HandHistory {
  id: string;
  date: string;
  gameType: string;
  buyIn: number;
  position: number;
  totalPlayers: number;
  winnings: number;
  hands: {
    id: string;
    cards: string[];
    action: string;
    result: 'win' | 'lose' | 'fold';
    amount: number;
  }[];
}

function HistoryContent() {
  const [handHistories, setHandHistories] = useState<HandHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HandHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockHistories: HandHistory[] = [];
    setHandHistories(mockHistories);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPositionText = (position: number, totalPlayers: number) => {
    const percentage = (totalPlayers - position + 1) / totalPlayers * 100;
    if (percentage >= 80) return '🏆 優勝';
    if (percentage >= 60) return '🥈 2位';
    if (percentage >= 40) return '🥉 3位';
    return `${position}位`;
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
          <Link href="/lobby" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-gradient-blue">ハンド履歴</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-blue animate-fade-in">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-gray-400 text-sm">総ゲーム数</div>
              </div>
            </div>
          </div>
          <div className="card-blue animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">+7,200</div>
                <div className="text-gray-400 text-sm">総獲得額</div>
              </div>
            </div>
          </div>
          <div className="card-blue animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">66.7%</div>
                <div className="text-gray-400 text-sm">勝率</div>
              </div>
            </div>
          </div>
          <div className="card-blue animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold text-white">3,500</div>
                <div className="text-gray-400 text-sm">平均バイイン</div>
              </div>
            </div>
          </div>
        </div>

        {/* ハンド履歴リスト */}
        <div className="card-blue animate-slide-in-up">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span>ゲーム履歴</span>
          </h2>

          <div className="space-y-4">
            {handHistories.map((history, index) => (
              <div
                key={history.id}
                className="bg-gradient-to-r from-blue-500/20 to-blue-700/20 hover:from-blue-400/30 hover:to-blue-600/30 rounded-xl p-4 border border-blue-400/30 hover:border-blue-300/50 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedHistory(history);
                  setShowDetails(true);
                }}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{history.gameType}</div>
                      <div className="text-gray-400 text-sm">{formatDate(history.date)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${history.winnings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {history.winnings > 0 ? '+' : ''}{history.winnings.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">{getPositionText(history.position, history.totalPlayers)}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                  <span>バイイン: {history.buyIn.toLocaleString()}</span>
                  <span>{history.totalPlayers}人中</span>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>詳細を見る</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 詳細モーダル */}
      {showDetails && selectedHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* ヘッダー */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="text-blue-400" />
                  <span>ゲーム詳細</span>
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">ゲームタイプ</div>
                  <div className="text-white font-semibold">{selectedHistory.gameType}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">バイイン</div>
                  <div className="text-white font-semibold">{selectedHistory.buyIn.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">結果</div>
                  <div className={`font-semibold ${selectedHistory.winnings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedHistory.winnings > 0 ? '+' : ''}{selectedHistory.winnings.toLocaleString()}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">ハンド詳細</h3>
              <div className="space-y-3">
                {selectedHistory.hands.map((hand, index) => (
                  <div key={hand.id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-1">
                          {hand.cards.map((card, cardIndex) => (
                            <div key={cardIndex} className="w-8 h-12 bg-white rounded border border-gray-300 flex items-center justify-center text-black text-xs font-bold">
                              {card}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-white font-medium">ハンド #{index + 1}</div>
                          <div className="text-gray-400 text-sm">アクション: {hand.action}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          hand.result === 'win' ? 'text-green-400' :
                          hand.result === 'lose' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {hand.amount > 0 ? '+' : ''}{hand.amount.toLocaleString()}
                        </div>
                        <div className={`text-sm ${
                          hand.result === 'win' ? 'text-green-400' :
                          hand.result === 'lose' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {hand.result === 'win' ? '勝利' :
                           hand.result === 'lose' ? '敗北' :
                           'フォールド'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-6 z-20">
        <div className="max-w-2xl mx-auto flex justify-around">
          <Link href="/lobby" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">ロビー</span>
          </Link>
          <Link href="/career" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">キャリア</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-400 transition-all group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium">プロフ</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}