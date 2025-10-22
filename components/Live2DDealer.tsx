'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaHeart, FaGem, FaCrown } from 'react-icons/fa';

interface DealerOutfit {
  id: string;
  name: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
}

interface Live2DDealerProps {
  gameEvent: 'deal' | 'win' | 'lose' | 'fold' | 'raise' | 'all-in' | 'idle';
  isPremium?: boolean;
  currentOutfit?: string;
  onOutfitChange?: (outfitId: string) => void;
}

export default function Live2DDealer({
  gameEvent,
  isPremium = false,
  currentOutfit = 'default',
  onOutfitChange
}: Live2DDealerProps) {
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [speechBubble, setSpeechBubble] = useState('');
  const [showOutfitMenu, setShowOutfitMenu] = useState(false);
  const [dealerAnimation, setDealerAnimation] = useState('idle');

  const outfits: DealerOutfit[] = [
    {
      id: 'default',
      name: 'デフォルト',
      price: 0,
      rarity: 'common',
      image: '/dealer-outfits/default.png'
    },
    {
      id: 'elegant',
      name: 'エレガントドレス',
      price: 500,
      rarity: 'rare',
      image: '/dealer-outfits/elegant.png'
    },
    {
      id: 'casino',
      name: 'カジノスタッフ',
      price: 1000,
      rarity: 'epic',
      image: '/dealer-outfits/casino.png'
    },
    {
      id: 'royal',
      name: 'ロイヤルドレス',
      price: 2500,
      rarity: 'legendary',
      image: '/dealer-outfits/royal.png'
    }
  ];

  const dealerDialogue = useCallback(() => ({
    deal: ['カードを配ります', '新しいハンドの開始です', '運命のカードが配られます'],
    win: ['おめでとうございます！', '素晴らしい勝利です！', '見事なプレイでした！'],
    lose: ['残念でした...', '次回は頑張りましょう', '運も実力のうちです'],
    fold: ['慎重な判断ですね', '安全な選択です', '次のハンドに期待しましょう'],
    raise: ['大胆なレイズですね！', '盛り上がってきました！', 'スリル満点です！'],
    'all-in': ['オールイン！', '全てをかけた勝負！', '究極の選択です！'],
    idle: ['皆様、お待ちしております', '素敵なゲームを楽しんでください', '何かお手伝いできることは？']
  }), []);

  useEffect(() => {
    const emotions = {
      deal: 'happy',
      win: 'excited',
      lose: 'sad',
      fold: 'neutral',
      raise: 'surprised',
      'all-in': 'excited',
      idle: 'neutral'
    };

    setCurrentEmotion(emotions[gameEvent] || 'neutral');
    
    // アニメーション設定
    const animations = {
      deal: 'deal-cards',
      win: 'victory',
      lose: 'disappointed',
      fold: 'nod',
      raise: 'surprised',
      'all-in': 'excited',
      idle: 'idle'
    };

    setDealerAnimation(animations[gameEvent] || 'idle');

    // セリフ表示
    const dialogue = dealerDialogue()[gameEvent];
    if (dialogue) {
      const randomDialogue = dialogue[Math.floor(Math.random() * dialogue.length)];
      setSpeechBubble(randomDialogue);
      
      // 3秒後にセリフを消す
      setTimeout(() => setSpeechBubble(''), 3000);
    }
  }, [gameEvent, dealerDialogue]);

  const getOutfitRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getOutfitRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-800 border-gray-600';
      case 'rare': return 'bg-blue-900/50 border-blue-500';
      case 'epic': return 'bg-purple-900/50 border-purple-500';
      case 'legendary': return 'bg-yellow-900/50 border-yellow-500';
      default: return 'bg-gray-800 border-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* ディーラーキャラクター */}
      <div className="relative">
        {/* Live2Dキャラクター */}
        <div 
          className={`w-48 h-64 relative cursor-pointer transition-all duration-500 ${
            dealerAnimation === 'victory' ? 'animate-bounce' :
            dealerAnimation === 'excited' ? 'animate-pulse' :
            dealerAnimation === 'surprised' ? 'animate-shake' :
            'animate-float'
          }`}
          onClick={() => setShowOutfitMenu(!showOutfitMenu)}
        >
          {/* キャラクター背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl border-2 border-pink-400 shadow-2xl">
            {/* 表情エフェクト */}
            <div className={`absolute top-4 left-4 w-8 h-8 rounded-full ${
              currentEmotion === 'happy' ? 'bg-yellow-400 animate-pulse' :
              currentEmotion === 'excited' ? 'bg-blue-400 animate-bounce' :
              currentEmotion === 'sad' ? 'bg-blue-400' :
              currentEmotion === 'surprised' ? 'bg-orange-400 animate-ping' :
              'bg-gray-400'
            }`}></div>

            {/* プレミアムバッジ */}
            {isPremium && (
              <div className="absolute top-2 right-2">
                <FaCrown className="text-yellow-400 text-lg animate-pulse" />
              </div>
            )}

            {/* キャラクター画像プレースホルダー */}
            <div className="absolute inset-4 bg-white/20 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">👩‍💼</div>
                <div className="text-sm font-semibold">Live2D ディーラー</div>
                <div className="text-xs opacity-75">{currentOutfit}</div>
              </div>
            </div>

            {/* 衣装エフェクト */}
            {currentOutfit === 'royal' && (
              <div className="absolute inset-0">
                <span className="absolute top-2 left-2 text-yellow-400 animate-pulse text-lg">✨</span>
                <span className="absolute bottom-2 right-2 text-yellow-400 animate-pulse text-lg" style={{ animationDelay: '0.5s' }}>✨</span>
                <span className="absolute top-1/2 left-2 text-yellow-400 animate-pulse text-lg" style={{ animationDelay: '1s' }}>✨</span>
              </div>
            )}
          </div>

          {/* セリフバブル */}
          {speechBubble && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg border border-gray-600 shadow-lg animate-fade-in">
              <div className="text-sm font-semibold">{speechBubble}</div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
              </div>
            </div>
          )}

          {/* ハートエフェクト（勝利時） */}
          {gameEvent === 'win' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <FaHeart
                  key={i}
                  className="absolute text-pink-400 animate-float"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 10}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          )}

          {/* ジェムエフェクト（オールイン時） */}
          {gameEvent === 'all-in' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <FaGem
                  key={i}
                  className="absolute text-blue-400 animate-bounce"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${20 + i * 15}%`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 衣装メニュー */}
        {showOutfitMenu && (
          <div className="absolute bottom-full right-0 mb-4 bg-black/95 backdrop-blur-sm rounded-xl p-4 border border-gray-600 shadow-2xl min-w-64">
            <div className="text-white font-semibold mb-3">衣装選択</div>
            <div className="space-y-2">
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    currentOutfit === outfit.id ? 'bg-green-900/50 border-green-500' : getOutfitRarityBg(outfit.rarity)
                  } hover:bg-gray-700/50`}
                  onClick={() => onOutfitChange?.(outfit.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-xs">
                      {outfit.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{outfit.name}</div>
                      <div className={`text-xs ${getOutfitRarityColor(outfit.rarity)}`}>
                        {outfit.rarity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">
                      {outfit.price === 0 ? 'FREE' : `$${outfit.price}`}
                    </div>
                    {outfit.price > 0 && (
                      <div className="text-xs text-gray-400 flex items-center space-x-1">
                        <FaGem className="text-blue-400" />
                        <span>{outfit.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* インタラクション表示 */}
      <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded-lg border border-gray-600 text-sm">
        <div className="text-center">
          <div className="text-green-400 font-semibold">タップ</div>
          <div className="text-xs">衣装変更</div>
        </div>
      </div>
    </div>
  );
}
