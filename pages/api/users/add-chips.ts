import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, chips } = req.body;

    if (!userId || !chips) {
      return res.status(400).json({ error: 'userId and chips are required' });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentChips = user[0].chips || 0;
    const newChips = currentChips + parseInt(chips);

    await db
      .update(users)
      .set({ chips: newChips })
      .where(eq(users.id, userId));

    return res.status(200).json({
      success: true,
      newChips,
      addedChips: parseInt(chips),
    });
  } catch (error: any) {
    console.error('Add chips error:', error);
    return res.status(500).json({ 
      error: 'Failed to add chips',
      message: error.message 
    });
  }
}
