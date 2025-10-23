import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      chips: user.chips,
      level: user.level,
      experience: user.experience,
      avatar: user.avatar,
      clubs: user.clubs,
      friends: user.friends,
      achievements: user.achievements,
    });
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
  try {
    const userId = params.id;
    const body = await request.json();
    const { avatar } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (avatar === undefined) {
      return NextResponse.json(
        { error: 'Avatar value is required' },
        { status: 400 }
      );
    }

    const [updatedUser] = await db.update(users)
      .set({ avatar })
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
      message: 'Avatar updated successfully',
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}
