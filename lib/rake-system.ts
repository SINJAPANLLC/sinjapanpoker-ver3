/**
 * レーキシステム（Rake System）
 * 5%レーキ + キャップあり
 * トーナメント参加料10%
 */

// レーキ設定
export const RAKE_CONFIG = {
  cashGame: {
    percentage: 0.05, // 5%
    capByStakes: {
      micro: 3,      // $0.01/$0.02 - $0.05/$0.10 → $3キャップ
      low: 5,        // $0.10/$0.25 - $0.50/$1.00 → $5キャップ
      medium: 10,    // $1/$2 - $2/$5 → $10キャップ
      high: 20,      // $5/$10以上 → $20キャップ
    },
    noRakeUnder: 1 // $1以下のポットはレーキなし
  },
  tournament: {
    entryFeePercentage: 0.10, // 10%
    minFee: 0.50, // 最低参加料
    maxFee: 50    // 最大参加料
  }
};

// ステークスレベル判定
export type StakesLevel = 'micro' | 'low' | 'medium' | 'high';

export function getStakesLevel(smallBlind: number, bigBlind: number): StakesLevel {
  if (bigBlind <= 0.10) return 'micro';
  if (bigBlind <= 1.00) return 'low';
  if (bigBlind <= 5.00) return 'medium';
  return 'high';
}

// キャッシュゲームレーキ計算
export interface RakeCalculation {
  potSize: number;
  rakeAmount: number;
  rakePercentage: number;
  cappedAmount: number;
  playersShare: { [playerId: string]: number };
}

export function calculateCashGameRake(
  potSize: number,
  smallBlind: number,
  bigBlind: number,
  playerContributions: { [playerId: string]: number }
): RakeCalculation {
  // ポットサイズが小さい場合はレーキなし
  if (potSize < RAKE_CONFIG.cashGame.noRakeUnder) {
    return {
      potSize,
      rakeAmount: 0,
      rakePercentage: 0,
      cappedAmount: 0,
      playersShare: {}
    };
  }

  // ステークスレベルを判定
  const stakesLevel = getStakesLevel(smallBlind, bigBlind);
  const cap = RAKE_CONFIG.cashGame.capByStakes[stakesLevel];

  // レーキ計算（5%）
  const rakePercentage = RAKE_CONFIG.cashGame.percentage;
  let rakeAmount = potSize * rakePercentage;

  // キャップ適用
  const cappedAmount = Math.min(rakeAmount, cap);
  rakeAmount = cappedAmount;

  // プレイヤー別のレーキ負担計算（貢献度に応じて按分）
  const playersShare: { [playerId: string]: number } = {};
  const totalContribution = Object.values(playerContributions).reduce((sum, amount) => sum + amount, 0);

  for (const [playerId, contribution] of Object.entries(playerContributions)) {
    const share = (contribution / totalContribution) * rakeAmount;
    playersShare[playerId] = Number(share.toFixed(2));
  }

  return {
    potSize,
    rakeAmount: Number(rakeAmount.toFixed(2)),
    rakePercentage,
    cappedAmount,
    playersShare
  };
}

// トーナメント参加料計算
export interface TournamentFeeCalculation {
  buyIn: number;          // バイイン額
  entryFee: number;       // 参加料（10%）
  totalCost: number;      // 合計コスト
  prizePool: number;      // 賞金プール（バイイン額の合計）
  houseFee: number;       // ハウスフィー（参加料の合計）
}

export function calculateTournamentFee(
  buyIn: number,
  playerCount: number = 1
): TournamentFeeCalculation {
  const entryFeePercentage = RAKE_CONFIG.tournament.entryFeePercentage;
  let entryFee = buyIn * entryFeePercentage;

  // 最低・最大参加料の適用
  entryFee = Math.max(entryFee, RAKE_CONFIG.tournament.minFee);
  entryFee = Math.min(entryFee, RAKE_CONFIG.tournament.maxFee);
  entryFee = Number(entryFee.toFixed(2));

  const totalCost = buyIn + entryFee;
  const prizePool = buyIn * playerCount;
  const houseFee = entryFee * playerCount;

  return {
    buyIn,
    entryFee,
    totalCost,
    prizePool,
    houseFee
  };
}

// レーキバック計算（VIPプレイヤー向け）
export interface RakebackCalculation {
  totalRakePaid: number;
  rakebackPercentage: number;
  rakebackAmount: number;
}

export function calculateRakeback(
  totalRakePaid: number,
  vipLevel: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
): RakebackCalculation {
  // VIPレベル別のレーキバック率
  const rakebackRates = {
    none: 0,
    bronze: 0.05,    // 5%
    silver: 0.10,    // 10%
    gold: 0.15,      // 15%
    platinum: 0.20,  // 20%
    diamond: 0.25    // 25%
  };

  const rakebackPercentage = rakebackRates[vipLevel];
  const rakebackAmount = totalRakePaid * rakebackPercentage;

  return {
    totalRakePaid,
    rakebackPercentage,
    rakebackAmount: Number(rakebackAmount.toFixed(2))
  };
}

// レーキ統計
export interface RakeStatistics {
  period: string;
  totalGamesPlayed: number;
  totalPotSize: number;
  totalRakeCollected: number;
  averageRakePerGame: number;
  topPlayers: Array<{
    playerId: string;
    username: string;
    rakePaid: number;
    gamesPlayed: number;
  }>;
}

export class RakeManager {
  private rakeHistory: Array<{
    gameId: string;
    timestamp: Date;
    type: 'cash' | 'tournament';
    rakeAmount: number;
    playerId: string;
  }> = [];

  // レーキ記録
  recordRake(data: {
    gameId: string;
    type: 'cash' | 'tournament';
    rakeAmount: number;
    playerId: string;
  }): void {
    this.rakeHistory.push({
      ...data,
      timestamp: new Date()
    });

    // 実際の実装ではデータベースに保存
    console.log('[RAKE RECORDED]', data);
  }

  // 期間別統計
  getStatistics(startDate: Date, endDate: Date): RakeStatistics {
    const periodRakes = this.rakeHistory.filter(
      r => r.timestamp >= startDate && r.timestamp <= endDate
    );

    const totalRakeCollected = periodRakes.reduce((sum, r) => sum + r.rakeAmount, 0);
    const totalGamesPlayed = new Set(periodRakes.map(r => r.gameId)).size;
    const averageRakePerGame = totalGamesPlayed > 0 ? totalRakeCollected / totalGamesPlayed : 0;

    // プレイヤー別集計
    const playerRakes = new Map<string, { rakePaid: number; games: Set<string> }>();
    
    periodRakes.forEach(r => {
      if (!playerRakes.has(r.playerId)) {
        playerRakes.set(r.playerId, { rakePaid: 0, games: new Set() });
      }
      const player = playerRakes.get(r.playerId)!;
      player.rakePaid += r.rakeAmount;
      player.games.add(r.gameId);
    });

    const topPlayers = Array.from(playerRakes.entries())
      .map(([playerId, data]) => ({
        playerId,
        username: `Player_${playerId}`, // 実際はユーザー名を取得
        rakePaid: Number(data.rakePaid.toFixed(2)),
        gamesPlayed: data.games.size
      }))
      .sort((a, b) => b.rakePaid - a.rakePaid)
      .slice(0, 10);

    return {
      period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
      totalGamesPlayed,
      totalPotSize: 0, // 実装時に追加
      totalRakeCollected: Number(totalRakeCollected.toFixed(2)),
      averageRakePerGame: Number(averageRakePerGame.toFixed(2)),
      topPlayers
    };
  }

  // プレイヤーのレーキ履歴
  getPlayerRakeHistory(playerId: string, limit: number = 50): Array<{
    gameId: string;
    timestamp: Date;
    type: 'cash' | 'tournament';
    rakeAmount: number;
  }> {
    return this.rakeHistory
      .filter(r => r.playerId === playerId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// グローバルインスタンス
export const rakeManager = new RakeManager();

// 使用例
export function exampleUsage() {
  // キャッシュゲームレーキ計算例
  const cashRake = calculateCashGameRake(
    100, // ポットサイズ $100
    0.50, // スモールブラインド $0.50
    1.00, // ビッグブラインド $1.00
    {
      'player1': 40,
      'player2': 35,
      'player3': 25
    }
  );
  console.log('キャッシュゲームレーキ:', cashRake);
  // 結果: { potSize: 100, rakeAmount: 5, rakePercentage: 0.05, cappedAmount: 5, ... }

  // トーナメント参加料計算例
  const tournamentFee = calculateTournamentFee(
    100, // バイイン $100
    50   // 参加者50人
  );
  console.log('トーナメント参加料:', tournamentFee);
  // 結果: { buyIn: 100, entryFee: 10, totalCost: 110, prizePool: 5000, houseFee: 500 }

  // レーキバック計算例
  const rakeback = calculateRakeback(
    1000, // 総レーキ $1000
    'gold' // ゴールドVIP
  );
  console.log('レーキバック:', rakeback);
  // 結果: { totalRakePaid: 1000, rakebackPercentage: 0.15, rakebackAmount: 150 }
}