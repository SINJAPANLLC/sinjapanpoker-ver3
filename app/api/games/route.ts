import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/server/db';
import { games } from '@/shared/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const allGames = await db
      .select()
      .from(games)
      .orderBy(desc(games.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(games);
    
    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      games: allGames,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('ゲーム一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'ゲーム一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
