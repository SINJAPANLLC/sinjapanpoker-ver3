'use client';

import { User } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';

export default function ActiveGamePage() {
  const player1Cards: CardType[] = [
    { rank: 'A' as Rank, suit: 'hearts' as Suit, id: 'p1-card-1' },
    { rank: 'K' as Rank, suit: 'diamonds' as Suit, id: 'p1-card-2' },
  ];

  const player2Cards: CardType[] = [
    { rank: 'Q' as Rank, suit: 'clubs' as Suit, id: 'p2-card-1' },
    { rank: 'J' as Rank, suit: 'spades' as Suit, id: 'p2-card-2' },
  ];

  return (
    <div 
      className="relative w-full h-screen flex flex-col items-center justify-end"
      style={{
        backgroundImage: 'url(/poker-table-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: '55% 32%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* プレイヤー配置 - 画面下部に横並び */}
      <div className="flex gap-8 pb-20">
        {/* プレイヤー1 */}
        <div className="relative">
          {/* ハンドカード - アバターに重ねる */}
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <div className="flex items-end" style={{ perspective: '400px' }}>
              {player1Cards.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="relative"
                  style={{
                    transform: `rotate(${cardIndex === 0 ? '-10deg' : '10deg'})`,
                    marginLeft: cardIndex === 1 ? '-60px' : '0',
                    zIndex: cardIndex,
                  }}
                >
                  <div className="scale-[0.35] origin-center">
                    <Card card={card} faceUp={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* アバターアイコン */}
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <User className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
          
          {/* ユーザー情報（アバターの下部に被せる） */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-gradient-to-br from-cyan-400 to-blue-600 backdrop-blur-sm px-3 py-1.5 rounded-lg border-2 border-white/30 shadow-lg min-w-[100px] z-10">
            <p className="text-white text-xs font-bold text-center whitespace-nowrap">
              プレイヤー1
            </p>
            <p className="text-white text-xs font-semibold text-center whitespace-nowrap">
              5,000 チップ
            </p>
          </div>
        </div>

        {/* プレイヤー2 */}
        <div className="relative">
          {/* ハンドカード - アバターに重ねる */}
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
            <div className="flex items-end" style={{ perspective: '400px' }}>
              {player2Cards.map((card, cardIndex) => (
                <div
                  key={card.id}
                  className="relative"
                  style={{
                    transform: `rotate(${cardIndex === 0 ? '-10deg' : '10deg'})`,
                    marginLeft: cardIndex === 1 ? '-60px' : '0',
                    zIndex: cardIndex,
                  }}
                >
                  <div className="scale-[0.35] origin-center">
                    <Card card={card} faceUp={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* アバターアイコン */}
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <User className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
          
          {/* ユーザー情報（アバターの下部に被せる） */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-gradient-to-br from-cyan-400 to-blue-600 backdrop-blur-sm px-3 py-1.5 rounded-lg border-2 border-white/30 shadow-lg min-w-[100px] z-10">
            <p className="text-white text-xs font-bold text-center whitespace-nowrap">
              プレイヤー2
            </p>
            <p className="text-white text-xs font-semibold text-center whitespace-nowrap">
              8,500 チップ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
