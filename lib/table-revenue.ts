/**
 * テーブル別収益管理システム
 * Table-specific Revenue Tracking
 */

import { calculateCashGameRake, calculateTournamentFee } from './rake-system';

export interface TableRevenue {
  tableId: string;
  tableName: string;
  tableType: 'cash' | 'tournament' | 'spinup';
  stakes: string;
  
  // 収益データ
  totalHands: number;
  totalPots: number;
  totalRakeCollected: number;
  tournamentFees: number;
  
  // 期間別
  hourlyRevenue: number[];
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  
  // プレイヤー情報
  uniquePlayers: number;
  avgPlayersPerHand: number;
  
  // 時刻情報
  createdAt: Date;
  lastHandAt: Date;
  activeHours: number;
}

export interface HandRevenue {
  handId: string;
  tableId: string;
  timestamp: Date;
  potSize: number;
  rakeAmount: number;
  players: string[];
  playerContributions: { [playerId: string]: number };
}

export class TableRevenueManager {
  private tables: Map<string, TableRevenue> = new Map();
  private hands: HandRevenue[] = [];

  // テーブル作成
  createTable(tableId: string, tableName: string, tableType: 'cash' | 'tournament' | 'spinup', stakes: string): TableRevenue {
    const table: TableRevenue = {
      tableId,
      tableName,
      tableType,
      stakes,
      totalHands: 0,
      totalPots: 0,
      totalRakeCollected: 0,
      tournamentFees: 0,
      hourlyRevenue: new Array(24).fill(0),
      dailyRevenue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      uniquePlayers: 0,
      avgPlayersPerHand: 0,
      createdAt: new Date(),
      lastHandAt: new Date(),
      activeHours: 0
    };

    this.tables.set(tableId, table);
    return table;
  }

  // ハンド完了時に収益記録
  recordHand(
    tableId: string,
    handId: string,
    potSize: number,
    players: string[],
    playerContributions: { [playerId: string]: number },
    smallBlind: number,
    bigBlind: number
  ): HandRevenue {
    const table = this.tables.get(tableId);
    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }

    // レーキ計算
    const rakeCalc = calculateCashGameRake(potSize, smallBlind, bigBlind, playerContributions);

    const hand: HandRevenue = {
      handId,
      tableId,
      timestamp: new Date(),
      potSize,
      rakeAmount: rakeCalc.rakeAmount,
      players,
      playerContributions
    };

    this.hands.push(hand);

    // テーブル統計更新
    table.totalHands++;
    table.totalPots += potSize;
    table.totalRakeCollected += rakeCalc.rakeAmount;
    table.lastHandAt = new Date();

    // 時間別収益
    const hour = new Date().getHours();
    table.hourlyRevenue[hour] += rakeCalc.rakeAmount;

    // 日次・週次・月次収益
    table.dailyRevenue += rakeCalc.rakeAmount;
    table.weeklyRevenue += rakeCalc.rakeAmount;
    table.monthlyRevenue += rakeCalc.rakeAmount;

    // ユニークプレイヤー数
    const allPlayers = new Set(this.hands.filter(h => h.tableId === tableId).flatMap(h => h.players));
    table.uniquePlayers = allPlayers.size;

    // 平均プレイヤー数
    const totalPlayers = this.hands.filter(h => h.tableId === tableId).reduce((sum, h) => sum + h.players.length, 0);
    table.avgPlayersPerHand = table.totalHands > 0 ? totalPlayers / table.totalHands : 0;

    console.log(`[TABLE REVENUE] ${table.tableName}: Hand #${table.totalHands}, Rake: $${rakeCalc.rakeAmount}`);

    return hand;
  }

  // トーナメント参加料記録
  recordTournamentEntry(tableId: string, buyIn: number, playerCount: number = 1): void {
    const table = this.tables.get(tableId);
    if (!table) return;

    const feeCalc = calculateTournamentFee(buyIn, playerCount);
    table.tournamentFees += feeCalc.houseFee;
    table.dailyRevenue += feeCalc.houseFee;
    table.weeklyRevenue += feeCalc.houseFee;
    table.monthlyRevenue += feeCalc.houseFee;

    console.log(`[TOURNAMENT FEE] ${table.tableName}: $${feeCalc.houseFee} (${playerCount} players)`);
  }

  // テーブル統計取得
  getTableRevenue(tableId: string): TableRevenue | null {
    return this.tables.get(tableId) || null;
  }

  // 全テーブル統計取得
  getAllTables(): TableRevenue[] {
    return Array.from(this.tables.values());
  }

  // 収益トップテーブル
  getTopRevenueTable(limit: number = 10): TableRevenue[] {
    return Array.from(this.tables.values())
      .sort((a, b) => b.totalRakeCollected - a.totalRakeCollected)
      .slice(0, limit);
  }

  // 期間別収益集計
  getRevenueSummary(startDate: Date, endDate: Date): {
    totalRevenue: number;
    totalHands: number;
    avgRevenuePerHand: number;
    tableBreakdown: Array<{
      tableId: string;
      tableName: string;
      revenue: number;
      hands: number;
    }>;
  } {
    const relevantHands = this.hands.filter(
      h => h.timestamp >= startDate && h.timestamp <= endDate
    );

    const totalRevenue = relevantHands.reduce((sum, h) => sum + h.rakeAmount, 0);
    const totalHands = relevantHands.length;
    const avgRevenuePerHand = totalHands > 0 ? totalRevenue / totalHands : 0;

    // テーブル別集計
    const tableMap = new Map<string, { revenue: number; hands: number }>();
    
    relevantHands.forEach(hand => {
      const existing = tableMap.get(hand.tableId) || { revenue: 0, hands: 0 };
      tableMap.set(hand.tableId, {
        revenue: existing.revenue + hand.rakeAmount,
        hands: existing.hands + 1
      });
    });

    const tableBreakdown = Array.from(tableMap.entries())
      .map(([tableId, data]) => {
        const table = this.tables.get(tableId);
        return {
          tableId,
          tableName: table?.tableName || 'Unknown',
          revenue: data.revenue,
          hands: data.hands
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalHands,
      avgRevenuePerHand: Number(avgRevenuePerHand.toFixed(2)),
      tableBreakdown
    };
  }

  // 時間帯別収益分析
  getHourlyRevenueAnalysis(): Array<{
    hour: number;
    revenue: number;
    hands: number;
    tables: number;
  }> {
    const hourlyData: Array<{
      hour: number;
      revenue: number;
      hands: number;
      tables: Set<string>;
    }> = [];

    for (let hour = 0; hour < 24; hour++) {
      hourlyData.push({
        hour,
        revenue: 0,
        hands: 0,
        tables: new Set()
      });
    }

    this.hands.forEach(hand => {
      const hour = hand.timestamp.getHours();
      hourlyData[hour].revenue += hand.rakeAmount;
      hourlyData[hour].hands++;
      hourlyData[hour].tables.add(hand.tableId);
    });

    return hourlyData.map(data => ({
      hour: data.hour,
      revenue: Number(data.revenue.toFixed(2)),
      hands: data.hands,
      tables: data.tables.size
    }));
  }

  // テーブルパフォーマンス比較
  compareTablePerformance(): Array<{
    tableId: string;
    tableName: string;
    revenuePerHand: number;
    revenuePerHour: number;
    efficiency: number; // 収益効率（プレイヤー数あたりの収益）
  }> {
    return Array.from(this.tables.values()).map(table => {
      const revenuePerHand = table.totalHands > 0 
        ? table.totalRakeCollected / table.totalHands 
        : 0;
      
      const revenuePerHour = table.activeHours > 0
        ? table.totalRakeCollected / table.activeHours
        : 0;

      const efficiency = table.uniquePlayers > 0
        ? table.totalRakeCollected / table.uniquePlayers
        : 0;

      return {
        tableId: table.tableId,
        tableName: table.tableName,
        revenuePerHand: Number(revenuePerHand.toFixed(2)),
        revenuePerHour: Number(revenuePerHour.toFixed(2)),
        efficiency: Number(efficiency.toFixed(2))
      };
    }).sort((a, b) => b.revenuePerHour - a.revenuePerHour);
  }

  // CSVエクスポート
  exportTableRevenue(): string {
    const headers = ['テーブルID', 'テーブル名', 'タイプ', 'ステークス', 'ハンド数', '総ポット', '総レーキ', '日次収益', '週次収益', '月次収益'];
    
    const rows = Array.from(this.tables.values()).map(table => [
      table.tableId,
      table.tableName,
      table.tableType,
      table.stakes,
      table.totalHands,
      table.totalPots.toFixed(2),
      table.totalRakeCollected.toFixed(2),
      table.dailyRevenue.toFixed(2),
      table.weeklyRevenue.toFixed(2),
      table.monthlyRevenue.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// グローバルインスタンス
export const tableRevenueManager = new TableRevenueManager();

// 初期テーブル作成（モック）
export function initializeMockTables() {
  // テーブル1
  const table1 = tableRevenueManager.createTable(
    'table1',
    'NLH 720/ボムポット',
    'cash',
    '$0.10/$0.20'
  );

  // モックハンド記録
  for (let i = 0; i < 50; i++) {
    tableRevenueManager.recordHand(
      'table1',
      `hand-${i}`,
      100 + Math.random() * 500,
      ['p1', 'p2', 'p3', 'p4'],
      { p1: 50, p2: 30, p3: 20, p4: 100 },
      0.10,
      0.20
    );
  }

  // テーブル2（ハイステークス）
  const table2 = tableRevenueManager.createTable(
    'table2',
    'High Stakes NLH',
    'cash',
    '$5/$10'
  );

  for (let i = 0; i < 30; i++) {
    tableRevenueManager.recordHand(
      'table2',
      `hand-hs-${i}`,
      1000 + Math.random() * 5000,
      ['p5', 'p6'],
      { p5: 2000, p6: 3000 },
      5,
      10
    );
  }

  // トーナメント
  const table3 = tableRevenueManager.createTable(
    'table3',
    'Daily Main Event',
    'tournament',
    '$100+$10'
  );

  tableRevenueManager.recordTournamentEntry('table3', 100, 256);
}

// モックデータ初期化
initializeMockTables();
