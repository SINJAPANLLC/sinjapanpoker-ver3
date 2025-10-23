import { Card as CardType } from '@/types';
import Image from 'next/image';

interface CardProps {
  card: CardType;
  faceUp?: boolean;
  className?: string;
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

export default function Card({ card, faceUp = false, className = '' }: CardProps) {
  if (!faceUp) {
    return (
      <div className={`relative w-20 h-28 bg-white rounded-lg border-2 border-gray-300 shadow-lg ${className}`}>
        <Image
          src="/cards/card-back.png"
          alt="Card back"
          fill
          className="object-cover rounded-lg"
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
        className="object-contain"
      />
    </div>
  );
}
