import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/server/db-api';
import { users, playerStats } from '@/shared/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { z } from 'zod';

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
        status: users.status,
        role: users.role,
        suspendedUntil: users.suspendedUntil,
        banReason: users.banReason,
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

const userActionSchema = z.object({
  userId: z.string(),
  action: z.enum(['ban', 'unban', 'suspend', 'activate']),
  reason: z.string().optional(),
  suspendDays: z.number().optional(),
});

export async function PATCH(request: NextRequest) {
  const authResult = requireAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const validation = userActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: '無効なリクエストです', details: validation.error },
        { status: 400 }
      );
    }

    const { userId, action, reason, suspendDays } = validation.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'ban':
        updateData = {
          status: 'banned',
          banReason: reason || '管理者によるBANです',
        };
        break;
      case 'unban':
        updateData = {
          status: 'active',
          banReason: null,
          suspendedUntil: null,
        };
        break;
      case 'suspend':
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + (suspendDays || 7));
        updateData = {
          status: 'suspended',
          suspendedUntil: suspendUntil,
          banReason: reason || '管理者によるサスペンドです',
        };
        break;
      case 'activate':
        updateData = {
          status: 'active',
          banReason: null,
          suspendedUntil: null,
        };
        break;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    console.log(`ユーザー ${existingUser[0].username} を ${action} しました by ${authResult.admin.username}`);

    return NextResponse.json({
      message: `ユーザーを ${action} しました`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('ユーザーアクション実行エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーアクションの実行に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = requireAdmin(request);
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    if (existingUser[0].role === 'admin' || existingUser[0].role === 'super-admin') {
      return NextResponse.json(
        { error: '管理者アカウントは削除できません' },
        { status: 403 }
      );
    }

    await db.delete(users).where(eq(users.id, userId));

    console.log(`ユーザー ${existingUser[0].username} を削除しました by ${authResult.admin.username}`);

    return NextResponse.json({
      message: 'ユーザーを削除しました',
    });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
}
