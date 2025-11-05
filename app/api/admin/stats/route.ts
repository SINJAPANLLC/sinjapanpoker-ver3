import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db-api';
import { tournaments, games, users } from '@/shared/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
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
    
    // 収益データの計算
    let totalRake = 0;
    let totalTournamentFees = 0;
    
    for (const game of activeGames) {
      const rake = (game as any).rake || 0;
      const fee = (game as any).fee || 0;
      totalRake += rake;
      if (game.type === 'tournament') {
        totalTournamentFees += fee;
      }
    }

    // トッププレイヤー取得（チップ数順）
    const topPlayers = await db
      .select({
        id: users.id,
        username: users.username,
        chips: users.chips,
      })
      .from(users)
      .orderBy(sql`${users.chips} DESC`)
      .limit(10);

    // 新規ユーザー数
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const newUsersToday = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(gte(users.createdAt, oneDayAgo));

    const activeUsersWeek = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(gte(users.lastLogin, oneWeekAgo));

    return NextResponse.json({
      revenue: {
        total: totalRake + totalTournamentFees,
        rake: totalRake,
        tournament: totalTournamentFees,
        vip: 0,
      },
      users: {
        total: totalUsers[0]?.count || 0,
        new: newUsersToday[0]?.count || 0,
        active: activeUsersWeek[0]?.count || 0,
        newWeek: newUsersToday[0]?.count || 0,
      },
      games: {
        total: activeGames.length,
        today: todayGames,
        week: todayGames,
        active: activeGames.length,
      },
      topRakePlayers: topPlayers.map((p, i) => ({
        rank: i + 1,
        username: p.username,
        rakePaid: 0,
        gamesPlayed: 0,
      })),
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
