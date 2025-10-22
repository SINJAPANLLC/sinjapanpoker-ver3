import { Card, Suit, Rank, HandRank, HandResult } from '@/types';

// カードデッキを作成
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        id: `${rank}_${suit}`,
      });
    }
  }

  return deck;
}

// デッキをシャッフル
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// カードのランクを数値に変換
function rankToValue(rank: Rank): number {
  const rankValues: { [key in Rank]: number } = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return rankValues[rank];
}

// ハンドを評価
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5) {
    throw new Error('ハンドを評価するには最低5枚のカードが必要です');
  }

  // 7枚から最良の5枚を選択
  const allCombinations = getCombinations(cards, 5);
  let bestHand: HandResult | null = null;

  for (const combination of allCombinations) {
    const hand = evaluateFiveCards(combination);
    if (!bestHand || hand.value > bestHand.value) {
      bestHand = hand;
    }
  }

  return bestHand!;
}

// 5枚のカードを評価
function evaluateFiveCards(cards: Card[]): HandResult {
  const sortedCards = [...cards].sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
  
  const isFlush = sortedCards.every(card => card.suit === sortedCards[0].suit);
  const isStraight = checkStraight(sortedCards);
  const rankCounts = getRankCounts(sortedCards);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // ロイヤルフラッシュ
  if (isFlush && isStraight && sortedCards[0].rank === 'A') {
    return {
      rank: 'royal-flush',
      cards: sortedCards,
      value: 10000000,
      description: 'ロイヤルフラッシュ',
    };
  }

  // ストレートフラッシュ
  if (isFlush && isStraight) {
    return {
      rank: 'straight-flush',
      cards: sortedCards,
      value: 9000000 + rankToValue(sortedCards[0].rank),
      description: 'ストレートフラッシュ',
    };
  }

  // フォーカード
  if (counts[0] === 4) {
    return {
      rank: 'four-of-a-kind',
      cards: sortedCards,
      value: 8000000 + rankToValue(sortedCards[0].rank) * 100,
      description: 'フォーカード',
    };
  }

  // フルハウス
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: 'full-house',
      cards: sortedCards,
      value: 7000000 + rankToValue(sortedCards[0].rank) * 100,
      description: 'フルハウス',
    };
  }

  // フラッシュ
  if (isFlush) {
    return {
      rank: 'flush',
      cards: sortedCards,
      value: 6000000 + rankToValue(sortedCards[0].rank),
      description: 'フラッシュ',
    };
  }

  // ストレート
  if (isStraight) {
    return {
      rank: 'straight',
      cards: sortedCards,
      value: 5000000 + rankToValue(sortedCards[0].rank),
      description: 'ストレート',
    };
  }

  // スリーカード
  if (counts[0] === 3) {
    return {
      rank: 'three-of-a-kind',
      cards: sortedCards,
      value: 4000000 + rankToValue(sortedCards[0].rank) * 100,
      description: 'スリーカード',
    };
  }

  // ツーペア
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: 'two-pair',
      cards: sortedCards,
      value: 3000000 + rankToValue(sortedCards[0].rank) * 100,
      description: 'ツーペア',
    };
  }

  // ワンペア
  if (counts[0] === 2) {
    return {
      rank: 'pair',
      cards: sortedCards,
      value: 2000000 + rankToValue(sortedCards[0].rank) * 100,
      description: 'ワンペア',
    };
  }

  // ハイカード
  return {
    rank: 'high-card',
    cards: sortedCards,
    value: 1000000 + rankToValue(sortedCards[0].rank),
    description: `ハイカード (${sortedCards[0].rank})`,
  };
}

// ストレート判定
function checkStraight(cards: Card[]): boolean {
  const values = cards.map(card => rankToValue(card.rank)).sort((a, b) => b - a);
  
  // 通常のストレート
  let isStraight = true;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      isStraight = false;
      break;
    }
  }

  // A-2-3-4-5のストレート（ホイール）
  const isWheel = values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2;

  return isStraight || isWheel;
}

// ランクのカウント
function getRankCounts(cards: Card[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {};
  for (const card of cards) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts;
}

// 組み合わせを生成
function getCombinations(arr: Card[], size: number): Card[][] {
  if (size > arr.length) return [];
  if (size === arr.length) return [arr];
  if (size === 1) return arr.map(item => [item]);

  const combinations: Card[][] = [];
  for (let i = 0; i < arr.length - size + 1; i++) {
    const head = arr[i];
    const tailCombinations = getCombinations(arr.slice(i + 1), size - 1);
    for (const tail of tailCombinations) {
      combinations.push([head, ...tail]);
    }
  }
  return combinations;
}

// 勝者を決定
export function determineWinner(players: { id: string; cards: Card[] }[], communityCards: Card[]): string[] {
  const hands = players.map(player => ({
    playerId: player.id,
    hand: evaluateHand([...player.cards, ...communityCards]),
  }));

  const maxValue = Math.max(...hands.map(h => h.hand.value));
  return hands.filter(h => h.hand.value === maxValue).map(h => h.playerId);
}

