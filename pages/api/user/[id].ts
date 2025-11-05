import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { users, playerStats } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const [stats] = await db.select()
        .from(playerStats)
        .where(eq(playerStats.userId, id))
        .limit(1);

      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        chips: user.chips,
        level: user.level,
        experience: user.experience,
        totalGamesPlayed: stats?.totalGames || 0,
        totalWins: stats?.gamesWon || 0,
        totalEarnings: stats?.totalChipsWon || 0,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { avatar, username, bio } = req.body;

      const updateData: any = {};
      if (avatar !== undefined) updateData.avatar = avatar;
      if (username !== undefined) updateData.username = username;

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, id));

      return res.status(200).json({ message: 'Avatar updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
