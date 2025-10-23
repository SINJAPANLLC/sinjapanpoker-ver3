import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { games, handHistory } from '@/shared/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const totalGamesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(games);
    
    const totalGames = Number(totalGamesResult[0]?.count || 0);

    const totalHandsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(handHistory);
    
    const totalHands = Number(totalHandsResult[0]?.count || 0);

    const totalPotResult = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(CAST(${games.pot} AS BIGINT)), 0)`
      })
      .from(games);
    
    const totalPot = Number(totalPotResult[0]?.total || 0);

    const gamesByTypeResult = await db
      .select({
        type: games.type,
        count: sql<number>`count(*)`
      })
      .from(games)
      .groupBy(games.type);
    
    const gamesByType = gamesByTypeResult.map(row => ({
      type: row.type,
      count: Number(row.count)
    }));

    return NextResponse.json({
      totalGames,
      totalHands,
      totalPot,
      gamesByType,
    });
  } catch (error) {
    console.error('ゲーム統計取得エラー:', error);
    return NextResponse.json(
      { error: 'ゲーム統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
