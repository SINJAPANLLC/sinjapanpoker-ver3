// ポーカーゲームのヘルパー関数

// サイドポット計算（フォールドしたプレイヤーのチップも含む）
function calculateSidePots(playerBets) {
  const pots = [];
  const allPlayers = playerBets.filter(p => p.bet > 0);
  
  if (allPlayers.length === 0) return [];
  
  const sortedBets = [...allPlayers].sort((a, b) => a.bet - b.bet);
  let remainingPlayers = allPlayers.map(p => ({ ...p }));
  
  for (const betLevel of sortedBets) {
    if (betLevel.bet === 0) continue;
    
    let potAmount = 0;
    for (const p of remainingPlayers) {
      const contribution = Math.min(p.bet, betLevel.bet);
      p.bet -= contribution;
      potAmount += contribution;
    }
    
    if (potAmount > 0) {
      pots.push({
        amount: potAmount,
        eligiblePlayers: remainingPlayers
          .filter(p => !p.folded)
          .map(p => p.playerId),
      });
    }
    
    remainingPlayers = remainingPlayers.filter(p => p.bet > 0);
    if (remainingPlayers.length === 0) break;
  }
  
  return pots;
}

// ハンド評価（7枚から最良の5枚を評価）
function evaluateHand(cards) {
  if (cards.length < 5) {
    return { value: 0, description: '不完全な手札', ranks: [] };
  }
  
  const rankValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  
  // 7枚から全ての5枚の組み合わせを評価
  const combinations = getCombinations(cards, 5);
  let bestHand = { value: 0, description: '', ranks: [] };
  
  for (const hand of combinations) {
    const result = evaluateFiveCards(hand, rankValues);
    if (result.value > bestHand.value) {
      bestHand = result;
    }
  }
  
  return bestHand;
}

// 組み合わせを生成
function getCombinations(arr, size) {
  if (size > arr.length) return [];
  if (size === arr.length) return [arr];
  if (size === 1) return arr.map(item => [item]);
  
  const combinations = [];
  for (let i = 0; i < arr.length - size + 1; i++) {
    const head = arr[i];
    const tailCombinations = getCombinations(arr.slice(i + 1), size - 1);
    for (const tail of tailCombinations) {
      combinations.push([head, ...tail]);
    }
  }
  return combinations;
}

// 5枚のカードを評価（完全なキッカー比較を含む）
function evaluateFiveCards(hand, rankValues) {
  const sortedCards = [...hand].sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);
  
  const isFlush = sortedCards.every(card => card.suit === sortedCards[0].suit);
  const ranks = sortedCards.map(c => c.rank);
  const values = sortedCards.map(c => rankValues[c.rank]);
  
  // ストレート判定
  let isStraight = true;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      isStraight = false;
      break;
    }
  }
  const isWheel = values[0] === 14 && values[1] === 5 && values[2] === 4 && 
                  values[3] === 3 && values[4] === 2;
  if (isWheel) isStraight = true;
  
  // ランクのカウント
  const rankCounts = {};
  for (const rank of ranks) {
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  }
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  // ランクを頻度でソート（同じ頻度の場合は値でソート）
  const ranksByFrequency = Object.entries(rankCounts)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return rankValues[b[0]] - rankValues[a[0]];
    })
    .map(([rank]) => rankValues[rank]);
  
  // 完全なキッカー比較のためのスコア計算
  // 各位置に15^(4-i)の重みを付けて、確実に順序が保たれるようにする
  const calculateDetailedScore = (baseScore, ranksArray) => {
    let score = baseScore;
    for (let i = 0; i < ranksArray.length && i < 5; i++) {
      score += ranksArray[i] * Math.pow(15, 4 - i);
    }
    return score;
  };
  
  // ロイヤルフラッシュ
  if (isFlush && isStraight && sortedCards[0].rank === 'A') {
    return { 
      value: 10000000, 
      description: 'ロイヤルフラッシュ',
      ranks: [14, 13, 12, 11, 10]
    };
  }
  
  // ストレートフラッシュ
  if (isFlush && isStraight) {
    const highCard = isWheel ? 5 : rankValues[sortedCards[0].rank];
    return { 
      value: 9000000 + highCard, 
      description: 'ストレートフラッシュ',
      ranks: [highCard]
    };
  }
  
  // フォーカード (4枚のランク + キッカー1枚)
  if (counts[0] === 4) {
    return { 
      value: calculateDetailedScore(8000000, ranksByFrequency), 
      description: 'フォーカード',
      ranks: ranksByFrequency
    };
  }
  
  // フルハウス (3枚のランク + 2枚のランク)
  if (counts[0] === 3 && counts[1] === 2) {
    return { 
      value: calculateDetailedScore(7000000, ranksByFrequency), 
      description: 'フルハウス',
      ranks: ranksByFrequency
    };
  }
  
  // フラッシュ (5枚すべてを降順で比較)
  if (isFlush) {
    return { 
      value: calculateDetailedScore(6000000, values), 
      description: 'フラッシュ',
      ranks: values
    };
  }
  
  // ストレート (最高位のカードのみ)
  if (isStraight) {
    const highCard = isWheel ? 5 : rankValues[sortedCards[0].rank];
    return { 
      value: 5000000 + highCard, 
      description: 'ストレート',
      ranks: [highCard]
    };
  }
  
  // スリーカード (3枚のランク + キッカー2枚)
  if (counts[0] === 3) {
    return { 
      value: calculateDetailedScore(4000000, ranksByFrequency), 
      description: 'スリーカード',
      ranks: ranksByFrequency
    };
  }
  
  // ツーペア (高いペア + 低いペア + キッカー1枚)
  if (counts[0] === 2 && counts[1] === 2) {
    return { 
      value: calculateDetailedScore(3000000, ranksByFrequency), 
      description: 'ツーペア',
      ranks: ranksByFrequency
    };
  }
  
  // ワンペア (ペアのランク + キッカー3枚)
  if (counts[0] === 2) {
    return { 
      value: calculateDetailedScore(2000000, ranksByFrequency), 
      description: 'ワンペア',
      ranks: ranksByFrequency
    };
  }
  
  // ハイカード (5枚すべてを降順で比較)
  return { 
    value: calculateDetailedScore(1000000, values), 
    description: `ハイカード (${sortedCards[0].rank})`,
    ranks: values
  };
}

// 勝者を決定
function determineWinners(players, communityCards) {
  const hands = players
    .filter(p => !p.folded)
    .map(player => {
      const allCards = [...player.cards, ...communityCards];
      const handResult = evaluateHand(allCards);
      return {
        playerId: player.id,
        handValue: handResult.value,
        handDescription: handResult.description,
        handRanks: handResult.ranks,
      };
    });
  
  if (hands.length === 0) return [];
  
  const maxValue = Math.max(...hands.map(h => h.handValue));
  const winners = hands.filter(h => h.handValue === maxValue);
  
  return winners;
}

// ポットを分配
function distributePots(sidePots, winners, players) {
  const winnings = new Map();
  
  for (const pot of sidePots) {
    const eligibleWinners = winners.filter(w => 
      pot.eligiblePlayers.includes(w.playerId)
    );
    
    if (eligibleWinners.length === 0) continue;
    
    const maxHandValue = Math.max(...eligibleWinners.map(w => w.handValue));
    const topWinners = eligibleWinners.filter(w => w.handValue === maxHandValue);
    
    const amountPerWinner = Math.floor(pot.amount / topWinners.length);
    const remainder = pot.amount % topWinners.length;
    
    topWinners.forEach((winner, index) => {
      const currentWinnings = winnings.get(winner.playerId) || 0;
      const additionalAmount = amountPerWinner + (index < remainder ? 1 : 0);
      winnings.set(winner.playerId, currentWinnings + additionalAmount);
    });
  }
  
  // プレイヤーにチップを追加
  for (const player of players) {
    const amount = winnings.get(player.id) || 0;
    if (amount > 0) {
      player.chips += amount;
    }
  }
  
  return winnings;
}

// ベットの妥当性をチェック
function validateBet(player, betAmount, currentBet, minRaise) {
  if (betAmount > player.chips) {
    return { valid: false, message: 'チップが不足しています' };
  }
  
  if (betAmount < currentBet && betAmount !== player.chips) {
    return { valid: false, message: `最低ベット額は ${currentBet} です` };
  }
  
  if (betAmount > currentBet && betAmount < currentBet + minRaise && betAmount !== player.chips) {
    return { valid: false, message: `最小レイズ額は ${currentBet + minRaise} です` };
  }
  
  return { valid: true };
}

module.exports = {
  calculateSidePots,
  evaluateHand,
  determineWinners,
  distributePots,
  validateBet,
};
