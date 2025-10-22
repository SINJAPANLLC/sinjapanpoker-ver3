'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, MessageCircle } from 'lucide-react';
import { usePokerGame } from '@/hooks/usePokerGame';
import PokerTable from '@/components/poker/PokerTable';
import ActionButtons from '@/components/poker/ActionButtons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';

function ActiveGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams?.get('id') || searchParams?.get('table') || null;
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

  useEffect(() => {
    if (!gameId) {
      router.push('/lobby');
    }
  }, [gameId, router]);

  useEffect(() => {
    if (connected && !hasJoined && socket) {
      joinGame(1000);
      setHasJoined(true);
    }
  }, [connected, hasJoined, joinGame, socket]);

  const currentPlayer = getCurrentPlayer();
  const myTurn = isMyTurn();

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

  if (!connected || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">
            {!connected ? 'サーバーに接続中...' : 'ゲームを読み込み中...'}
          </p>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">エラー</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/lobby')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            ロビーに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#1a1a2e] flex flex-col overflow-hidden">
      {/* トップバー */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={() => router.push('/lobby')}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-700">
          <p className="text-white font-bold text-lg">{getPhaseText(gameState.phase)}</p>
        </div>

        <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* メインゲームエリア */}
      <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-32">
        <div className="w-full max-w-[800px]">
          <PokerTable
            players={gameState.players}
            communityCards={gameState.communityCards}
            pot={gameState.pot}
            currentPlayerIndex={gameState.currentPlayerIndex}
            myPlayerId={socket?.id || null}
          />
        </div>
      </div>

      {/* ボトムエリア - アクションボタン */}
      {currentPlayer && !currentPlayer.folded && gameState.phase !== 'finished' && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e] to-transparent">
          <div className="max-w-2xl mx-auto">
            {myTurn && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-4 text-center">
                  <p className="text-green-400 font-bold text-xl">あなたのターンです！</p>
                </div>
              </motion.div>
            )}
            <ActionButtons
              currentBet={gameState.currentBet}
              myChips={currentPlayer.chips}
              myBet={currentPlayer.bet}
              onAction={performAction}
              disabled={!myTurn}
            />
          </div>
        </div>
      )}

      {/* 勝者表示 */}
      {gameState.phase === 'finished' && gameState.winner && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 text-center shadow-2xl">
              <p className="text-white font-bold text-3xl mb-2">🏆 {gameState.winner} の勝利!</p>
              {gameState.winningHand && (
                <p className="text-yellow-100 text-lg">{gameState.winningHand}</p>
              )}
              <button
                onClick={() => router.push('/lobby')}
                className="mt-6 px-6 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                ロビーに戻る
              </button>
            </div>
          </motion.div>
        </div>
      )}
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
