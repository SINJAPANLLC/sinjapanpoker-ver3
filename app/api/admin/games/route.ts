import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db-api';
import { games, users, handHistory } from '@/shared/schema';
import { desc, gte, sql, eq, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Admin認証チェック
  const authResult = requireAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const onlyActive = searchParams.get('active') === 'true';

    let query = db
      .select({
        id: games.id,
        players: games.players,
        communityCards: games.communityCards,
        pot: games.pot,
        currentBet: games.currentBet,
        phase: games.phase,
        dealerIndex: games.dealerIndex,
        smallBlind: games.smallBlind,
        bigBlind: games.bigBlind,
        winner: games.winner,
        createdAt: games.createdAt,
        endedAt: games.endedAt,
      })
      .from(games)
      .orderBy(desc(games.createdAt))
      .limit(limit);

    if (onlyActive) {
      // 終了していないゲーム（過去1時間以内に開始され、winner が null）
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      query = query.where(
        and(
          gte(games.createdAt, oneHourAgo),
          isNull(games.winner)
        )
      ) as typeof query;
    }

    const gamesList = await query;

    // 各ゲームのプレイヤー情報を拡張
    const gamesWithDetails = await Promise.all(
      gamesList.map(async (game) => {
        if (!game.players || !Array.isArray(game.players)) {
          return {
            ...game,
            playersData: [],
            handsPlayed: 0,
            totalRake: 0,
          };
        }

        // プレイヤー情報を取得
        const playerIds = game.players.map((p: any) => p.userId || p.id);
        const playersData = await db
          .select({
            id: users.id,
            username: users.username,
            avatar: users.avatar,
            chips: users.chips,
          })
          .from(users)
          .where(sql`${users.id} = ANY(${sql`ARRAY[${sql.join(playerIds.map((id: string) => sql`${id}`), sql`, `)}]::text[]`})`);

        // このゲームのhand_historyを取得
        const hands = await db
          .select()
          .from(handHistory)
          .where(eq(handHistory.gameId, game.id));

        const handsPlayed = hands.length;
        const totalRake = hands.reduce((sum, hand) => {
          const rakeAmount = (hand as any).rake || 0;
          return sum + rakeAmount;
        }, 0);

        // プレイヤーデータとゲームデータを結合
        const enrichedPlayers = game.players.map((p: any) => {
          const userData = playersData.find((u) => u.id === (p.userId || p.id));
          return {
            ...p,
            username: userData?.username || p.username || 'Unknown',
            avatar: userData?.avatar || p.avatar,
            currentChips: userData?.chips || 0,
          };
        });

        return {
          ...game,
          playersData: enrichedPlayers,
          handsPlayed,
          totalRake,
        };
      })
    );

    return NextResponse.json({
      games: gamesWithDetails,
      total: gamesWithDetails.length,
    });
  } catch (error) {
    console.error('Admin games fetch error:', error);
    return NextResponse.json(
      { error: 'ゲームデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
