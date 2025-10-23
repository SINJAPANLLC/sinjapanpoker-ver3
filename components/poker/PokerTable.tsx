'use client';

import { motion } from 'framer-motion';
import { Crown, DollarSign } from 'lucide-react';

interface Card {
  suit: string;
  rank: string;
  id: string;
}

interface Player {
  id: string;
  userId: string;
  username: string;
  chips: number;
  bet: number;
  cards: Card[];
  folded: boolean;
  isAllIn: boolean;
  position: number;
  isDealer: boolean;
  hasActed: boolean;
}

interface PokerTableProps {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentPlayerIndex: number;
  myPlayerId: string | null;
}

const CARD_SUITS: Record<string, string> = {
  'hearts': '♥',
  'diamonds': '♦',
  'clubs': '♣',
  'spades': '♠',
};

const getCardColor = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-black';
};

const getPlayerPosition = (index: number, total: number) => {
  const positions = [
    { top: '50%', left: '50%', transform: 'translate(-50%, 110%)' },
    { top: '70%', left: '15%', transform: 'translate(0, 0)' },
    { top: '30%', left: '10%', transform: 'translate(0, 0)' },
    { top: '10%', left: '30%', transform: 'translate(0, 0)' },
    { top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
    { top: '10%', left: '70%', transform: 'translate(-100%, 0)' },
    { top: '30%', right: '10%', transform: 'translate(0, 0)' },
    { top: '70%', right: '15%', transform: 'translate(0, 0)' },
  ];

  return positions[index % positions.length];
};

export default function PokerTable({ players, communityCards, pot, currentPlayerIndex, myPlayerId }: PokerTableProps) {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <div className="relative w-[800px] h-[400px] bg-gradient-to-br from-green-700 to-green-900 rounded-[200px] border-[12px] border-amber-900 shadow-2xl">
        <div className="absolute inset-4 rounded-[180px] border-4 border-green-600/30"></div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-yellow-500/50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">{pot.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-300 text-center mt-1">POT</div>
            </div>
          </motion.div>
        </div>

        {communityCards.length > 0 && (
          <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 flex gap-2">
            {communityCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ rotateY: 180, scale: 0 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="playing-card w-16 h-22 flex flex-col items-center justify-center bg-white shadow-lg">
                  <div className={`text-2xl font-bold ${getCardColor(card.suit)}`}>
                    {card.rank}
                  </div>
                  <div className={`text-xl ${getCardColor(card.suit)}`}>
                    {CARD_SUITS[card.suit] || card.suit}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {players.map((player, index) => {
        const position = getPlayerPosition(index, players.length);
        const isCurrentTurn = currentPlayerIndex === index;
        const isMe = player.id === myPlayerId;

        return (
          <div key={player.id} className="absolute" style={position}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`relative ${isCurrentTurn ? 'ring-4 ring-blue-400 rounded-2xl animate-pulse' : ''}`}>
                {/* プレイヤー3、4、5（index 2、3、4）はカードを右側に配置 */}
                <div className={`flex ${index === 2 || index === 3 || index === 4 ? 'flex-row-reverse' : 'flex-col'} gap-2 items-center`}>
                  <div className={`card-blue p-4 min-w-[160px] ${player.folded ? 'opacity-50 grayscale' : ''} ${isMe ? 'bg-gradient-to-br from-blue-900/80 to-purple-900/80' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {player.isDealer && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="font-bold text-white">{player.username}</span>
                      </div>
                      {isMe && (
                        <span className="badge-primary text-xs">YOU</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">チップ</span>
                      <span className="text-yellow-400 font-bold">{player.chips.toLocaleString()}</span>
                    </div>

                    {player.bet > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">ベット</span>
                        <span className="text-green-400 font-bold">{player.bet.toLocaleString()}</span>
                      </div>
                    )}

                    {player.isAllIn && (
                      <div className="mt-2 badge-secondary text-center">ALL IN</div>
                    )}

                    {player.folded && (
                      <div className="mt-2 text-red-400 text-sm text-center">FOLDED</div>
                    )}
                  </div>

                  {/* カード表示 */}
                  <div className="flex gap-1 justify-center">
                    {player.cards.map((card, cardIndex) => {
                      const showCard = isMe || player.id === myPlayerId;
                      return (
                        <div
                          key={cardIndex}
                          className={`playing-card w-10 h-14 flex flex-col items-center justify-center text-xs ${
                            showCard ? 'bg-white' : 'bg-gradient-to-br from-blue-600 to-blue-800'
                          } shadow-md`}
                        >
                          {showCard ? (
                            <>
                              <div className={`text-sm font-bold ${getCardColor(card.suit)}`}>
                                {card.rank}
                              </div>
                              <div className={`text-xs ${getCardColor(card.suit)}`}>
                                {CARD_SUITS[card.suit] || card.suit}
                              </div>
                            </>
                          ) : (
                            <div className="text-white text-xl">🂠</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
