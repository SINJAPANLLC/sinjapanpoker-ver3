'use client';

import { User } from 'lucide-react';
import Card from '@/components/Card';
import { Card as CardType, Suit, Rank } from '@/types';

export default function ActiveGamePage() {
  const communityCards: CardType[] = [
    { rank: 'A' as Rank, suit: 'spades' as Suit, id: 'comm-1' },
    { rank: 'K' as Rank, suit: 'hearts' as Suit, id: 'comm-2' },
    { rank: 'Q' as Rank, suit: 'diamonds' as Suit, id: 'comm-3' },
    { rank: 'J' as Rank, suit: 'clubs' as Suit, id: 'comm-4' },
    { rank: '10' as Rank, suit: 'spades' as Suit, id: 'comm-5' },
  ];

  const players = [
    { id: 1, name: 'プレイヤー1', chips: 5000, cardSide: 'right' as const, cards: [
      { rank: 'A' as Rank, suit: 'hearts' as Suit, id: 'p1-card-1' },
      { rank: 'K' as Rank, suit: 'diamonds' as Suit, id: 'p1-card-2' },
    ]},
    { id: 2, name: 'プレイヤー2', chips: 8500, cardSide: 'right' as const, cards: [
      { rank: 'Q' as Rank, suit: 'clubs' as Suit, id: 'p2-card-1' },
      { rank: 'J' as Rank, suit: 'spades' as Suit, id: 'p2-card-2' },
    ]},
    { id: 3, name: 'プレイヤー3', chips: 12000, cardSide: 'right' as const, cards: [
      { rank: '10' as Rank, suit: 'hearts' as Suit, id: 'p3-card-1' },
      { rank: '9' as Rank, suit: 'diamonds' as Suit, id: 'p3-card-2' },
    ]},
    { id: 4, name: 'プレイヤー4', chips: 6200, cardSide: 'right' as const, cards: [
      { rank: '8' as Rank, suit: 'clubs' as Suit, id: 'p4-card-1' },
      { rank: '7' as Rank, suit: 'spades' as Suit, id: 'p4-card-2' },
    ]},
    { id: 5, name: 'プレイヤー5', chips: 9800, cardSide: 'right' as const, cards: [
      { rank: '6' as Rank, suit: 'hearts' as Suit, id: 'p5-card-1' },
      { rank: '5' as Rank, suit: 'diamonds' as Suit, id: 'p5-card-2' },
    ]},
    { id: 6, name: 'プレイヤー6', chips: 7500, cardSide: 'left' as const, cards: [
      { rank: '4' as Rank, suit: 'clubs' as Suit, id: 'p6-card-1' },
      { rank: '3' as Rank, suit: 'spades' as Suit, id: 'p6-card-2' },
    ]},
    { id: 7, name: 'プレイヤー7', chips: 11000, cardSide: 'left' as const, cards: [
      { rank: '2' as Rank, suit: 'hearts' as Suit, id: 'p7-card-1' },
      { rank: 'A' as Rank, suit: 'clubs' as Suit, id: 'p7-card-2' },
    ]},
    { id: 8, name: 'プレイヤー8', chips: 4500, cardSide: 'left' as const, cards: [
      { rank: 'K' as Rank, suit: 'spades' as Suit, id: 'p8-card-1' },
      { rank: 'Q' as Rank, suit: 'hearts' as Suit, id: 'p8-card-2' },
    ]},
    { id: 9, name: 'プレイヤー9', chips: 8200, cardSide: 'left' as const, cards: [
      { rank: 'J' as Rank, suit: 'diamonds' as Suit, id: 'p9-card-1' },
      { rank: '10' as Rank, suit: 'clubs' as Suit, id: 'p9-card-2' },
    ]},
  ];

  const PlayerComponent = ({ player }: { player: typeof players[0] }) => (
    <div className="relative">
      {/* ハンドカード - アバターに重ねる */}
      <div className={`absolute top-1/2 transform -translate-y-1/2 ${
        player.cardSide === 'right' 
          ? 'right-0 translate-x-1/2' 
          : 'left-0 -translate-x-1/2'
      }`}>
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
      <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
        <User className="w-10 h-10 text-white" strokeWidth={2} />
      </div>
      
      {/* ユーザー情報（アバターの下部に被せる） */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-gradient-to-br from-cyan-400 to-blue-600 backdrop-blur-sm px-2 py-1 rounded-lg border-2 border-white/30 shadow-lg min-w-[90px] z-10">
        <p className="text-white text-[10px] font-bold text-center whitespace-nowrap">
          {player.name}
        </p>
        <p className="text-white text-[10px] font-semibold text-center whitespace-nowrap">
          {player.chips.toLocaleString()}
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
      {/* コミュニティカード - プレイヤー3と8の下（中央） */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-2">
          {communityCards.map((card) => (
            <div key={card.id} className="scale-75">
              <Card card={card} faceUp={true} />
            </div>
          ))}
        </div>
      </div>

      {/* プレイヤー1 - 中央下 */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
        <PlayerComponent player={players[0]} />
      </div>

      {/* プレイヤー2 - 左下 */}
      <div className="absolute bottom-72 left-6">
        <PlayerComponent player={players[1]} />
      </div>

      {/* プレイヤー3 - 左中 */}
      <div className="absolute top-[40%] left-6 transform -translate-y-1/2">
        <PlayerComponent player={players[2]} />
      </div>

      {/* プレイヤー4 - 左上 */}
      <div className="absolute top-44 left-6">
        <PlayerComponent player={players[3]} />
      </div>

      {/* プレイヤー5 - 上左 */}
      <div className="absolute top-6 left-1/4 transform -translate-x-1/2">
        <PlayerComponent player={players[4]} />
      </div>

      {/* プレイヤー6 - 上右 */}
      <div className="absolute top-6 right-1/4 transform translate-x-1/2">
        <PlayerComponent player={players[5]} />
      </div>

      {/* プレイヤー7 - 右上 */}
      <div className="absolute top-44 right-6">
        <PlayerComponent player={players[6]} />
      </div>

      {/* プレイヤー8 - 右中 */}
      <div className="absolute top-[40%] right-6 transform -translate-y-1/2">
        <PlayerComponent player={players[7]} />
      </div>

      {/* プレイヤー9 - 右下 */}
      <div className="absolute bottom-72 right-6">
        <PlayerComponent player={players[8]} />
      </div>
    </div>
  );
}
