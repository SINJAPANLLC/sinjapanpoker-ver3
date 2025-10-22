import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();
    const { chips } = body;

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (typeof chips !== 'number') {
      return NextResponse.json(
        { error: 'Invalid chips value' },
        { status: 400 }
      );
    }

    const [updatedUser] = await db.update(users)
      .set({ chips })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updatedUser.id.toString(),
      username: updatedUser.username,
      chips: updatedUser.chips,
    });
  } catch (error) {
    console.error('Error updating chips:', error);
    return NextResponse.json(
      { error: 'Failed to update chips' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
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
      id: user.id.toString(),
      username: user.username,
      chips: user.chips,
    });
  } catch (error) {
    console.error('Error fetching user chips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user chips' },
      { status: 500 }
    );
  }
}
