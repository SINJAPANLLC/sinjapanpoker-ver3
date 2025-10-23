/**
 * トーナメントシステム
 * - 賞金分配
 * - プレイヤーランキング
 * - トーナメント進行管理
 */

/**
 * 賞金分配率の設定
 */
export const PRIZE_DISTRIBUTION = {
  // プレイヤー数に応じた賞金分配率
  2: [{ position: 1, percentage: 100 }],
  3: [
    { position: 1, percentage: 65 },
    { position: 2, percentage: 35 },
  ],
  4: [
    { position: 1, percentage: 50 },
    { position: 2, percentage: 30 },
    { position: 3, percentage: 20 },
  ],
  5: [
    { position: 1, percentage: 50 },
    { position: 2, percentage: 30 },
    { position: 3, percentage: 20 },
  ],
  6: [
    { position: 1, percentage: 40 },
    { position: 2, percentage: 30 },
    { position: 3, percentage: 20 },
    { position: 4, percentage: 10 },
  ],
  9: [
    { position: 1, percentage: 40 },
    { position: 2, percentage: 25 },
    { position: 3, percentage: 15 },
    { position: 4, percentage: 10 },
    { position: 5, percentage: 10 },
  ],
  18: [
    { position: 1, percentage: 30 },
    { position: 2, percentage: 20 },
    { position: 3, percentage: 15 },
    { position: 4, percentage: 12 },
    { position: 5, percentage: 10 },
    { position: 6, percentage: 8 },
    { position: 7, percentage: 5 },
  ],
  27: [
    { position: 1, percentage: 25 },
    { position: 2, percentage: 18 },
    { position: 3, percentage: 13 },
    { position: 4, percentage: 10 },
    { position: 5, percentage: 8 },
    { position: 6, percentage: 7 },
    { position: 7, percentage: 6 },
    { position: 8, percentage: 5 },
    { position: 9, percentage: 4 },
    { position: 10, percentage: 4 },
  ],
} as const;

export interface PrizeCalculation {
  position: number;
  userId: string;
  username: string;
  prize: number;
  percentage: number;
}

/**
 * 賞金を計算する
 */
export function calculatePrizes(
  prizePool: number,
  totalPlayers: number,
  rankings: Array<{ userId: string; username: string; position: number }>
): PrizeCalculation[] {
  // 最も近いプレイヤー数の分配率を取得
  const playerCounts = Object.keys(PRIZE_DISTRIBUTION)
    .map(Number)
    .sort((a, b) => a - b);
  
  let distributionKey = playerCounts[0];
  for (const count of playerCounts) {
    if (totalPlayers >= count) {
      distributionKey = count;
    } else {
      break;
    }
  }

  const distribution = PRIZE_DISTRIBUTION[distributionKey as keyof typeof PRIZE_DISTRIBUTION];

  return rankings
    .filter(r => r.position <= distribution.length)
    .map(ranking => {
      const prizeInfo = distribution.find(d => d.position === ranking.position);
      const percentage = prizeInfo?.percentage || 0;
      const prize = Math.floor((prizePool * percentage) / 100);

      return {
        position: ranking.position,
        userId: ranking.userId,
        username: ranking.username,
        prize,
        percentage,
      };
    });
}

/**
 * プレイヤーの順位を計算する
 */
export function calculateRankings(
  players: Array<{
    userId: string;
    username: string;
    chips: number;
    position?: number;
  }>
): Array<{ userId: string; username: string; position: number; chips: number }> {
  // チップ数でソート（多い順）
  const sorted = [...players].sort((a, b) => b.chips - a.chips);

  return sorted.map((player, index) => ({
    userId: player.userId,
    username: player.username,
    position: index + 1,
    chips: player.chips,
  }));
}

/**
 * トーナメントのブラインド構造
 */
export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number; // 分単位
}

/**
 * 標準的なブラインド構造を生成する
 */
export function generateBlindStructure(
  startingChips: number,
  duration: 'turbo' | 'standard' | 'deep' = 'standard'
): BlindLevel[] {
  const levelDuration = duration === 'turbo' ? 5 : duration === 'deep' ? 20 : 10;
  const startingBlind = Math.floor(startingChips / 100);

  const levels: BlindLevel[] = [];
  let currentSmallBlind = startingBlind;

  for (let i = 1; i <= 15; i++) {
    levels.push({
      level: i,
      smallBlind: currentSmallBlind,
      bigBlind: currentSmallBlind * 2,
      ante: i >= 3 ? Math.floor(currentSmallBlind / 2) : 0,
      duration: levelDuration,
    });

    // ブラインドを1.5倍に増やす
    currentSmallBlind = Math.floor(currentSmallBlind * 1.5);
  }

  return levels;
}

/**
 * 現在のブラインドレベルを取得する
 */
export function getCurrentBlindLevel(
  blindStructure: BlindLevel[],
  elapsedMinutes: number
): BlindLevel {
  let totalTime = 0;
  for (const level of blindStructure) {
    totalTime += level.duration;
    if (elapsedMinutes < totalTime) {
      return level;
    }
  }

  // 最後のレベルを返す
  return blindStructure[blindStructure.length - 1];
}

/**
 * トーナメントの状態
 */
export type TournamentStatus = 
  | 'registering'    // 登録受付中
  | 'in-progress'    // 進行中
  | 'completed'      // 完了
  | 'cancelled';     // キャンセル

/**
 * トーナメントタイプ
 */
export type TournamentType = 
  | 'sit-n-go'       // シット＆ゴー（人数が揃ったら自動開始）
  | 'scheduled'      // スケジュール（指定時刻に開始）
  | 'bounty';        // バウンティ（プレイヤーを倒すと報酬）

/**
 * トーナメント完了処理
 */
export interface TournamentCompletionResult {
  finalRankings: Array<{
    userId: string;
    username: string;
    position: number;
    chips: number;
  }>;
  prizes: PrizeCalculation[];
  totalPrizePool: number;
  endTime: Date;
}

/**
 * トーナメントを完了する
 */
export function completeTournament(
  players: Array<{
    userId: string;
    username: string;
    chips: number;
    position?: number;
  }>,
  prizePool: number
): TournamentCompletionResult {
  const finalRankings = calculateRankings(players);
  const prizes = calculatePrizes(prizePool, players.length, finalRankings);

  return {
    finalRankings,
    prizes,
    totalPrizePool: prizePool,
    endTime: new Date(),
  };
}
