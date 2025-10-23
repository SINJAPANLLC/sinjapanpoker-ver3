import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tournaments, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { calculateTournamentFee } from '@/lib/rake-system';

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
  request: Request,
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
      if (players.some(p => p.userId === userId)) {
        return NextResponse.json(
          { error: 'すでに登録済みです' },
          { status: 400 }
        );
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }

      const feeCalc = calculateTournamentFee(currentTournament.buyIn);
      const totalCost = feeCalc.totalCost;

      if (user[0].chips < totalCost) {
        return NextResponse.json(
          { error: 'チップが不足しています' },
          { status: 400 }
        );
      }

      await db
        .update(users)
        .set({ chips: user[0].chips - totalCost })
        .where(eq(users.id, userId));

      const newPlayers = [
        ...players,
        {
          userId,
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
