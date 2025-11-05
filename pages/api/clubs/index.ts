import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db-api';
import { clubs } from '@/shared/schema';
import { eq, or, like, and } from 'drizzle-orm';

// クラブコード生成ヘルパー
function generateClubCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { userId, search } = req.query;

      let query = db.select().from(clubs);
      
      // ユーザーのクラブフィルター（members配列にuserIdが含まれる）
      if (userId && typeof userId === 'string') {
        // Note: JSONBフィルタリングは複雑なので、全てを取得してアプリケーション側でフィルター
        const allClubs = await db.select().from(clubs);
        const userClubs = allClubs.filter(club => 
          (club.members || []).some((m: any) => m.userId === userId)
        );
        
        return res.status(200).json({
          clubs: userClubs,
          total: userClubs.length
        });
      }

      // 検索フィルター
      let allClubs;
      if (search && typeof search === 'string') {
        allClubs = await db.select().from(clubs).where(
          or(
            like(clubs.name, `%${search}%`),
            like(clubs.clubCode, `%${search}%`)
          )
        );
      } else {
        allClubs = await db.select().from(clubs);
      }

      return res.status(200).json({
        clubs: allClubs,
        total: allClubs.length
      });
    } catch (error) {
      console.error('Clubs fetch error:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, ownerId, ownerUsername, description, rakePercentage, isPrivate, maxMembers } = req.body;

      // バリデーション
      if (!name || !ownerId || !ownerUsername) {
        return res.status(400).json({ message: '必須項目が不足しています' });
      }

      const clubCode = generateClubCode();

      // クラブをDBに作成
      const [newClub] = await db.insert(clubs).values({
        name,
        ownerId,
        ownerUsername,
        description: description || '',
        clubCode,
        rakePercentage: rakePercentage || 20,
        isPrivate: isPrivate || false,
        maxMembers: maxMembers || 100,
        members: [{
          userId: ownerId,
          username: ownerUsername,
          role: 'owner' as const,
          joinedAt: new Date(),
          gamesPlayed: 0,
          rakePaid: 0,
          earnings: 0,
          status: 'active' as const,
          lastActiveAt: new Date()
        }],
        memberCount: 1,
      }).returning();

      return res.status(201).json({
        message: 'クラブを作成しました',
        club: newClub
      });
    } catch (error) {
      console.error('Club create error:', error);
      return res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
