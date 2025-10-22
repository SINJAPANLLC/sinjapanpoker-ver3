import { NextRequest, NextResponse } from 'next/server';
import { createDeck, shuffleDeck } from '@/lib/poker-engine';
import type { Game, Player } from '@/types';
import gameStore from '@/lib/game-store';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.warn('Failed to parse request body, using defaults:', parseError);
    }
    
    const { userId, playerCount = 9, chips = 1000, gameType = 'texas-holdem' } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let user = gameStore.getUser(userId);
    if (!user) {
      user = {
        id: userId,
        username: `Player${userId.substring(0, 4)}`,
        chips: 1000,
      };
      gameStore.setUser(userId, user);
    }

    const gameId = generateId();
    const deck = shuffleDeck(createDeck());

    const players: Player[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      const isHero = i === 0;
      const playerId = isHero ? userId : `bot-${generateId()}`;
      const playerUsername = isHero ? user.username : `Player${i + 1}`;
      
      const player: Player = {
        id: generateId(),
        userId: playerId,
        username: playerUsername,
        avatar: undefined,
        chips,
        bet: 0,
        cards: [deck[i * 2], deck[i * 2 + 1]],
        folded: false,
        isAllIn: false,
        position: i,
        isDealer: i === 0,
        hasActed: false,
      };
      
      players.push(player);
    }

    const smallBlind = 10;
    const bigBlind = 20;

    if (players.length >= 2) {
      players[0].bet = smallBlind;
      players[0].chips -= smallBlind;
      players[1].bet = bigBlind;
      players[1].chips -= bigBlind;
    }

    const usedCardCount = playerCount * 2;
    const remainingDeck = deck.slice(usedCardCount);

    const game: Game = {
      id: gameId,
      type: gameType,
      phase: 'preflop',
      players,
      communityCards: [],
      pot: smallBlind + bigBlind,
      currentBet: bigBlind,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      smallBlind,
      bigBlind,
      minBuyIn: 100,
      maxBuyIn: 10000,
      createdAt: new Date(),
      updatedAt: new Date(),
      deck: remainingDeck,
    };

    gameStore.setGame(gameId, game);
    
    console.log('[API] Game created:', gameId, 'Players:', players.length, 'Store size:', gameStore.listAllGameIds().length);

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
