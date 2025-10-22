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

      {/* 右角 - チャットアイコン */}
      <button className="absolute top-4 right-4 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-xl flex items-center justify-center text-white transition-colors backdrop-blur-sm">
        <MessageCircle className="w-6 h-6" />
      </button>

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
