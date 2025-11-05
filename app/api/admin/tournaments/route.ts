import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tournaments, users } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { calculateTournamentFee } from '@/lib/rake-system';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const allTournaments = status
      ? await db.select().from(tournaments).where(eq(tournaments.status, status as any)).orderBy(desc(tournaments.createdAt))
      : await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));

    // 統計情報を計算
    const stats = {
      total: allTournaments.length,
      registering: allTournaments.filter(t => t.status === 'registering').length,
      inProgress: allTournaments.filter(t => t.status === 'in-progress').length,
      completed: allTournaments.filter(t => t.status === 'completed').length,
      cancelled: allTournaments.filter(t => t.status === 'cancelled').length,
      totalPlayers: allTournaments.reduce((sum, t) => sum + (t.currentPlayers || 0), 0),
      totalPrizePool: allTournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0),
    };

    return NextResponse.json({
      tournaments: allTournaments,
      stats,
    });
  } catch (error) {
    console.error('トーナメント一覧取得エラー:', error);
    return NextResponse.json({ message: 'トーナメント一覧の取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { name, description, type, buyIn, maxPlayers, startTime } = body;

    if (!name || !type || !buyIn || !maxPlayers) {
      return NextResponse.json({ message: '必須項目が不足しています' }, { status: 400 });
    }

    if (maxPlayers < 2 || maxPlayers > 1000) {
      return NextResponse.json({ message: 'プレイヤー数は2～1000人の範囲で設定してください' }, { status: 400 });
    }

    if (buyIn < 10) {
      return NextResponse.json({ message: 'バイインは10チップ以上に設定してください' }, { status: 400 });
    }

    const feeCalc = calculateTournamentFee(buyIn, maxPlayers);

    const [newTournament] = await db.insert(tournaments).values({
      name,
      description: description || '',
      type,
      buyIn,
      prizePool: 0,
      maxPlayers,
      currentPlayers: 0,
      status: 'registering',
      startTime: startTime ? new Date(startTime) : null,
      players: [],
    }).returning();

    console.log(`トーナメント作成: ${newTournament.name} by ${authResult.admin.username}`);

    return NextResponse.json({
      message: 'トーナメントを作成しました',
      tournament: newTournament,
      feeInfo: feeCalc
    }, { status: 201 });
  } catch (error) {
    console.error('トーナメント作成エラー:', error);
    return NextResponse.json({ message: 'トーナメントの作成に失敗しました' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { tournamentId, action } = body;

    if (!tournamentId || !action) {
      return NextResponse.json({ message: 'トーナメントIDとアクションが必要です' }, { status: 400 });
    }

    const tournamentResult = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1);

    if (tournamentResult.length === 0) {
      return NextResponse.json({ message: 'トーナメントが見つかりません' }, { status: 404 });
    }

    const tournament = tournamentResult[0];
    let newStatus: 'registering' | 'in-progress' | 'completed' | 'cancelled' | undefined;
    let updateData: any = {};

    switch (action) {
      case 'start':
        if (tournament.status !== 'registering') {
          return NextResponse.json({ message: '登録受付中のトーナメントのみ開始できます' }, { status: 400 });
        }
        if (tournament.currentPlayers < 2) {
          return NextResponse.json({ message: '参加者が2名以上必要です' }, { status: 400 });
        }
        newStatus = 'in-progress';
        updateData.startTime = new Date();
        break;

      case 'cancel':
        if (tournament.status === 'completed' || tournament.status === 'cancelled') {
          return NextResponse.json({ message: '完了またはキャンセル済みのトーナメントは変更できません' }, { status: 400 });
        }
        newStatus = 'cancelled';
        break;

      case 'complete':
        if (tournament.status !== 'in-progress') {
          return NextResponse.json({ message: '進行中のトーナメントのみ完了できます' }, { status: 400 });
        }
        newStatus = 'completed';
        updateData.endTime = new Date();
        break;

      default:
        return NextResponse.json({ message: '無効なアクションです' }, { status: 400 });
    }

    const [updatedTournament] = await db
      .update(tournaments)
      .set({
        status: newStatus,
        ...updateData,
      })
      .where(eq(tournaments.id, tournamentId))
      .returning();

    console.log(`トーナメント更新: ${tournament.name} -> ${newStatus} by ${authResult.admin.username}`);

    return NextResponse.json({
      message: `トーナメントを${action === 'start' ? '開始' : action === 'cancel' ? 'キャンセル' : '完了'}しました`,
      tournament: updatedTournament,
    });
  } catch (error) {
    console.error('トーナメント更新エラー:', error);
    return NextResponse.json({ message: 'トーナメントの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('id');

    if (!tournamentId) {
      return NextResponse.json({ message: 'トーナメントIDが必要です' }, { status: 400 });
    }

    const tournamentResult = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId))
      .limit(1);

    if (tournamentResult.length === 0) {
      return NextResponse.json({ message: 'トーナメントが見つかりません' }, { status: 404 });
    }

    const tournament = tournamentResult[0];

    // 進行中のトーナメントは削除不可
    if (tournament.status === 'in-progress') {
      return NextResponse.json({ message: '進行中のトーナメントは削除できません' }, { status: 400 });
    }

    await db
      .delete(tournaments)
      .where(eq(tournaments.id, tournamentId));

    console.log(`トーナメント削除: ${tournament.name} by ${authResult.admin.username}`);

    return NextResponse.json({
      message: 'トーナメントを削除しました',
      tournament,
    });
  } catch (error) {
    console.error('トーナメント削除エラー:', error);
    return NextResponse.json({ message: 'トーナメントの削除に失敗しました' }, { status: 500 });
  }
}
