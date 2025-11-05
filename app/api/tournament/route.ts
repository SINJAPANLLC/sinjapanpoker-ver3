import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/server/db';
import { tournaments } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const allTournaments = status
      ? await db.select().from(tournaments).where(eq(tournaments.status, status as any)).orderBy(desc(tournaments.createdAt))
      : await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));

    return NextResponse.json(allTournaments);
  } catch (error) {
    console.error('トーナメント一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'トーナメント一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { 
      error: 'このエンドポイントは廃止されました。トーナメント作成は /api/admin/tournaments を使用してください',
      deprecatedEndpoint: true 
    },
    { status: 410 }
  );
}
