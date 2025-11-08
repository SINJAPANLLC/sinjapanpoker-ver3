import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db-api';
import { users, clubTables } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { tableId, amount, currentTableChips } = body;

    if (!tableId || !amount || amount <= 0) {
      return NextResponse.json({ message: '無効なリクエストです' }, { status: 400 });
    }

    // テーブル情報を取得してバイイン範囲を検証
    const [table] = await db
      .select()
      .from(clubTables)
      .where(eq(clubTables.id, tableId))
      .limit(1);

    if (!table) {
      return NextResponse.json({ message: 'テーブルが見つかりません' }, { status: 404 });
    }

    // キャッシュゲームの場合、リバイ後の合計チップがmaxBuyInを超えないかチェック
    if (table.type === 'cash') {
      const totalAfterRebuy = (currentTableChips || 0) + amount;
      if (totalAfterRebuy > table.maxBuyIn) {
        return NextResponse.json({
          message: `リバイ後のチップ数が最大バイイン（${table.maxBuyIn}）を超えます`,
        }, { status: 400 });
      }
      if (amount < table.minBuyIn) {
        return NextResponse.json({
          message: `最低${table.minBuyIn}チップから追加できます`,
        }, { status: 400 });
      }
    }

    // ユーザーのrealChipsを確認
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authResult.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }

    if (user.realChips < amount) {
      return NextResponse.json({ message: 'チップが不足しています' }, { status: 400 });
    }

    // realChipsからamountを差し引く
    await db
      .update(users)
      .set({
        realChips: sql`${users.realChips} - ${amount}`,
      })
      .where(eq(users.id, authResult.userId));

    console.log(`リバイ成功: ユーザー ${authResult.username} が ${amount} チップを追加`);

    return NextResponse.json({
      message: 'リバイに成功しました',
      amount,
      newBalance: user.realChips - amount,
    });
  } catch (error) {
    console.error('リバイエラー:', error);
    return NextResponse.json({ message: 'リバイ処理に失敗しました' }, { status: 500 });
  }
}
