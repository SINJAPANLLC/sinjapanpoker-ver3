import { Player, Card as CardType } from '@/types';
import Card from './Card';
import { FaCoins } from 'react-icons/fa';

interface PokerTableProps {
  players: Player[];
  communityCards: CardType[];
  pot: number;
  currentPlayerIndex: number;
  myPosition: number;
}

export default function PokerTable({
  players,
  communityCards,
  pot,
  currentPlayerIndex,
  myPosition,
}: PokerTableProps) {
  return (
    <div className="relative w-full h-full">
      {/* ポーカーテーブル */}
      <div className="absolute inset-0 poker-table rounded-full border-8 border-yellow-900">
        {/* ポット表示 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-6 py-3 border-2 border-yellow-500">
            <FaCoins className="text-3xl text-yellow-500 mx-auto mb-2" />
            <div className="text-white font-bold text-2xl">{pot.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">ポット</div>
          </div>
          
          {/* コミュニティカード */}
          {communityCards.length > 0 && (
            <div className="flex gap-2 mt-4 justify-center">
              {communityCards.map((card, index) => (
                <div key={card.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card
                    card={card}
                    faceUp={true}
                    className="animate-card-deal"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* プレイヤー配置 */}
        {players.map((player, index) => {
          const angle = (index * 360) / players.length;
          const x = 50 + 40 * Math.cos((angle - 90) * Math.PI / 180);
          const y = 50 + 35 * Math.sin((angle - 90) * Math.PI / 180);
          const isCurrentPlayer = index === currentPlayerIndex;
          const isMe = index === myPosition;

          return (
            <div
              key={player.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                isCurrentPlayer ? 'ring-4 ring-yellow-500 rounded-lg' : ''
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className={`bg-gray-800 rounded-lg p-3 border-2 ${
                isMe ? 'border-blue-500' : 'border-gray-600'
              } ${player.folded ? 'opacity-50' : ''}`}>
                {/* プレイヤー情報 */}
                <div className="text-center mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-blue-400">
                    {player.avatar && player.avatar.startsWith('data:') ? (
                      <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{player.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-white font-semibold text-sm">{player.username}</div>
                  <div className="flex items-center justify-center gap-1 text-yellow-500 text-xs">
                    <FaCoins className="text-xs" />
                    <span>{player.chips.toLocaleString()}</span>
                  </div>
                </div>

                {/* カード */}
                <div className="flex gap-1 justify-center">
                  {player.cards.map((card, cardIndex) => (
                    <Card
                      key={cardIndex}
                      card={card}
                      faceUp={isMe || player.folded === false}
                      className="scale-75"
                    />
                  ))}
                </div>

                {/* ベット額 */}
                {player.bet > 0 && (
                  <div className="mt-2 bg-yellow-500/20 rounded px-2 py-1 text-center">
                    <div className="text-yellow-500 font-bold text-sm">
                      {player.bet.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

