import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/storage';
import { playerStats, gameHistory } from '@/shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = authResult.userId;

    // プレイヤーの累計統計を取得
    let stats = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.userId, userId))
      .limit(1);

    // 統計レコードが存在しない場合は作成
    if (stats.length === 0) {
      await db.insert(playerStats).values({
        userId,
        totalGames: 0,
        gamesWon: 0,
        totalChipsWon: 0,
        totalChipsLost: 0,
        biggestPot: 0,
        bestHand: '',
        winRate: 0,
        vpip: 0,
        pfr: 0,
        aggression: 0,
        handsPlayed: 0,
      });

      stats = await db
        .select()
        .from(playerStats)
        .where(eq(playerStats.userId, userId))
        .limit(1);
    }

    // 今日の統計を取得
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayGames = await db
      .select()
      .from(gameHistory)
      .where(
        and(
          eq(gameHistory.userId, userId),
          gte(gameHistory.createdAt, today)
        )
      );

    // 今日の統計を計算
    const todayStats = {
      handsPlayed: todayGames.length,
      wins: todayGames.filter(g => g.result === 'win').length,
      winRate: todayGames.length > 0 
        ? Math.round((todayGames.filter(g => g.result === 'win').length / todayGames.length) * 100)
        : 0,
      chipsWon: todayGames
        .filter(g => g.chipsChange > 0)
        .reduce((sum, g) => sum + g.chipsChange, 0),
      biggestPot: Math.max(...todayGames.map(g => g.chipsChange), 0),
    };

    return NextResponse.json({
      success: true,
      stats: {
        // 累計統計
        total: {
          handsPlayed: stats[0].handsPlayed,
          totalGames: stats[0].totalGames,
          gamesWon: stats[0].gamesWon,
          winRate: stats[0].winRate,
          preflopWinRate: stats[0].pfr,
          showdownWinRate: Math.round(stats[0].winRate * 0.82), // 推定値
          totalChipsWon: stats[0].totalChipsWon,
          totalChipsLost: stats[0].totalChipsLost,
          biggestPot: stats[0].biggestPot,
          bestHand: stats[0].bestHand || 'ハイカード',
          vpip: stats[0].vpip,
          pfr: stats[0].pfr,
          aggression: stats[0].aggression,
        },
        // 今日の統計
        today: todayStats,
      },
    });
  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
