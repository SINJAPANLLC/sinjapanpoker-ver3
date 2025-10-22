'use client';

import { Menu, MessageCircle } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType } from '@/types';

export default function ActiveGamePage() {
  const communityCards: CardType[] = [
    { rank: 'A', suit: 'spades', id: 'card-1' },
    { rank: 'K', suit: 'hearts', id: 'card-2' },
    { rank: 'Q', suit: 'diamonds', id: 'card-3' },
    { rank: 'J', suit: 'clubs', id: 'card-4' },
    { rank: '10', suit: 'spades', id: 'card-5' },
  ];

  const avatars = [
    { id: 1, position: 'top-1/4 left-1/4', image: '👤' },
    { id: 2, position: 'top-1/4 left-1/2 -translate-x-1/2', image: '👤' },
    { id: 3, position: 'top-1/4 right-1/4', image: '👤' },
    { id: 4, position: 'top-1/2 -translate-y-1/2 right-12', image: '👤' },
    { id: 5, position: 'bottom-1/4 right-1/4', image: '👤' },
    { id: 6, position: 'bottom-1/4 right-1/2 translate-x-1/2', image: '👤' },
    { id: 7, position: 'bottom-1/4 left-1/4', image: '👤' },
    { id: 8, position: 'top-1/2 -translate-y-1/2 left-12', image: '👤' },
    { id: 9, position: 'top-1/3 left-1/3', image: '👤' },
  ];

  return (
    <div 
      className="relative min-h-screen w-full"
      style={{
        backgroundImage: 'url(/poker-table-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: '55% 32%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 左角 - メニューアイコン */}
      <button className="absolute top-4 left-4 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center text-white transition-colors backdrop-blur-sm">
        <Menu className="w-6 h-6" />
      </button>

      {/* 画面上部中央 - ゲームフェーズ */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 rounded-full border-4 border-white shadow-2xl">
          <p className="text-white font-bold text-xl tracking-wide">フロップ</p>
        </div>
      </div>

      {/* 右角 - チャットアイコン */}
      <button className="absolute top-4 right-4 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center text-white transition-colors backdrop-blur-sm">
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* アバターアイコン */}
      {avatars.map((avatar) => (
        <div
          key={avatar.id}
          className={`absolute ${avatar.position} w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg`}
        >
          {avatar.image}
        </div>
      ))}

      {/* コミュニティカード - ロゴの下 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20">
        <div className="flex gap-3">
          {communityCards.map((card) => (
            <Card key={card.id} card={card} faceUp={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
