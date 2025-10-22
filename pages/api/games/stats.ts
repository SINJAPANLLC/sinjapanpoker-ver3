import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { games, handHistory } from '@/shared/schema';
import { sql, count } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Total games
    const totalGamesResult = await db.select({ count: count() }).from(games);
    const totalGames = totalGamesResult[0]?.count || 0;

    // Total hands
    const totalHandsResult = await db.select({ count: count() }).from(handHistory);
    const totalHands = totalHandsResult[0]?.count || 0;

    // Total pot
    const totalPotResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${games.pot}), 0)` })
      .from(games);
    const totalPot = totalPotResult[0]?.total || 0;

    // Games by type
    const gamesByType = await db
      .select({
        type: games.type,
        count: count(),
      })
      .from(games)
      .groupBy(games.type);

    return res.status(200).json({
      totalGames,
      totalHands,
      totalPot,
      gamesByType,
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
