import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db-api';
import { clubTables } from '@/shared/schema';
import { desc, eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // activeなテーブルのみを取得（認証不要でロビーに表示）
    const allTables = await db
      .select()
      .from(clubTables)
      .where(eq(clubTables.status, 'active'))
      .orderBy(desc(clubTables.createdAt))
      .limit(50);

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
    if (!authResult.valid || !authResult.userId) {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { name, stakes, maxPlayers, type, rakePercentage, rakeCap, settings, buyIn } = body;

    if (!name || !maxPlayers) {
      return NextResponse.json({ message: '必須フィールドが不足しています' }, { status: 400 });
    }

    if (maxPlayers < 2 || maxPlayers > 9) {
      return NextResponse.json({ message: 'プレイヤー数は2～9人です' }, { status: 400 });
    }

    // stakesの処理
    let stakesStr = stakes;
    if (settings?.blinds) {
      stakesStr = `${settings.blinds.small}/${settings.blinds.big}`;
    } else if (!stakesStr) {
      stakesStr = '10/20';
    }

    const rakePercent = rakePercentage !== undefined ? Math.round(rakePercentage * 100) : 5;
    const rakeCapValue = rakeCap !== undefined ? rakeCap : 10;
    const tableType = type === 'sit-and-go' ? 'tournament' : (type || 'cash');

    const [newTable] = await db
      .insert(clubTables)
      .values({
        name,
        clubId: null,
        type: tableType as 'cash' | 'tournament',
        stakes: typeof stakesStr === 'string' ? stakesStr : JSON.stringify(stakesStr),
        maxPlayers,
        rakePercentage: rakePercent,
        rakeCap: rakeCapValue,
        createdBy: authResult.userId,
        status: 'active',
        currentPlayers: 0,
      })
      .returning();

    console.log(`テーブル作成: ${newTable.name} (ユーザー: ${authResult.username || authResult.userId})`);

    return NextResponse.json({
      message: 'テーブルを作成しました',
      table: newTable,
    });
  } catch (error) {
    console.error('テーブル作成エラー:', error);
    return NextResponse.json({ message: 'テーブルの作成に失敗しました' }, { status: 500 });
  }
}
