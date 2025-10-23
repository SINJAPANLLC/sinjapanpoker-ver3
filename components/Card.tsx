import { Card as CardType } from '@/types';
import Image from 'next/image';

interface CardProps {
  card: CardType;
  faceUp?: boolean;
  className?: string;
  enable3D?: boolean;
}

function getCardImagePath(card: CardType): string {
  const rankMap: { [key: string]: string } = {
    'A': 'ace',
    'K': 'king',
    'Q': 'queen',
    'J': 'jack',
    '10': '10',
    '9': '9',
    '8': '8',
    '7': '7',
    '6': '6',
    '5': '5',
    '4': '4',
    '3': '3',
    '2': '2',
  };

  const rank = rankMap[card.rank] || card.rank.toLowerCase();
  return `/cards/${rank}_of_${card.suit}.png`;
}

export default function Card({ card, faceUp = false, className = '', enable3D = false }: CardProps) {
  // 3D回転モード（裏面と表面を両方レンダリング）
  if (enable3D) {
    return (
      <div className={`relative w-20 h-28 ${className}`} style={{ transformStyle: 'preserve-3d' }}>
        {/* 裏面 */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <Image
            src="/cards/card-back.png"
            alt="Card back"
            fill
            unoptimized
            priority
            className="object-contain"
            style={{ padding: '2px' }}
          />
        </div>
        
        {/* 表面 */}
        <div 
          className="absolute inset-0 bg-white rounded-lg border-2 border-gray-300 shadow-lg"
          style={{
            backfaceVisibility: 'hidden'
          }}
        >
          <Image
            src={getCardImagePath(card)}
            alt={`${card.rank} of ${card.suit}`}
            fill
            unoptimized
            priority
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  // 通常モード
  if (!faceUp) {
    return (
      <div className={`relative w-20 h-28 rounded-lg overflow-hidden shadow-lg ${className}`}>
        <Image
          src="/cards/card-back.png"
          alt="Card back"
          fill
          unoptimized
          priority
          className="object-contain"
          style={{ padding: '2px' }}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-20 h-28 bg-white rounded-lg border-2 border-gray-300 shadow-lg ${className}`}>
      <Image
        src={getCardImagePath(card)}
        alt={`${card.rank} of ${card.suit}`}
        fill
        unoptimized
        priority
        className="object-contain"
      />
    </div>
  );
}
