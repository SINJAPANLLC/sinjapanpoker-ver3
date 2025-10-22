export interface SidePot {
  amount: number;
  eligiblePlayers: string[];
}

export interface PlayerBet {
  playerId: string;
  bet: number;
  folded: boolean;
}

export function calculateSidePots(playerBets: PlayerBet[]): SidePot[] {
  const pots: SidePot[] = [];
  const activePlayers = playerBets.filter(p => !p.folded);
  
  if (activePlayers.length === 0) return pots;
  
  const sortedBets = [...activePlayers].sort((a, b) => a.bet - b.bet);
  let remainingPlayers = activePlayers.map(p => ({ ...p }));
  
  for (const betLevel of sortedBets) {
    if (betLevel.bet === 0) continue;
    
    const potAmount = remainingPlayers.reduce((sum, p) => {
      const contribution = Math.min(p.bet, betLevel.bet);
      p.bet -= contribution;
      return sum + contribution;
    }, 0);
    
    if (potAmount > 0) {
      pots.push({
        amount: potAmount,
        eligiblePlayers: remainingPlayers
          .filter(p => p.bet >= 0)
          .map(p => p.playerId),
      });
    }
    
    remainingPlayers = remainingPlayers.filter(p => p.bet > 0);
    if (remainingPlayers.length === 0) break;
  }
  
  return pots;
}

export function distributePots(
  pots: SidePot[],
  winners: Map<string, { playerId: string; handValue: number }>
): Map<string, number> {
  const winnings = new Map<string, number>();
  
  for (const pot of pots) {
    const eligibleWinners = pot.eligiblePlayers
      .map(playerId => winners.get(playerId))
      .filter(w => w !== undefined) as Array<{ playerId: string; handValue: number }>;
    
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
  
  return winnings;
}

export function validateBet(
  action: string,
  amount: number,
  playerChips: number,
  playerCurrentBet: number,
  currentBet: number,
  bigBlind: number
): { valid: boolean; error?: string; adjustedAmount?: number } {
  switch (action) {
    case 'fold':
      return { valid: true };
      
    case 'check':
      if (playerCurrentBet < currentBet) {
        return { valid: false, error: 'チェックできません。コールまたはレイズが必要です' };
      }
      return { valid: true };
      
    case 'call':
      const callAmount = currentBet - playerCurrentBet;
      if (callAmount > playerChips) {
        return {
          valid: true,
          adjustedAmount: playerChips,
        };
      }
      return { valid: true, adjustedAmount: callAmount };
      
    case 'raise':
      const minRaise = currentBet + bigBlind;
      const totalBet = playerCurrentBet + amount;
      
      if (amount > playerChips) {
        return { valid: false, error: 'チップが不足しています' };
      }
      
      if (totalBet < minRaise && amount < playerChips) {
        return {
          valid: false,
          error: `最小レイズ額は ${minRaise - playerCurrentBet} チップです`,
        };
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
