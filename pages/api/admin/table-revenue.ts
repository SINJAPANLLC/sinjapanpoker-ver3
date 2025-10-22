import type { NextApiRequest, NextApiResponse } from 'next';
import { tableRevenueManager } from '@/lib/table-revenue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { tableId, period } = req.query;

    // 特定テーブルの収益
    if (tableId && typeof tableId === 'string') {
      const tableRevenue = tableRevenueManager.getTableRevenue(tableId);
      
      if (!tableRevenue) {
        return res.status(404).json({ message: 'テーブルが見つかりません' });
      }

      return res.status(200).json(tableRevenue);
    }

    // 全テーブルの収益
    const allTables = tableRevenueManager.getAllTables();
    const topTables = tableRevenueManager.getTopRevenueTable(10);
    const hourlyAnalysis = tableRevenueManager.getHourlyRevenueAnalysis();
    const performance = tableRevenueManager.compareTablePerformance();

    // 期間別サマリー
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary = tableRevenueManager.getRevenueSummary(startOfMonth, now);

    return res.status(200).json({
      tables: allTables,
      topTables,
      hourlyAnalysis,
      performance,
      summary,
      totals: {
        totalRevenue: allTables.reduce((sum, t) => sum + t.totalRakeCollected + t.tournamentFees, 0),
        totalHands: allTables.reduce((sum, t) => sum + t.totalHands, 0),
        activeTables: allTables.length,
        totalPlayers: allTables.reduce((sum, t) => sum + t.uniquePlayers, 0)
      }
    });
  } catch (error) {
    console.error('Table revenue fetch error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
