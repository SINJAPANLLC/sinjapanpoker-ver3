'use client';

import { User } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';

export default function ActiveGamePage() {
  const players = [
    {
      id: 1,
      name: 'プレイヤー1',
      chips: 5000,
      cards: [
        { rank: 'A' as Rank, suit: 'hearts' as Suit, id: 'p1-card-1' },
        { rank: 'K' as Rank, suit: 'diamonds' as Suit, id: 'p1-card-2' },
      ]
    },
    {
      id: 2,
      name: 'プレイヤー2',
      chips: 8500,
      cards: [
        { rank: 'Q' as Rank, suit: 'clubs' as Suit, id: 'p2-card-1' },
        { rank: 'J' as Rank, suit: 'spades' as Suit, id: 'p2-card-2' },
      ]
    },
    {
      id: 3,
      name: 'プレイヤー3',
      chips: 12000,
      cards: [
        { rank: '10' as Rank, suit: 'hearts' as Suit, id: 'p3-card-1' },
        { rank: '9' as Rank, suit: 'diamonds' as Suit, id: 'p3-card-2' },
      ]
    },
    {
      id: 4,
      name: 'プレイヤー4',
      chips: 6200,
      cards: [
        { rank: '8' as Rank, suit: 'clubs' as Suit, id: 'p4-card-1' },
        { rank: '7' as Rank, suit: 'spades' as Suit, id: 'p4-card-2' },
      ]
    },
  ];

  const PlayerComponent = ({ player }: { player: typeof players[0] }) => (
    <div className="relative">
      {/* ハンドカード - アバターに重ねる */}
      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
        <div className="flex items-end" style={{ perspective: '400px' }}>
          {player.cards.map((card, cardIndex) => (
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
          {player.name}
        </p>
        <p className="text-white text-xs font-semibold text-center whitespace-nowrap">
          {player.chips.toLocaleString()} チップ
        </p>
      </div>
    </div>
  );

  return (
    <div 
      className="relative w-full h-screen"
      style={{
        backgroundImage: 'url(/poker-table-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: '55% 32%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* プレイヤー1 - 中央下 */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <PlayerComponent player={players[0]} />
      </div>

      {/* プレイヤー2 - 左上 */}
      <div className="absolute top-64 left-10">
        <PlayerComponent player={players[1]} />
      </div>

      {/* プレイヤー3 - 2の上 */}
      <div className="absolute top-40 left-10">
        <PlayerComponent player={players[2]} />
      </div>

      {/* プレイヤー4 - 3の上 */}
      <div className="absolute top-16 left-10">
        <PlayerComponent player={players[3]} />
      </div>
    </div>
  );
}
