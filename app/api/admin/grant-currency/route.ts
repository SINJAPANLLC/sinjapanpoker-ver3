import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, chips, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    if (typeof chips !== 'number') {
      return NextResponse.json(
        { error: 'チップ数は数値である必要があります' },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: '付与理由が必要です' },
        { status: 400 }
      );
    }

    // ユーザーの存在確認
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // チップを更新（加算）
    const newChips = user.chips + chips;

    // マイナスにならないようにする
    if (newChips < 0) {
      return NextResponse.json(
        { error: 'チップ数がマイナスになります' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({ chips: newChips })
      .where(eq(users.id, userId));

    console.log(`チップ付与: ユーザー ${user.username} に ${chips} チップ付与（理由: ${reason}）`);

    return NextResponse.json({
      success: true,
      message: `${user.username}に${chips}チップを付与しました`,
      user: {
        id: user.id,
        username: user.username,
        chips: newChips,
      },
    });
  } catch (error) {
    console.error('チップ付与エラー:', error);
    return NextResponse.json(
      { error: 'チップの付与に失敗しました' },
      { status: 500 }
    );
  }
}
