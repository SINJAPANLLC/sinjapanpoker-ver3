import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tournaments, games, users } from '@/shared/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    // アクティブトーナメント取得
    const activeTournaments = await db
      .select()
      .from(tournaments)
      .where(
        sql`${tournaments.status} IN ('registering', 'in-progress')`
      );

    // アクティブゲーム取得（過去24時間以内）
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeGames = await db
      .select()
      .from(games)
      .where(gte(games.createdAt, twentyFourHoursAgo));

    // 総ユーザー数
    const totalUsers = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    // 総チップ数（全ユーザー）
    const totalChipsResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${users.chips}), 0)` })
      .from(users);

    // 総参加者数（アクティブトーナメント）
    const totalPlayers = activeTournaments.reduce(
      (sum, t) => sum + (t.currentPlayers || 0),
      0
    );

    // 賞金総額（アクティブトーナメント）
    const totalPrizePool = activeTournaments.reduce(
      (sum, t) => sum + (t.prizePool || 0),
      0
    );

    // 今日の統計（過去24時間）
    const todayGames = activeGames.length;
    
    return NextResponse.json({
      activeTournaments: {
        count: activeTournaments.length,
        totalPlayers,
        totalPrizePool,
        tournaments: activeTournaments.map(t => ({
          id: t.id,
          name: t.name,
          currentPlayers: t.currentPlayers,
          maxPlayers: t.maxPlayers,
          prizePool: t.prizePool,
          status: t.status,
          startTime: t.startTime,
        })),
      },
      activeGames: {
        count: activeGames.length,
        games: activeGames.map(g => ({
          id: g.id,
          playersCount: g.players ? (Array.isArray(g.players) ? g.players.length : 0) : 0,
          pot: g.pot,
          phase: g.phase,
          createdAt: g.createdAt,
        })),
      },
      systemStats: {
        totalUsers: totalUsers[0]?.count || 0,
        totalChips: totalChipsResult[0]?.total || 0,
        todayGames,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
