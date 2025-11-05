import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = requireAuth(req, res);
  if (!authUser) {
    return;
  }

  const userId = authUser.userId;

  if (req.method === 'GET') {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        achievements: user.achievements || []
      });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { achievementId, name, description, icon } = req.body;

      if (!achievementId || !name || !description || !icon) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existingAchievements = user.achievements || [];
      
      if (existingAchievements.some((a: any) => a.id === achievementId)) {
        return res.status(400).json({ message: 'Achievement already unlocked' });
      }

      const newAchievement = {
        id: achievementId,
        name,
        description,
        icon,
        unlockedAt: new Date()
      };

      const updatedAchievements = [...existingAchievements, newAchievement];

      await db.update(users)
        .set({ achievements: updatedAchievements })
        .where(eq(users.id, userId));

      return res.status(200).json({
        message: 'Achievement unlocked',
        achievement: newAchievement
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
