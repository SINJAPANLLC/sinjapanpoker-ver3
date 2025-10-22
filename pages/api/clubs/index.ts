import type { NextApiRequest, NextApiResponse } from 'next';
import { clubManager } from '@/lib/club-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { userId, search } = req.query;

      let clubs = clubManager.getAllClubs();

      // ユーザーのクラブフィルター
      if (userId && typeof userId === 'string') {
        clubs = clubManager.getUserClubs(userId);
      }

      // 検索フィルター
      if (search && typeof search === 'string') {
        clubs = clubManager.searchClubs(search);
      }

      return res.status(200).json({
        clubs,
        total: clubs.length
      });
    } catch (error) {
      console.error('Clubs fetch error:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, ownerId, ownerUsername, description, rakePercentage, isPrivate, maxMembers } = req.body;

      const club = clubManager.createClub({
        name,
        ownerId,
        ownerUsername,
        description,
        rakePercentage: rakePercentage || 20,
        isPrivate: isPrivate || false,
        maxMembers: maxMembers || 100
      });

      return res.status(201).json({
        message: 'クラブを作成しました',
        club
      });
    } catch (error) {
      console.error('Club create error:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
