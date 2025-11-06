import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/storage';
import { gameHistory } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const history = await db
      .select()
      .from(gameHistory)
      .where(eq(gameHistory.userId, authResult.userId))
      .orderBy(desc(gameHistory.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      history,
      hasMore: history.length === limit,
    });
  } catch (error) {
    console.error('Hand history error:', error);
    return NextResponse.json(
      { error: 'ハンド履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}
