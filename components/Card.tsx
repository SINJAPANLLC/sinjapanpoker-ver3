import { Card as CardType } from '@/types';

interface CardProps {
  card: CardType;
  faceUp?: boolean;
  className?: string;
}

const suitSymbols: { [key: string]: string } = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: { [key: string]: string } = {
  hearts: 'text-blue-600',
  diamonds: 'text-blue-600',
  clubs: 'text-gray-800',
  spades: 'text-gray-800',
};

export default function Card({ card, faceUp = false, className = '' }: CardProps) {
  if (!faceUp) {
    return (
      <div className={`w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg border-2 border-white/20 flex items-center justify-center ${className}`}>
        <div className="text-4xl text-white/30">🂠</div>
      </div>
    );
  }

  return (
    <div className={`w-20 h-28 bg-white rounded-lg border-2 border-gray-300 p-2 flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-start">
        <div className={`text-2xl font-bold ${suitColors[card.suit]}`}>
          {card.rank}
        </div>
        <div className={`text-2xl ${suitColors[card.suit]}`}>
          {suitSymbols[card.suit]}
        </div>
      </div>
      <div className="text-center">
        <div className={`text-4xl ${suitColors[card.suit]}`}>
          {suitSymbols[card.suit]}
        </div>
      </div>
      <div className="flex justify-between items-end rotate-180">
        <div className={`text-2xl font-bold ${suitColors[card.suit]}`}>
          {card.rank}
        </div>
        <div className={`text-2xl ${suitColors[card.suit]}`}>
          {suitSymbols[card.suit]}
        </div>
      </div>
    </div>
  );
}

