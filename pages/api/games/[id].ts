import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { games, handHistory } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    // Get game details
    const game = await db
      .select()
      .from(games)
      .where(eq(games.gameId, id))
      .limit(1);

    if (game.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get hand history for this game
    const hands = await db
      .select()
      .from(handHistory)
      .where(eq(handHistory.gameId, id));

    return res.status(200).json({
      game: game[0],
      hands,
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
