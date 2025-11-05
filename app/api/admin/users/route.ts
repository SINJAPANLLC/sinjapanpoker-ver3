import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/server/db-api';
import { users, playerStats } from '@/shared/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
  // 管理者認証チェック
  const authResult = requireAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        chips: users.chips,
        realChips: users.realChips,
        gameChips: users.gameChips,
        energy: users.energy,
        level: users.level,
        experience: users.experience,
        achievements: users.achievements,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        const stats = await db
          .select()
          .from(playerStats)
          .where(eq(playerStats.userId, user.id))
          .limit(1);

        const userStat = stats[0] || {
          totalGames: 0,
          gamesWon: 0,
          totalChipsWon: 0,
          totalChipsLost: 0,
        };

        return {
          ...user,
          gamesPlayed: userStat.totalGames,
          gamesWon: userStat.gamesWon,
          totalWinnings: userStat.totalChipsWon - userStat.totalChipsLost,
          winRate: userStat.totalGames > 0 
            ? ((userStat.gamesWon / userStat.totalGames) * 100).toFixed(1)
            : '0.0',
        };
      })
    );

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
