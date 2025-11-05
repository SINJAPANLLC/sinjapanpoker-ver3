import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db-api';
import { clubs, clubTables } from '@/shared/schema';
import { eq } from 'drizzle-orm';

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

    // クラブ情報を取得
    const [club] = await db.select().from(clubs).where(eq(clubs.id, id));
    
    if (!club) {
      return res.status(404).json({ message: 'クラブが見つかりません' });
    }

    // クラブのテーブル情報を取得
    const tables = await db.select().from(clubTables).where(eq(clubTables.clubId, id));

    // 収益データを構築
    let totalRevenue = club.totalRevenue;
    if (period === 'daily') {
      totalRevenue = club.dailyRevenue;
    } else if (period === 'weekly') {
      totalRevenue = club.weeklyRevenue;
    } else if (period === 'monthly') {
      totalRevenue = club.monthlyRevenue;
    }

    const revenue = {
      clubId: club.id,
      period: period as string,
      totalRevenue,
      rakeRevenue: club.totalRakeCollected,
      tournamentRevenue: 0,
      tableBreakdown: tables.map(table => ({
        tableId: table.id,
        tableName: table.name,
        revenue: table.clubRevenue,
        hands: table.totalHands,
        avgRevenuePerHand: table.totalHands > 0 ? table.clubRevenue / table.totalHands : 0
      })),
      memberBreakdown: (club.members || []).map((member: any) => ({
        userId: member.userId,
        username: member.username,
        rakePaid: member.rakePaid || 0,
        gamesPlayed: member.gamesPlayed || 0,
        contribution: totalRevenue > 0 ? ((member.rakePaid || 0) / totalRevenue) * 100 : 0
      })),
      hourlyRevenue: [] // 時間帯別収益は今後実装
    };

    return res.status(200).json({
      club: {
        id: club.id,
        name: club.name,
        clubCode: club.clubCode,
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
