import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { kycVerifications } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) {
    return;
  }

  const userId = authUser.userId;

  try {
    const [kycData] = await db.select()
      .from(kycVerifications)
      .where(eq(kycVerifications.userId, userId))
      .limit(1);

    if (!kycData) {
      return res.status(200).json({ status: 'not_submitted' });
    }

    return res.status(200).json({
      status: kycData.status,
      submittedAt: kycData.submittedAt,
      reviewedAt: kycData.reviewedAt,
      rejectionReason: kycData.rejectionReason
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
