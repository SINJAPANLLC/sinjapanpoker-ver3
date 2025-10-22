'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePokerGame } from '@/hooks/usePokerGame';
import PokerTable from '@/components/poker/PokerTable';
import ActionButtons from '@/components/poker/ActionButtons';
import GameChat from '@/components/poker/GameChat';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';

function ActiveGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams?.get('id') || null;
  const [hasJoined, setHasJoined] = useState(false);

  const {
    gameState,
    messages,
    connected,
    error,
    joinGame,
    performAction,
    sendMessage,
    getCurrentPlayer,
    isMyTurn,
    socket,
  } = usePokerGame(gameId);

  // ゲームIDがない場合はロビーに戻る
  useEffect(() => {
    if (!gameId) {
      router.push('/lobby');
    }
  }, [gameId, router]);

  // 自動参加
  useEffect(() => {
    if (connected && !hasJoined && socket) {
      joinGame(1000);
      setHasJoined(true);
    }
  }, [connected, hasJoined, joinGame, socket]);

  const currentPlayer = getCurrentPlayer();
  const myTurn = isMyTurn();

  // フェーズ表示用テキスト
  const getPhaseText = (phase: string) => {
    const phaseMap: Record<string, string> = {
      'waiting': '待機中',
      'preflop': 'プリフロップ',
      'flop': 'フロップ',
      'turn': 'ターン',
      'river': 'リバー',
      'showdown': 'ショーダウン',
      'finished': '終了',
    };
    return phaseMap[phase] || phase;
  };

  // 接続中またはゲーム状態が読み込まれていない
  if (!connected || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#1a0a0a] to-black">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">
            {!connected ? 'サーバーに接続中...' : 'ゲームを読み込み中...'}
          </p>
        </div>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#1a0a0a] to-black">
        <div className="card-blue max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">エラー</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link href="/lobby" className="btn-primary">
            ロビーに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-[#1a0a0a] to-black">
      {/* 背景 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute inset-0 bg-dots opacity-20"></div>
      </div>

      {/* ヘッダー */}
      <header className="relative z-10 glass-strong border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/lobby" className="text-blue-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gradient-blue">{gameState.type.toUpperCase()} ゲーム</h1>
              <p className="text-sm text-gray-400">ゲームID: {gameId?.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* フェーズ表示 */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">{getPhaseText(gameState.phase)}</span>
            </div>

            {/* プレイヤー数 */}
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">{gameState.players.length} プレイヤー</span>
            </div>

            {/* ステータス */}
            <div className={`px-3 py-1 rounded-full ${
              connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {connected ? '接続中' : '切断'}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左サイドバー - プレイヤー統計 */}
          <div className="space-y-4">
            <div className="card-blue">
              <h3 className="font-bold text-gradient-blue mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                あなたの情報
              </h3>
              {currentPlayer ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">チップ</span>
                    <span className="text-yellow-400 font-bold">{currentPlayer.chips.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ベット</span>
                    <span className="text-green-400 font-bold">{currentPlayer.bet.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ポジション</span>
                    <span className="text-blue-400 font-bold">
                      {currentPlayer.isDealer ? 'ディーラー' : `#${currentPlayer.position + 1}`}
                    </span>
                  </div>
                  {currentPlayer.folded && (
                    <div className="badge-secondary text-center">フォールド済み</div>
                  )}
                  {currentPlayer.isAllIn && (
                    <div className="badge-primary text-center">オールイン</div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">データ読み込み中...</p>
              )}
            </div>

            {/* ゲーム情報 */}
            <div className="card-blue">
              <h3 className="font-bold text-gradient-blue mb-4">ゲーム情報</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ゲームタイプ</span>
                  <span className="text-white">{gameState.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">現在のフェーズ</span>
                  <span className="text-white">{getPhaseText(gameState.phase)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ポット</span>
                  <span className="text-yellow-400 font-bold">{gameState.pot.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">現在のベット</span>
                  <span className="text-green-400 font-bold">{gameState.currentBet.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 中央 - ポーカーテーブル */}
          <div className="lg:col-span-2 space-y-4">
            {/* ターン表示 */}
            {myTurn && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-4 text-center">
                  <p className="text-white font-bold text-xl">あなたのターンです！</p>
                </div>
              </motion.div>
            )}

            {/* 勝者表示 */}
            {gameState.phase === 'finished' && gameState.winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-4 text-center">
                  <p className="text-white font-bold text-xl">🏆 {gameState.winner} の勝利!</p>
                  {gameState.winningHand && (
                    <p className="text-yellow-100 mt-2">{gameState.winningHand}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ポーカーテーブル */}
            <div className="card-blue p-6">
              <PokerTable
                players={gameState.players}
                communityCards={gameState.communityCards}
                pot={gameState.pot}
                currentPlayerIndex={gameState.currentPlayerIndex}
                myPlayerId={socket?.id || null}
              />
            </div>

            {/* アクションボタン */}
            {currentPlayer && !currentPlayer.folded && gameState.phase !== 'finished' && (
              <ActionButtons
                currentBet={gameState.currentBet}
                myChips={currentPlayer.chips}
                myBet={currentPlayer.bet}
                onAction={performAction}
                disabled={!myTurn}
              />
            )}
          </div>

          {/* 右サイドバー - チャット */}
          <div>
            <GameChat messages={messages} onSendMessage={sendMessage} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ActiveGamePage() {
  return (
    <ProtectedRoute>
      <ActiveGameContent />
    </ProtectedRoute>
  );
}
