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

    // 練習モード判定（tableIdが'practice-game'で始まる場合）
    const isPracticeMode = tableId.startsWith('practice-game');

    // 練習モード以外はテーブル情報を取得
    if (!isPracticeMode) {
      const [table] = await db
        .select()
        .from(clubTables)
        .where(eq(clubTables.id, tableId))
        .limit(1);

      if (!table) {
        return NextResponse.json({ message: 'テーブルが見つかりません' }, { status: 404 });
      }

      // サーバー側のゲーム状態から現在のチップ数を取得（権威的な状態）
      let currentTableChips = 0;
      if (global.pokerGames && global.pokerGames.has(tableId)) {
        const game = global.pokerGames.get(tableId);
        const player = game.players.find((p: any) => p.userId === authResult.userId);
        if (player) {
          currentTableChips = player.chips || 0;
        }
      }

      // キャッシュゲームの場合、リバイ後の合計チップがmaxBuyInを超えないかチェック
      if (table.type === 'cash') {
        const totalAfterRebuy = currentTableChips + amount;
        if (totalAfterRebuy > table.maxBuyIn) {
          return NextResponse.json({
            message: `リバイ後のチップ数が最大バイイン（${table.maxBuyIn}）を超えます（現在: ${currentTableChips}, 追加: ${amount}, 最大: ${table.maxBuyIn}）`,
          }, { status: 400 });
        }
        if (amount < table.minBuyIn) {
          return NextResponse.json({
            message: `最低${table.minBuyIn}チップから追加できます`,
          }, { status: 400 });
        }
      }
    }

    // ユーザー情報を取得
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authResult.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }

    // 練習モードの場合はgameChipsを使用、それ以外はrealChipsを使用
    if (isPracticeMode) {
      // gameChipsのチェック
      if (user.gameChips < amount) {
        return NextResponse.json({ message: 'チップが不足しています' }, { status: 400 });
      }

      // gameChipsから差し引く
      await db
        .update(users)
        .set({
          gameChips: sql`${users.gameChips} - ${amount}`,
        })
        .where(eq(users.id, authResult.userId));

      console.log(`練習モードリバイ成功: ユーザー ${authResult.username} が ${amount} gameChipsを追加`);

      return NextResponse.json({
        message: 'リバイに成功しました',
        amount,
        newBalance: user.gameChips - amount,
        isPracticeMode: true,
      });
    } else {
      // realChipsのチェック
      if (user.realChips < amount) {
        return NextResponse.json({ message: 'チップが不足しています' }, { status: 400 });
      }

      // realChipsから差し引く
      await db
        .update(users)
        .set({
          realChips: sql`${users.realChips} - ${amount}`,
        })
        .where(eq(users.id, authResult.userId));

      console.log(`リバイ成功: ユーザー ${authResult.username} が ${amount} realChipsを追加`);

      return NextResponse.json({
        message: 'リバイに成功しました',
        amount,
        newBalance: user.realChips - amount,
        isPracticeMode: false,
      });
    }
  } catch (error) {
    console.error('リバイエラー:', error);
    return NextResponse.json({ message: 'リバイ処理に失敗しました' }, { status: 500 });
  }
}
