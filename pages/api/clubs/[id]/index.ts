import type { NextApiRequest, NextApiResponse } from 'next';
import { clubManager } from '@/lib/club-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: '無効なクラブID' });
  }

  if (req.method === 'GET') {
    const club = clubManager.getClub(id);
    
    if (!club) {
      return res.status(404).json({ message: 'クラブが見つかりません' });
    }

    return res.status(200).json(club);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
