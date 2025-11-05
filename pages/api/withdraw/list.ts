import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { withdrawalRequests } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) {
    return;
  }

  try {
    const userId = authUser.userId;

    const withdrawals = await db.select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.submittedAt));

    return res.status(200).json({
      success: true,
      withdrawals
    });
  } catch (error) {
    console.error('出金申請取得エラー:', error);
    return res.status(500).json({ message: '出金申請の取得中にエラーが発生しました' });
  }
}
