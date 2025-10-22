'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaEye, FaUsers, FaComment, FaGift, FaHeart, FaGem, FaCrown, FaFire } from 'react-icons/fa';

interface Spectator {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isVip: boolean;
}

interface Gift {
  id: string;
  name: string;
  price: number;
  icon: string;
  effect: string;
}

interface Comment {
  id: string;
  user: Spectator;
  message: string;
  timestamp: Date;
  gifts?: Gift[];
}

interface SpectatorUIProps {
  spectators: Spectator[];
  comments: Comment[];
  onSendComment: (message: string) => void;
  onSendGift: (giftId: string, recipientId: string) => void;
  isVisible: boolean;
}

export default function SpectatorUI({
  spectators,
  comments,
  onSendComment,
  onSendGift,
  isVisible
}: SpectatorUIProps) {
  const [commentInput, setCommentInput] = useState('');
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [recentGifts, setRecentGifts] = useState<Array<{gift: Gift, user: Spectator, target: string}>>([]);

  const gifts: Gift[] = [
    { id: 'heart', name: 'ハート', price: 10, icon: '❤️', effect: 'ハートエフェクト' },
    { id: 'rose', name: 'バラ', price: 50, icon: '🌹', effect: 'バラの花びら' },
    { id: 'crown', name: '王冠', price: 100, icon: '👑', effect: '王冠エフェクト' },
    { id: 'gem', name: '宝石', price: 200, icon: '💎', effect: '宝石の煌めき' },
    { id: 'fire', name: '炎', price: 500, icon: '🔥', effect: '炎の演出' },
    { id: 'rainbow', name: 'レインボー', price: 1000, icon: '🌈', effect: '虹のアニメーション' }
  ];

  // ギフト送信エフェクト
  useEffect(() => {
    if (recentGifts.length > 0) {
      const timer = setTimeout(() => {
        setRecentGifts(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recentGifts]);

  const handleSendComment = () => {
    if (commentInput.trim()) {
      onSendComment(commentInput.trim());
      setCommentInput('');
    }
  };

  const handleSendGift = (giftId: string) => {
    // 実際の実装では受信者を選択するUIが必要
    onSendGift(giftId, 'player1');
    setRecentGifts(prev => [...prev, {
      gift: gifts.find(g => g.id === giftId)!,
      user: { id: 'me', name: 'あなた', avatar: '', level: 1, isVip: false },
      target: 'Player1'
    }]);
    setShowGiftMenu(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* 観戦者情報バー */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-gray-600 pointer-events-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FaEye className="text-green-400" />
            <span className="text-white font-semibold">{spectators.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaUsers className="text-blue-400" />
            <span className="text-white text-sm">観戦中</span>
          </div>
        </div>
        
        {/* 観戦者アバター一覧 */}
        <div className="flex space-x-2 mt-3">
          {spectators.slice(0, 8).map((spectator) => (
            <div key={spectator.id} className="relative">
              <Image
                src={spectator.avatar}
                alt={spectator.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border-2 border-gray-600"
              />
              {spectator.isVip && (
                <FaCrown className="absolute -top-1 -right-1 text-yellow-400 text-xs" />
              )}
            </div>
          ))}
          {spectators.length > 8 && (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
              +{spectators.length - 8}
            </div>
          )}
        </div>
      </div>

      {/* チャット・コメントエリア */}
      <div className="absolute bottom-4 left-4 w-80 bg-black/80 backdrop-blur-sm rounded-xl border border-gray-600 pointer-events-auto">
        {/* チャットヘッダー */}
        <div className="p-3 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaComment className="text-green-400" />
              <span className="text-white font-semibold">観戦チャット</span>
            </div>
            <button
              onClick={() => setShowGiftMenu(!showGiftMenu)}
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              <FaGift className="text-lg" />
            </button>
          </div>
        </div>

        {/* コメント表示エリア */}
        <div className="h-48 overflow-y-auto p-3 space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-2">
              <Image
                src={comment.user.avatar}
                alt={comment.user.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full border border-gray-600"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm">{comment.user.name}</span>
                  {comment.user.isVip && <FaCrown className="text-yellow-400 text-xs" />}
                  <span className="text-gray-400 text-xs">
                    {comment.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">{comment.message}</div>
                {comment.gifts && comment.gifts.length > 0 && (
                  <div className="flex space-x-1 mt-1">
                    {comment.gifts.map((gift) => (
                      <span key={gift.id} className="text-lg">{gift.icon}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* コメント入力 */}
        <div className="p-3 border-t border-gray-600">
          <div className="flex space-x-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="コメントを入力..."
              className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button
              onClick={handleSendComment}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              送信
            </button>
          </div>
        </div>
      </div>

      {/* ギフトメニュー */}
      {showGiftMenu && (
        <div className="absolute bottom-20 left-4 bg-black/95 backdrop-blur-sm rounded-xl p-4 border border-gray-600 shadow-2xl pointer-events-auto">
          <div className="text-white font-semibold mb-3">ギフト選択</div>
          <div className="grid grid-cols-2 gap-3">
            {gifts.map((gift) => (
              <button
                key={gift.id}
                onClick={() => handleSendGift(gift.id)}
                className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{gift.icon}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{gift.name}</div>
                    <div className="text-gray-400 text-xs">{gift.effect}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-green-400 font-bold text-sm">
                  <FaGem className="text-blue-400" />
                  <span>{gift.price}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ギフトエフェクト */}
      {recentGifts.map((giftData, index) => (
        <div
          key={index}
          className="absolute inset-0 pointer-events-none animate-gift-effect"
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl animate-bounce">
              {giftData.gift.icon}
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 text-white font-bold text-center">
            <div>{giftData.user.name} → {giftData.target}</div>
            <div className="text-green-400">{giftData.gift.name}を贈りました！</div>
          </div>
        </div>
      ))}
    </div>
  );
}
