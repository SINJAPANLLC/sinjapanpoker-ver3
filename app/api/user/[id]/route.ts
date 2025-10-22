import { NextRequest, NextResponse } from 'next/server';
import gameStore from '@/lib/game-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    let user = gameStore.getUser(userId);
    
    if (!user) {
      user = {
        id: userId,
        username: `Player${userId.substring(0, 4)}`,
        chips: 1000,
      };
      gameStore.setUser(userId, user);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
