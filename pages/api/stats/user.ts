import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { gameHistory, playerStats, users } from '@/shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, period = 'all' } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const now = new Date();
    let dateFilter: Date | null = null;

    if (period === 'day') {
      dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'week') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereCondition = dateFilter
      ? and(eq(gameHistory.userId, userId), gte(gameHistory.createdAt, dateFilter))
      : eq(gameHistory.userId, userId);

    // Get aggregate stats (no limit for accurate totals)
    const allHistory = await db
      .select()
      .from(gameHistory)
      .where(whereCondition);

    const totalChipsChange = allHistory.reduce((sum, h) => sum + (h.chipsChange || 0), 0);
    const gamesPlayed = allHistory.length;
    const gamesWon = allHistory.filter(h => h.result === 'win').length;
    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

    // Get recent history separately (with limit for display)
    const recentHistory = await db
      .select()
      .from(gameHistory)
      .where(whereCondition)
      .orderBy(sql`${gameHistory.createdAt} DESC`)
      .limit(20);

    const recentEarnings = recentHistory.reduce((sum, h) => sum + (h.chipsChange || 0), 0);

    const stats = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.userId, userId))
      .limit(1);

    const chartData: { date: string; earnings: number }[] = [];
    const groupedByDay: { [key: string]: number } = {};
    
    // Use all history for chart data to show accurate trends
    allHistory.forEach(h => {
      const date = new Date(h.createdAt);
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (!groupedByDay[dateKey]) {
        groupedByDay[dateKey] = 0;
      }
      groupedByDay[dateKey] += h.chipsChange;
    });

    const sortedDates = Object.keys(groupedByDay).sort((a, b) => {
      const [aMonth, aDay] = a.split('/').map(Number);
      const [bMonth, bDay] = b.split('/').map(Number);
      return aMonth === bMonth ? aDay - bDay : aMonth - bMonth;
    });

    let cumulativeEarnings = 0;
    sortedDates.forEach(dateKey => {
      cumulativeEarnings += groupedByDay[dateKey];
      chartData.push({
        date: dateKey,
        earnings: cumulativeEarnings,
      });
    });

    const handHistoryData = recentHistory.map(h => ({
      gameType: h.gameType,
      blinds: h.blinds,
      chips: h.chipsChange,
      result: h.result,
      date: new Date(h.createdAt).toLocaleString('ja-JP'),
    }));

    return res.status(200).json({
      gamesPlayed,
      winRate,
      totalEarnings: totalChipsChange,
      recentEarnings,
      handHistory: handHistoryData,
      chartData,
      playerStats: stats[0] || null,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Failed to fetch user stats' });
  }
}
