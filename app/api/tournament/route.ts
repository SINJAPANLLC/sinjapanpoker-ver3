import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { tournaments, users } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { calculateTournamentFee } from '@/lib/rake-system';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const allTournaments = status
      ? await db.select().from(tournaments).where(eq(tournaments.status, status as any)).orderBy(desc(tournaments.createdAt))
      : await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));

    return NextResponse.json(allTournaments);
  } catch (error) {
    console.error('トーナメント一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'トーナメント一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, type, buyIn, maxPlayers, startTime } = body;

    if (!name || !type || !buyIn || !maxPlayers) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    const feeCalc = calculateTournamentFee(buyIn, maxPlayers);

    const newTournament = await db.insert(tournaments).values({
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

    return NextResponse.json({
      tournament: newTournament[0],
      feeInfo: feeCalc
    }, { status: 201 });
  } catch (error) {
    console.error('トーナメント作成エラー:', error);
    return NextResponse.json(
      { error: 'トーナメントの作成に失敗しました' },
      { status: 500 }
    );
  }
}
