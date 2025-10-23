import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/server/db-api';
import { games, handHistory, users } from '@/shared/schema';
import { desc, gte, sql, and, between } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
  // Admin認証チェック
  const authResult = requireAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today'; // today, week, month, all

    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    // ゲーム履歴から収益を集計
    const gameRevenue = await db
      .select({
        totalGames: sql<number>`COUNT(*)`,
        totalPot: sql<number>`COALESCE(SUM(${games.pot}), 0)`,
        avgPot: sql<number>`COALESCE(AVG(${games.pot}), 0)`,
      })
      .from(games)
      .where(gte(games.createdAt, startDate));

    // ハンド履歴から詳細な収益データを取得
    const handData = await db
      .select({
        totalHands: sql<number>`COUNT(*)`,
        totalChipsChange: sql<number>`COALESCE(SUM(${handHistory.chipsChange}), 0)`,
      })
      .from(handHistory)
      .where(gte(handHistory.createdAt, startDate));

    // レーキ計算（5%）
    const rakeRate = 0.05;
    const totalRake = Math.floor((gameRevenue[0]?.totalPot || 0) * rakeRate);

    // 日別の収益推移
    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${games.createdAt})`,
        games: sql<number>`COUNT(*)`,
        totalPot: sql<number>`COALESCE(SUM(${games.pot}), 0)`,
        rake: sql<number>`COALESCE(SUM(${games.pot}) * ${rakeRate}, 0)`,
      })
      .from(games)
      .where(gte(games.createdAt, startDate))
      .groupBy(sql`DATE(${games.createdAt})`)
      .orderBy(sql`DATE(${games.createdAt})`);

    // トップユーザー（チップ獲得順）
    const topWinners = await db
      .select({
        userId: handHistory.userId,
        username: users.username,
        totalWinnings: sql<number>`COALESCE(SUM(${handHistory.chipsChange}), 0)`,
        handsPlayed: sql<number>`COUNT(*)`,
      })
      .from(handHistory)
      .innerJoin(users, sql`${users.id} = ${handHistory.userId}`)
      .where(gte(handHistory.createdAt, startDate))
      .groupBy(handHistory.userId, users.username)
      .orderBy(desc(sql`COALESCE(SUM(${handHistory.chipsChange}), 0)`))
      .limit(10);

    return NextResponse.json({
      summary: {
        totalGames: gameRevenue[0]?.totalGames || 0,
        totalPot: gameRevenue[0]?.totalPot || 0,
        avgPot: Math.floor(gameRevenue[0]?.avgPot || 0),
        totalHands: handData[0]?.totalHands || 0,
        totalRake,
        rakeRate: `${rakeRate * 100}%`,
      },
      dailyRevenue,
      topWinners,
      period,
    });
  } catch (error) {
    console.error('Admin revenue fetch error:', error);
    return NextResponse.json(
      { error: '収益データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
