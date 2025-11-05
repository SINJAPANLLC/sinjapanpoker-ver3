import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { clubTables, clubs } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    // 全テーブルをクラブ情報と共に取得
    const allTables = await db
      .select({
        id: clubTables.id,
        name: clubTables.name,
        clubId: clubTables.clubId,
        clubName: clubs.name,
        type: clubTables.type,
        stakes: clubTables.stakes,
        maxPlayers: clubTables.maxPlayers,
        currentPlayers: clubTables.currentPlayers,
        status: clubTables.status,
        totalHands: clubTables.totalHands,
        totalRakeCollected: clubTables.totalRakeCollected,
        clubRevenue: clubTables.clubRevenue,
        ownerRevenue: clubTables.ownerRevenue,
        createdAt: clubTables.createdAt,
        lastHandAt: clubTables.lastHandAt,
      })
      .from(clubTables)
      .leftJoin(clubs, eq(clubTables.clubId, clubs.id))
      .orderBy(desc(clubTables.createdAt));

    // 統計情報を計算
    const stats = {
      totalTables: allTables.length,
      activeTables: allTables.filter((t) => t.status === 'active').length,
      totalPlayers: allTables.reduce((sum: number, t) => sum + (t.currentPlayers || 0), 0),
      totalRevenue: allTables.reduce((sum: number, t) => sum + (t.clubRevenue || 0), 0),
    };

    return NextResponse.json({
      tables: allTables,
      stats,
    });
  } catch (error) {
    console.error('テーブル取得エラー:', error);
    return NextResponse.json({ message: 'テーブル情報の取得に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('id');

    if (!tableId) {
      return NextResponse.json({ message: 'テーブルIDが必要です' }, { status: 400 });
    }

    // テーブルを削除
    const [deletedTable] = await db
      .delete(clubTables)
      .where(eq(clubTables.id, tableId))
      .returning();

    if (!deletedTable) {
      return NextResponse.json({ message: 'テーブルが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'テーブルを削除しました',
      table: deletedTable,
    });
  } catch (error) {
    console.error('テーブル削除エラー:', error);
    return NextResponse.json({ message: 'テーブルの削除に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { tableId, status } = body;

    if (!tableId || !status) {
      return NextResponse.json({ message: 'テーブルIDとステータスが必要です' }, { status: 400 });
    }

    // 有効なステータス値を確認
    const validStatuses = ['active', 'paused', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: '無効なステータスです' }, { status: 400 });
    }

    // テーブルのステータスを更新
    const [updatedTable] = await db
      .update(clubTables)
      .set({
        status: status as 'active' | 'paused' | 'closed',
      })
      .where(eq(clubTables.id, tableId))
      .returning();

    if (!updatedTable) {
      return NextResponse.json({ message: 'テーブルが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'テーブルを更新しました',
      table: updatedTable,
    });
  } catch (error) {
    console.error('テーブル更新エラー:', error);
    return NextResponse.json({ message: 'テーブルの更新に失敗しました' }, { status: 500 });
  }
}
