// PostgreSQL database operations for game server
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { pgTable, varchar, text, integer, boolean, timestamp, jsonb, index, uniqueIndex } = require('drizzle-orm/pg-core');
const { eq, sql } = require('drizzle-orm');
const ws = require("ws");

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

// Define minimal schema for game server
const users = pgTable('users', {
  id: varchar('id', { length: 100 }).primaryKey(),
  chips: integer('chips').notNull().default(10000),
});

const games = pgTable('games', {
  id: varchar('id', { length: 100 }).primaryKey(),
  gameId: varchar('game_id', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  phase: varchar('phase', { length: 20 }).notNull().default('waiting'),
  players: jsonb('players').default([]),
  communityCards: jsonb('community_cards').default([]),
  pot: integer('pot').notNull().default(0),
  currentBet: integer('current_bet').notNull().default(0),
  currentPlayerIndex: integer('current_player_index').notNull().default(0),
  dealerIndex: integer('dealer_index').notNull().default(0),
  smallBlind: integer('small_blind').notNull(),
  bigBlind: integer('big_blind').notNull(),
  winner: varchar('winner', { length: 100 }),
  winningHand: text('winning_hand'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
});

const handHistory = pgTable('hand_history', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull(),
  gameId: varchar('game_id', { length: 100 }).notNull(),
  gameType: varchar('game_type', { length: 50 }).notNull(),
  blinds: varchar('blinds', { length: 50 }).notNull(),
  chipsChange: integer('chips_change').notNull(),
  result: varchar('result', { length: 20 }).notNull(),
  hand: text('hand'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

const playerStats = pgTable('player_stats', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull().unique(),
  totalGames: integer('total_games').notNull().default(0),
  gamesWon: integer('games_won').notNull().default(0),
  totalChipsWon: integer('total_chips_won').notNull().default(0),
  totalChipsLost: integer('total_chips_lost').notNull().default(0),
  biggestPot: integer('biggest_pot').notNull().default(0),
});

async function saveGameToDatabase(game, winners) {
  try {
    // 1. Save game to games table
    const gameData = {
      id: crypto.randomUUID(),
      gameId: game.id,
      type: game.type,
      phase: 'ended',
      players: game.players,
      communityCards: game.communityCards,
      pot: game.pot,
      currentBet: game.currentBet,
      currentPlayerIndex: game.currentPlayerIndex,
      dealerIndex: game.dealerIndex,
      smallBlind: game.smallBlind,
      bigBlind: game.bigBlind,
      winner: winners.length > 0 ? winners[0].id : null,
      winningHand: winners.length > 0 ? winners[0].handRank : null,
      endedAt: new Date(),
    };

    await db.insert(games).values(gameData);

    // 2. Save hand history for each player
    for (const player of game.players) {
      const isWinner = winners.some(w => w.id === player.id);
      const winAmount = isWinner ? winners.find(w => w.id === player.id).winAmount : 0;
      const chipsChange = winAmount - (game.totalBets.get(player.id) || 0);

      await db.insert(handHistory).values({
        userId: player.userId,
        gameId: game.id,
        gameType: game.type,
        blinds: `${game.smallBlind}/${game.bigBlind}`,
        chipsChange,
        result: isWinner ? 'win' : 'loss',
        hand: player.cards ? JSON.stringify(player.cards) : null,
      });

      // 3. Update player stats
      await updatePlayerStats(player.userId, {
        won: isWinner,
        chipsChange,
        gameType: game.type,
      });

      // 4. Update user chips
      await db
        .update(users)
        .set({ 
          chips: sql`${users.chips} + ${chipsChange}`
        })
        .where(eq(users.id, player.userId));
    }

    console.log(`Game ${game.id} saved to database successfully`);
    return true;
  } catch (error) {
    console.error('Error saving game to database:', error);
    return false;
  }
}

async function updatePlayerStats(userId, gameResult) {
  try {
    // Check if player stats exist
    const existingStats = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.userId, userId))
      .limit(1);

    if (existingStats.length === 0) {
      // Create new stats
      await db.insert(playerStats).values({
        userId,
        totalGames: 1,
        gamesWon: gameResult.won ? 1 : 0,
        totalChipsWon: gameResult.chipsChange > 0 ? gameResult.chipsChange : 0,
        totalChipsLost: gameResult.chipsChange < 0 ? Math.abs(gameResult.chipsChange) : 0,
        biggestPot: gameResult.chipsChange > 0 ? gameResult.chipsChange : 0,
      });
    } else {
      // Update existing stats
      await db
        .update(playerStats)
        .set({
          totalGames: sql`${playerStats.totalGames} + 1`,
          gamesWon: gameResult.won ? sql`${playerStats.gamesWon} + 1` : playerStats.gamesWon,
          totalChipsWon: gameResult.chipsChange > 0 
            ? sql`${playerStats.totalChipsWon} + ${gameResult.chipsChange}`
            : playerStats.totalChipsWon,
          totalChipsLost: gameResult.chipsChange < 0 
            ? sql`${playerStats.totalChipsLost} + ${Math.abs(gameResult.chipsChange)}`
            : playerStats.totalChipsLost,
          biggestPot: gameResult.chipsChange > 0 && gameResult.chipsChange > existingStats[0].biggestPot
            ? gameResult.chipsChange
            : playerStats.biggestPot,
        })
        .where(eq(playerStats.userId, userId));
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}

module.exports = {
  saveGameToDatabase,
  updatePlayerStats,
};
