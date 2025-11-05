import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db-api';
import { users } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const { userId, chips, reason, chipType = 'real', energy } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    if (energy !== undefined) {
      if (typeof energy !== 'number') {
        return NextResponse.json(
          { error: 'エネルギー数は数値である必要があります' },
          { status: 400 }
        );
      }

      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { error: '付与理由が必要です' },
          { status: 400 }
        );
      }

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
      const currentEnergy = user.energy || 0;

      if (currentEnergy + energy < 0) {
        return NextResponse.json(
          { error: 'エネルギーがマイナスになります' },
          { status: 400 }
        );
      }

      await db
        .update(users)
        .set({
          energy: sql`${users.energy} + ${energy}`,
        })
        .where(eq(users.id, userId));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      console.log(`エネルギー付与: ${user.username} に ${energy} エネルギー付与（理由: ${reason}）`);

      return NextResponse.json({
        success: true,
        message: `${user.username}に${Math.abs(energy)}エネルギーを${energy > 0 ? '付与' : '減算'}しました`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          realChips: updatedUser.realChips,
          gameChips: updatedUser.gameChips,
          energy: updatedUser.energy,
        },
      });
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
    const chipField = chipType === 'game' ? users.gameChips : users.realChips;
    const currentChips = chipType === 'game' ? user.gameChips : user.realChips;

    if (currentChips + chips < 0) {
      return NextResponse.json(
        { error: 'チップ数がマイナスになります' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        [chipType === 'game' ? 'gameChips' : 'realChips']: sql`${chipField} + ${chips}`,
      })
      .where(eq(users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    console.log(`チップ付与: ${user.username} に ${chips} ${chipType === 'game' ? 'ゲーム' : 'リアル'}チップ付与（理由: ${reason}）`);

    return NextResponse.json({
      success: true,
      message: `${user.username}に${Math.abs(chips)}${chipType === 'game' ? 'ゲーム' : 'リアル'}チップを${chips > 0 ? '付与' : '減算'}しました`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        realChips: updatedUser.realChips,
        gameChips: updatedUser.gameChips,
        energy: updatedUser.energy,
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
