import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/server/db';
import { tournaments, users } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';
import { calculateTournamentFee } from '@/lib/rake-system';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, params.id))
      .limit(1);

    if (tournament.length === 0) {
      return NextResponse.json(
        { error: 'トーナメントが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament[0]);
  } catch (error) {
    console.error('トーナメント取得エラー:', error);
    return NextResponse.json(
      { error: 'トーナメントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, userId, username } = body;

    const tournament = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, params.id))
      .limit(1);

    if (tournament.length === 0) {
      return NextResponse.json(
        { error: 'トーナメントが見つかりません' },
        { status: 404 }
      );
    }

    const currentTournament = tournament[0];

    if (action === 'register') {
      const authResult = await verifyAuth(request);
      if (!authResult.valid || !authResult.userId) {
        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
      }

      if (userId && userId !== authResult.userId) {
        return NextResponse.json(
          { error: '他のユーザーを登録することはできません' },
          { status: 403 }
        );
      }

      const actualUserId = authResult.userId;
      if (currentTournament.status !== 'registering') {
        return NextResponse.json(
          { error: '登録受付が終了しています' },
          { status: 400 }
        );
      }

      if (currentTournament.currentPlayers >= currentTournament.maxPlayers) {
        return NextResponse.json(
          { error: '定員に達しています' },
          { status: 400 }
        );
      }

      const players = currentTournament.players || [];
      if (players.some(p => p.userId === actualUserId)) {
        return NextResponse.json(
          { error: 'すでに登録済みです' },
          { status: 400 }
        );
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, actualUserId))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }

      const feeCalc = calculateTournamentFee(currentTournament.buyIn);
      const totalCost = feeCalc.totalCost;

      // realChipsから参加費を引く
      if (user[0].realChips < totalCost) {
        return NextResponse.json(
          { error: 'リアルチップが不足しています' },
          { status: 400 }
        );
      }

      await db
        .update(users)
        .set({ realChips: user[0].realChips - totalCost })
        .where(eq(users.id, actualUserId));

      const newPlayers = [
        ...players,
        {
          userId: actualUserId,
          username: username || user[0].username,
          chips: currentTournament.buyIn,
        }
      ];

      const updatedTournament = await db
        .update(tournaments)
        .set({
          players: newPlayers,
          currentPlayers: newPlayers.length,
          prizePool: currentTournament.prizePool + currentTournament.buyIn,
        })
        .where(eq(tournaments.id, params.id))
        .returning();

      return NextResponse.json({
        tournament: updatedTournament[0],
        message: 'トーナメントに登録しました'
      });
    }

    if (action === 'start') {
      const authResult = requireAdmin(request);
      if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
      }

      if (currentTournament.status !== 'registering') {
        return NextResponse.json(
          { error: 'トーナメントはすでに開始しています' },
          { status: 400 }
        );
      }

      if (currentTournament.currentPlayers < 2) {
        return NextResponse.json(
          { error: 'プレイヤーが不足しています（最低2人）' },
          { status: 400 }
        );
      }

      const updatedTournament = await db
        .update(tournaments)
        .set({
          status: 'in-progress',
          startTime: new Date(),
        })
        .where(eq(tournaments.id, params.id))
        .returning();

      return NextResponse.json({
        tournament: updatedTournament[0],
        message: 'トーナメントを開始しました'
      });
    }

    if (action === 'complete') {
      const authResult = requireAdmin(request);
      if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
      }

      if (currentTournament.status !== 'in-progress') {
        return NextResponse.json(
          { error: 'トーナメントは進行中ではありません' },
          { status: 400 }
        );
      }

      const { completeTournament } = await import('@/lib/tournament-system');
      
      const result = completeTournament(
        currentTournament.players || [],
        currentTournament.prizePool,
        currentTournament.prizeStructure || undefined
      );

      // 賞金をプレイヤーに分配（realChipsに追加）
      for (const prize of result.prizes) {
        await db
          .update(users)
          .set({
            realChips: sql`real_chips + ${prize.prize}`
          })
          .where(eq(users.id, prize.userId));
      }

      // トーナメントを完了状態に更新
      const updatedPlayers = result.finalRankings.map(rank => {
        const prize = result.prizes.find(p => p.userId === rank.userId);
        return {
          userId: rank.userId,
          username: rank.username,
          chips: rank.chips,
          position: rank.position,
          prize: prize?.prize || 0,
        };
      });

      const updatedTournament = await db
        .update(tournaments)
        .set({
          status: 'completed',
          endTime: new Date(),
          players: updatedPlayers,
        })
        .where(eq(tournaments.id, params.id))
        .returning();

      return NextResponse.json({
        tournament: updatedTournament[0],
        result,
        message: 'トーナメントが完了しました'
      });
    }

    if (action === 'cancel') {
      const authResult = requireAdmin(request);
      if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
      }

      if (currentTournament.status === 'completed') {
        return NextResponse.json(
          { error: '完了したトーナメントはキャンセルできません' },
          { status: 400 }
        );
      }

      // プレイヤーに参加費を返金
      for (const player of currentTournament.players || []) {
        const feeCalc = calculateTournamentFee(currentTournament.buyIn);
        await db
          .update(users)
          .set({
            realChips: sql`real_chips + ${feeCalc.totalCost}`
          })
          .where(eq(users.id, player.userId));
      }

      const updatedTournament = await db
        .update(tournaments)
        .set({
          status: 'cancelled',
        })
        .where(eq(tournaments.id, params.id))
        .returning();

      return NextResponse.json({
        tournament: updatedTournament[0],
        message: 'トーナメントをキャンセルしました'
      });
    }

    return NextResponse.json(
      { error: '無効なアクションです' },
      { status: 400 }
    );
  } catch (error) {
    console.error('トーナメント操作エラー:', error);
    return NextResponse.json(
      { error: 'トーナメント操作に失敗しました' },
      { status: 500 }
    );
  }
}
