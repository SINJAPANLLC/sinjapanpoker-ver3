'use client';

import { Menu, MessageCircle } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';

export default function ActiveGamePage() {
  const communityCards: CardType[] = [
    { rank: 'A' as Rank, suit: 'spades' as Suit, id: 'card-1' },
    { rank: 'K' as Rank, suit: 'hearts' as Suit, id: 'card-2' },
    { rank: 'Q' as Rank, suit: 'diamonds' as Suit, id: 'card-3' },
    { rank: 'J' as Rank, suit: 'clubs' as Suit, id: 'card-4' },
    { rank: '10' as Rank, suit: 'spades' as Suit, id: 'card-5' },
  ];

  const players = [
    { 
      name: 'プレイヤー1', 
      chips: 5000,
      cards: [
        { rank: 'A' as Rank, suit: 'hearts' as Suit, id: 'p1-card-1' },
        { rank: 'K' as Rank, suit: 'diamonds' as Suit, id: 'p1-card-2' },
      ]
    },
    { 
      name: 'プレイヤー2', 
      chips: 8500,
      cards: [
        { rank: 'Q' as Rank, suit: 'clubs' as Suit, id: 'p2-card-1' },
        { rank: 'J' as Rank, suit: 'spades' as Suit, id: 'p2-card-2' },
      ]
    },
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-10">
        {/* アバターアイコン - Aと10の上のみ */}
        <div className="flex gap-3 justify-center mb-6">
          {communityCards.map((card, index) => (
            <div key={`avatar-${card.id}`} className="w-20 flex justify-center">
              {(index === 0 || index === 4) && (
                <div className="relative">
                  {/* ハンドカード - プレイヤー1は右側、プレイヤー2は左側 */}
                  <div className={`absolute top-1/2 transform -translate-y-1/2 ${index === 0 ? '-right-12' : '-left-12'}`}>
                    <div className="flex items-end" style={{ perspective: '400px' }}>
                      {players[index === 0 ? 0 : 1].cards.map((handCard, cardIndex) => (
                        <div
                          key={handCard.id}
                          className="relative"
                          style={{
                            transform: `rotate(${cardIndex === 0 ? '-10deg' : '10deg'}) translateY(${cardIndex === 0 ? '2px' : '2px'})`,
                            marginLeft: cardIndex === 1 ? '-28px' : '0',
                            zIndex: cardIndex,
                          }}
                        >
                          <div className="scale-[0.35] origin-center">
                            <Card card={handCard} faceUp={false} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* アバターアイコン */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-5xl border-4 border-white shadow-lg">
                    👤
                  </div>
                  
                  {/* ユーザー情報（アバターの下部に被せる） */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border-2 border-white/30 shadow-lg min-w-[100px] z-10">
                    <p className="text-white text-xs font-bold text-center whitespace-nowrap">
                      {players[index === 0 ? 0 : 1].name}
                    </p>
                    <p className="text-yellow-400 text-xs font-semibold text-center whitespace-nowrap">
                      {players[index === 0 ? 0 : 1].chips.toLocaleString()} チップ
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* カード */}
        <div className="flex gap-3">
          {communityCards.map((card) => (
            <Card key={card.id} card={card} faceUp={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
