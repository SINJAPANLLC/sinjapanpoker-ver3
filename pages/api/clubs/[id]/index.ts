import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db-api';
import { clubs } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: '無効なクラブID' });
  }

  if (req.method === 'GET') {
    try {
      const [club] = await db.select().from(clubs).where(eq(clubs.id, id));
      
      if (!club) {
        return res.status(404).json({ message: 'クラブが見つかりません' });
      }

      return res.status(200).json(club);
    } catch (error) {
      console.error('Club fetch error:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const updateData = req.body;
      
      const [updatedClub] = await db
        .update(clubs)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(clubs.id, id))
        .returning();

      if (!updatedClub) {
        return res.status(404).json({ message: 'クラブが見つかりません' });
      }

      return res.status(200).json({
        message: 'クラブを更新しました',
        club: updatedClub
      });
    } catch (error) {
      console.error('Club update error:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const [deletedClub] = await db
        .delete(clubs)
        .where(eq(clubs.id, id))
        .returning();

      if (!deletedClub) {
        return res.status(404).json({ message: 'クラブが見つかりません' });
      }

      return res.status(200).json({
        message: 'クラブを削除しました'
      });
    } catch (error) {
      console.error('Club delete error:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
