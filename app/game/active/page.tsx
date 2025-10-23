'use client';

import { useState, useEffect } from 'react';
import { usePokerGame } from '@/hooks/usePokerGame';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActiveGamePage() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const [gameId] = useState('test-game-1');
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [showRaiseInput, setShowRaiseInput] = useState(false);
  
  // デモユーザー（認証なしでテスト）
  const user = authUser || {
    id: `demo-${Math.random().toString(36).substring(7)}`,
    username: `プレイヤー${Math.floor(Math.random() * 100)}`,
    email: 'demo@test.com',
  };
  
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
    canCheck,
    canCall,
    getCallAmount,
    getMinRaise,
  } = usePokerGame(gameId);

  const currentPlayer = getCurrentPlayer();
  const myTurn = isMyTurn();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">ポーカーゲーム</h1>
              <p className="text-white/70">ゲームID: {gameId}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${connected ? 'text-green-300' : 'text-red-300'}`}>
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                {connected ? '接続中' : '切断'}
              </div>
              {!gameState && connected && (
                <button
                  onClick={() => joinGame(1000)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  ゲームに参加
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/90 backdrop-blur-sm rounded-lg p-4 mb-4 text-white"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {gameState && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Game Area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Game Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-white/70 text-sm">フェーズ</div>
                    <div className="text-white text-xl font-bold capitalize">{gameState.phase}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70 text-sm">ポット</div>
                    <div className="text-yellow-400 text-2xl font-bold">{gameState.pot}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70 text-sm">現在のベット</div>
                    <div className="text-white text-xl font-bold">{gameState.currentBet}</div>
                  </div>
                </div>

                {/* Community Cards */}
                <div className="mb-6">
                  <div className="text-white/70 text-sm mb-2 text-center">コミュニティカード</div>
                  <div className="flex justify-center gap-2">
                    {gameState.communityCards.map((card, idx) => (
                      <motion.div
                        key={card.id}
                        initial={{ rotateY: 180, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center"
                      >
                        <div className={`text-3xl ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-black'}`}>
                          {card.rank}{card.suit}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Players */}
                <div className="grid grid-cols-3 gap-3">
                  {gameState.players.map((player, idx) => (
                    <div
                      key={player.userId}
                      className={`p-4 rounded-lg ${
                        player.userId === user.id
                          ? 'bg-blue-600/30 border-2 border-blue-400'
                          : gameState.currentPlayerIndex === idx
                          ? 'bg-yellow-600/30 border-2 border-yellow-400'
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-bold">{player.username}</div>
                          {player.isDealer && (
                            <span className="text-xs bg-orange-500 px-2 py-0.5 rounded">D</span>
                          )}
                        </div>
                        <div className="text-yellow-400 font-bold">{player.chips}</div>
                      </div>
                      
                      {player.bet > 0 && (
                        <div className="text-white/70 text-sm">ベット: {player.bet}</div>
                      )}
                      
                      {player.folded && (
                        <div className="text-red-400 text-sm">フォールド</div>
                      )}
                      
                      {player.isAllIn && (
                        <div className="text-purple-400 text-sm font-bold">オールイン!</div>
                      )}

                      {/* Player Cards */}
                      {player.userId === user.id && player.cards.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {player.cards.map((card) => (
                            <div
                              key={card.id}
                              className="w-10 h-14 bg-white rounded shadow flex items-center justify-center text-sm"
                            >
                              <div className={card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-black'}>
                                {card.rank}{card.suit}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Winner Display */}
                {gameState.phase === 'finished' && gameState.winners && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-6 p-6 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg"
                  >
                    <h3 className="text-white text-xl font-bold mb-2">勝者!</h3>
                    {gameState.winners.map((winner, idx) => (
                      <div key={idx} className="text-white">
                        {winner.username}: {winner.amount} チップ ({winner.handDescription})
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              {myTurn && gameState.phase !== 'finished' && gameState.phase !== 'waiting' && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
                >
                  <div className="text-white text-lg font-bold mb-4 text-center">
                    あなたのターンです！
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => performAction('fold')}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                    >
                      フォールド
                    </button>
                    
                    {canCheck() && (
                      <button
                        onClick={() => performAction('check')}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                      >
                        チェック
                      </button>
                    )}
                    
                    {canCall() && (
                      <button
                        onClick={() => performAction('call')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                      >
                        コール ({getCallAmount()})
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowRaiseInput(!showRaiseInput)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                    >
                      レイズ
                    </button>
                    
                    <button
                      onClick={() => performAction('all-in')}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold col-span-2"
                    >
                      オールイン ({currentPlayer?.chips})
                    </button>
                  </div>

                  {showRaiseInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 p-4 bg-white/10 rounded-lg"
                    >
                      <div className="text-white mb-2">
                        レイズ額: {raiseAmount} (最小: {getMinRaise()})
                      </div>
                      <input
                        type="range"
                        min={getMinRaise()}
                        max={currentPlayer?.chips || 0}
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                        className="w-full mb-3"
                      />
                      <button
                        onClick={() => {
                          performAction('raise', raiseAmount);
                          setShowRaiseInput(false);
                        }}
                        className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                      >
                        レイズ実行
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Chat Sidebar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">チャット</h3>
              <div className="space-y-2 mb-4 h-64 overflow-y-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className="bg-white/10 p-2 rounded">
                    <div className="text-white/70 text-sm">{msg.username}</div>
                    <div className="text-white">{msg.message}</div>
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="メッセージを入力..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    sendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
