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
    return { value: 0, description: '不完全な手札' };
  }
  
  const rankValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  
  // 7枚から全ての5枚の組み合わせを評価
  const combinations = getCombinations(cards, 5);
  let bestHand = { value: 0, description: '' };
  
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

// 5枚のカードを評価
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
  
  // スコア計算用のキッカー
  const kickerValue = ranksByFrequency.reduce((acc, val, idx) => acc + val * Math.pow(100, 4 - idx), 0);
  
  // ロイヤルフラッシュ
  if (isFlush && isStraight && sortedCards[0].rank === 'A') {
    return { value: 10000000, description: 'ロイヤルフラッシュ' };
  }
  
  // ストレートフラッシュ
  if (isFlush && isStraight) {
    const highCard = isWheel ? 5 : rankValues[sortedCards[0].rank];
    return { value: 9000000 + highCard, description: 'ストレートフラッシュ' };
  }
  
  // フォーカード
  if (counts[0] === 4) {
    return { value: 8000000 + kickerValue, description: 'フォーカード' };
  }
  
  // フルハウス
  if (counts[0] === 3 && counts[1] === 2) {
    return { value: 7000000 + kickerValue, description: 'フルハウス' };
  }
  
  // フラッシュ
  if (isFlush) {
    return { value: 6000000 + kickerValue, description: 'フラッシュ' };
  }
  
  // ストレート
  if (isStraight) {
    const highCard = isWheel ? 5 : rankValues[sortedCards[0].rank];
    return { value: 5000000 + highCard, description: 'ストレート' };
  }
  
  // スリーカード
  if (counts[0] === 3) {
    return { value: 4000000 + kickerValue, description: 'スリーカード' };
  }
  
  // ツーペア
  if (counts[0] === 2 && counts[1] === 2) {
    return { value: 3000000 + kickerValue, description: 'ツーペア' };
  }
  
  // ワンペア
  if (counts[0] === 2) {
    return { value: 2000000 + kickerValue, description: 'ワンペア' };
  }
  
  // ハイカード
  return { value: 1000000 + kickerValue, description: `ハイカード (${sortedCards[0].rank})` };
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

// ベット検証
function validateBet(action, amount, playerChips, playerCurrentBet, currentBet, bigBlind) {
  switch (action) {
    case 'fold':
      return { valid: true };
      
    case 'check':
      if (playerCurrentBet < currentBet) {
        return { valid: false, error: 'チェックできません' };
      }
      return { valid: true };
      
    case 'call':
      const callAmount = currentBet - playerCurrentBet;
      if (callAmount > playerChips) {
        return { valid: true, adjustedAmount: playerChips };
      }
      return { valid: true, adjustedAmount: callAmount };
      
    case 'raise':
      const minRaise = currentBet + bigBlind;
      const totalBet = playerCurrentBet + amount;
      
      if (amount > playerChips) {
        return { valid: false, error: 'チップが不足しています' };
      }
      
      if (totalBet < minRaise && amount < playerChips) {
        return { valid: false, error: `最小レイズ額は ${minRaise - playerCurrentBet} チップです` };
      }
      
      return { valid: true, adjustedAmount: amount };
      
    case 'all-in':
      if (playerChips === 0) {
        return { valid: false, error: 'チップがありません' };
      }
      return { valid: true, adjustedAmount: playerChips };
      
    default:
      return { valid: false, error: '無効なアクションです' };
  }
}

module.exports = {
  calculateSidePots,
  evaluateHand,
  determineWinners,
  distributePots,
  validateBet,
};
