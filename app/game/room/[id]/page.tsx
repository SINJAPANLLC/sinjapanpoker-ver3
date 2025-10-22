'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import PokerTableOctagon from '@/components/PokerTableOctagon';
import { FaBars, FaChartBar } from 'react-icons/fa';
import { ShoppingCart, MessageCircle, Share2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Player {
  id: string;
  name: string;
  chips: number;
  position: number;
  isHost?: boolean;
  isActive?: boolean;
}

function GameRoomContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameId] = useState(params?.id as string);
  const [gameType] = useState('NLH 720/ボム');
  const [blinds] = useState('0.1/0.2');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // 初期プレイヤー設定（ホストとして参加）
    setPlayers([
      {
        id: user.id,
        name: user.username,
        chips: user.chips,
        position: 0,
        isHost: true,
        isActive: true,
      },
    ]);
  }, [user, router]);

  const handlePlayerJoin = (position: number) => {
    if (!user) return;

    // モックプレイヤーを追加
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: `Player${position + 1}`,
      chips: 10000,
      position,
      isActive: true,
    };

    setPlayers(prev => [...prev, newPlayer]);
  };

  const handlePlayerLeave = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const handleSendChat = () => {
    if (chatInput.trim() && user) {
      const newMessage = {
        id: Date.now(),
        userId: user.id,
        username: user.username,
        message: chatInput,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 上部バー */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* 左側 - ハンバーガーメニュー */}
            <button className="text-white hover:text-green-400 transition-colors">
              <FaBars className="text-xl" />
            </button>

            {/* 中央 - ゲームタイプ選択 */}
            <div className="flex items-center space-x-3">
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center space-x-2">
                <span>{gameType}</span>
                <FaBars className="text-sm" />
              </button>
            </div>

            {/* 右側 - 統計とショップ */}
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-green-400 transition-colors">
                <FaChartBar className="text-xl" />
              </button>
              <button className="text-white hover:text-green-400 transition-colors">
                <ShoppingCart className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインゲームエリア */}
      <div className="relative flex-1 min-h-[calc(100vh-200px)]">
        {/* ポーカーテーブル */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PokerTableOctagon
            players={players}
            gameId={gameId}
            gameType={gameType}
            blinds={blinds}
            onPlayerJoin={handlePlayerJoin}
            onPlayerLeave={handlePlayerLeave}
          />
        </div>

        {/* チャットパネル */}
        {showChat && (
          <div className="absolute right-4 top-4 bottom-20 w-80 bg-black/80 backdrop-blur-sm rounded-lg border border-green-400/30 flex flex-col">
            <div className="p-4 border-b border-green-400/30">
              <div className="flex justify-between items-center">
                <h3 className="text-green-400 font-bold">チャット</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="bg-gray-800/50 rounded p-2">
                  <div className="text-green-400 font-semibold text-sm">{msg.username}</div>
                  <div className="text-white text-sm">{msg.message}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-green-400/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSendChat}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded transition"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 下部バー */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* 左側 - スペードアイコン */}
            <button className="text-green-400 hover:text-green-300 transition-colors">
              <span className="text-2xl">♠️</span>
            </button>

            {/* 中央 - ゲーム情報 */}
            <div className="text-center text-white">
              <div className="text-sm opacity-80">プレイヤー待機中</div>
              <div className="text-xs opacity-60">2人以上でゲーム開始</div>
            </div>

            {/* 右側 - チャットとシェア */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="text-white hover:text-green-400 transition-colors"
              >
                <MessageCircle className="text-xl" />
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition-colors flex items-center space-x-2">
                <Share2 className="text-sm" />
                <span>シェア</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 戻るボタン */}
      <button
        onClick={() => router.push('/lobby')}
        className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg transition-colors"
      >
        ← ロビーに戻る
      </button>
    </div>
  );
}

export default function GameRoomPage() {
  return (
    <ProtectedRoute>
      <GameRoomContent />
    </ProtectedRoute>
  );
}
