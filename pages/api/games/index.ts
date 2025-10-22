import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { games } from '@/shared/schema';
import { desc, sql, count } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await db.select({ count: count() }).from(games);
    const total = totalResult[0]?.count || 0;

    // Get games with pagination
    const gamesList = await db
      .select()
      .from(games)
      .orderBy(desc(games.createdAt))
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      games: gamesList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
