import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users, playerStats } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { error: '認証が必要です' },
      { status: 401 }
    );
  }

  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const [stats] = await db.select()
      .from(playerStats)
      .where(eq(playerStats.userId, userId))
      .limit(1);

    const isSelf = authUser.userId === userId;

    const response: any = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      level: user.level,
      achievements: user.achievements,
      totalGamesPlayed: stats?.totalGames || 0,
      totalWins: stats?.gamesWon || 0,
      totalEarnings: stats?.totalChipsWon || 0,
    };

    if (isSelf) {
      response.email = user.email;
      response.chips = user.chips;
      response.realChips = user.realChips;
      response.gameChips = user.gameChips;
      response.energy = user.energy;
      response.experience = user.experience;
      response.clubs = user.clubs;
      response.friends = user.friends;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { error: '認証が必要です' },
      { status: 401 }
    );
  }

  const userId = params.id;

  if (authUser.userId !== userId) {
    return NextResponse.json(
      { error: 'アクセス権限がありません' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { avatar, username } = body;

    const updateData: any = {};
    if (avatar !== undefined) updateData.avatar = avatar;
    if (username !== undefined) updateData.username = username;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      avatar: updatedUser.avatar,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
