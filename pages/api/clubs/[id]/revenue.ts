import type { NextApiRequest, NextApiResponse } from 'next';
import { clubManager } from '@/lib/club-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { period = 'alltime' } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ message: '無効なクラブID' });
    }

    const club = clubManager.getClub(id);
    if (!club) {
      return res.status(404).json({ message: 'クラブが見つかりません' });
    }

    const revenue = clubManager.getClubRevenue(id, period as any);
    if (!revenue) {
      return res.status(404).json({ message: '収益データが見つかりません' });
    }

    return res.status(200).json({
      club: {
        id: club.id,
        name: club.name,
        code: club.code,
        ownerUsername: club.ownerUsername,
        memberCount: club.memberCount,
        tier: club.tier,
        rakePercentage: club.rakePercentage
      },
      revenue
    });
  } catch (error) {
    console.error('Club revenue fetch error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
