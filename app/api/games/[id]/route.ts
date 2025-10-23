import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { games, handHistory } from '@/shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const game = await db
      .select()
      .from(games)
      .where(eq(games.gameId, params.id))
      .limit(1);

    if (game.length === 0) {
      return NextResponse.json(
        { error: 'ゲームが見つかりません' },
        { status: 404 }
      );
    }

    const hands = await db
      .select()
      .from(handHistory)
      .where(eq(handHistory.gameId, params.id));

    return NextResponse.json({
      game: game[0],
      hands,
    });
  } catch (error) {
    console.error('ゲーム詳細取得エラー:', error);
    return NextResponse.json(
      { error: 'ゲーム詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}
