import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { clubTables } from '@/shared/schema';
import { desc } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // 全テーブルを取得（認証不要でロビーに表示）
    const allTables = await db
      .select()
      .from(clubTables)
      .orderBy(desc(clubTables.createdAt));

    return NextResponse.json({
      tables: allTables,
    });
  } catch (error) {
    console.error('テーブル取得エラー:', error);
    return NextResponse.json({ message: 'テーブル情報の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { name, stakes, maxPlayers, type, rakePercentage, rakeCap } = body;

    if (!name || !stakes || !maxPlayers) {
      return NextResponse.json({ message: '必須フィールドが不足しています' }, { status: 400 });
    }

    if (maxPlayers < 2 || maxPlayers > 9) {
      return NextResponse.json({ message: 'プレイヤー数は2～9人です' }, { status: 400 });
    }

    const rakePercent = rakePercentage !== undefined ? Math.round(rakePercentage * 100) : 5;
    const rakeCapValue = rakeCap !== undefined ? rakeCap : 10;

    const [newTable] = await db
      .insert(clubTables)
      .values({
        name,
        clubId: null,
        type: type || 'cash',
        stakes: typeof stakes === 'string' ? stakes : JSON.stringify(stakes),
        maxPlayers,
        rakePercentage: rakePercent,
        rakeCap: rakeCapValue,
      })
      .returning();

    console.log(`テーブル作成: ${newTable.name} (ユーザー: ${authResult.user.username})`);

    return NextResponse.json({
      message: 'テーブルを作成しました',
      table: newTable,
    });
  } catch (error) {
    console.error('テーブル作成エラー:', error);
    return NextResponse.json({ message: 'テーブルの作成に失敗しました' }, { status: 500 });
  }
}
