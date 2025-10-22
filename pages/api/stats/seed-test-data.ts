import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { handHistory, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userExists.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const testData = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const gamesPerDay = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < gamesPerDay; j++) {
        const isWin = Math.random() > 0.4;
        const chipsChange = isWin 
          ? Math.floor(Math.random() * 2000) + 500
          : -Math.floor(Math.random() * 1500) - 200;
        
        testData.push({
          userId,
          gameId: `game-${i}-${j}`,
          gameType: 'Texas Hold\'em',
          blinds: '50/100',
          chipsChange,
          result: (isWin ? 'win' : 'loss') as 'win' | 'loss' | 'tie',
          hand: isWin ? 'Flush' : 'High Card',
          createdAt: date,
        });
      }
    }

    await db.insert(handHistory).values(testData);

    return res.status(200).json({ 
      message: 'Test data seeded successfully',
      recordsCreated: testData.length 
    });
  } catch (error) {
    console.error('Error seeding test data:', error);
    return res.status(500).json({ error: 'Failed to seed test data' });
  }
}
