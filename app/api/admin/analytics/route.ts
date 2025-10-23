import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db-api';
import { games, handHistory, users, playerStats } from '@/shared/schema';
import { desc, gte, sql, count } from 'drizzle-orm';
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
    const period = searchParams.get('period') || 'week'; // today, week, month, all

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

    // ユーザー統計
    const userStats = await db
      .select({
        totalUsers: count(),
        totalChips: sql<number>`COALESCE(SUM(${users.chips}), 0)`,
        avgChips: sql<number>`COALESCE(AVG(${users.chips}), 0)`,
      })
      .from(users);

    // ゲーム統計
    const gameStats = await db
      .select({
        totalGames: count(),
        avgPlayersPerGame: sql<number>`COALESCE(AVG(jsonb_array_length(${games.players})), 0)`,
        avgPot: sql<number>`COALESCE(AVG(${games.pot}), 0)`,
      })
      .from(games)
      .where(gte(games.createdAt, startDate));

    // 時間別ゲーム数（24時間）
    const hourlyGames = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${games.createdAt})`,
        games: count(),
      })
      .from(games)
      .where(gte(games.createdAt, startDate))
      .groupBy(sql`EXTRACT(HOUR FROM ${games.createdAt})`)
      .orderBy(sql`EXTRACT(HOUR FROM ${games.createdAt})`);

    // プレイヤーアクティビティ
    const playerActivity = await db
      .select({
        date: sql<string>`DATE(${handHistory.createdAt})`,
        uniquePlayers: sql<number>`COUNT(DISTINCT ${handHistory.userId})`,
        totalHands: count(),
      })
      .from(handHistory)
      .where(gte(handHistory.createdAt, startDate))
      .groupBy(sql`DATE(${handHistory.createdAt})`)
      .orderBy(sql`DATE(${handHistory.createdAt})`);

    // トッププレイヤー（勝率順）
    const topPlayers = await db
      .select({
        userId: playerStats.userId,
        username: users.username,
        winRate: playerStats.winRate,
        totalGames: playerStats.totalGames,
        gamesWon: playerStats.gamesWon,
        totalChipsWon: playerStats.totalChipsWon,
      })
      .from(playerStats)
      .innerJoin(users, sql`${users.id} = ${playerStats.userId}`)
      .where(sql`${playerStats.totalGames} >= 10`)
      .orderBy(desc(playerStats.winRate))
      .limit(10);

    // ゲームフェーズ分析
    const phaseDistribution = await db
      .select({
        phase: games.phase,
        count: count(),
      })
      .from(games)
      .where(gte(games.createdAt, startDate))
      .groupBy(games.phase);

    return NextResponse.json({
      summary: {
        totalUsers: userStats[0]?.totalUsers || 0,
        totalChips: userStats[0]?.totalChips || 0,
        avgChips: Math.floor(userStats[0]?.avgChips || 0),
        totalGames: gameStats[0]?.totalGames || 0,
        avgPlayersPerGame: Number((gameStats[0]?.avgPlayersPerGame || 0).toFixed(1)),
        avgPot: Math.floor(gameStats[0]?.avgPot || 0),
      },
      hourlyGames,
      playerActivity,
      topPlayers,
      phaseDistribution,
      period,
    });
  } catch (error) {
    console.error('Admin analytics fetch error:', error);
    return NextResponse.json(
      { error: '分析データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
