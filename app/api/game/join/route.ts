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
    const { tableId, amount } = body;

    if (!tableId || !amount || amount <= 0) {
      return NextResponse.json({ message: '無効なリクエストです' }, { status: 400 });
    }

    // テーブル情報を取得
    const [table] = await db
      .select()
      .from(clubTables)
      .where(eq(clubTables.id, tableId))
      .limit(1);

    if (!table) {
      return NextResponse.json({ message: 'テーブルが見つかりません' }, { status: 404 });
    }

    // キャッシュゲームの場合、バイイン範囲をチェック
    if (table.type === 'cash') {
      if (amount < table.minBuyIn || amount > table.maxBuyIn) {
        return NextResponse.json({
          message: `バイイン額は${table.minBuyIn}～${table.maxBuyIn}の範囲で設定してください`,
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

    console.log(`ゲーム参加: ユーザー ${authResult.username} が ${amount} チップでテーブル ${tableId} に参加`);

    return NextResponse.json({
      message: 'ゲーム参加に成功しました',
      amount,
      newBalance: user.realChips - amount,
    });
  } catch (error) {
    console.error('ゲーム参加エラー:', error);
    return NextResponse.json({ message: 'ゲーム参加処理に失敗しました' }, { status: 500 });
  }
}
