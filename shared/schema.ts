// Reference: blueprint:javascript_database integration
// Drizzle ORM schema for PostgreSQL database

import { pgTable, serial, text, integer, boolean, timestamp, jsonb, varchar, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========================================
// USERS TABLE
// ========================================
export const users = pgTable('users', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  chips: integer('chips').notNull().default(0),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  clubs: jsonb('clubs').$type<string[]>().default([]),
  friends: jsonb('friends').$type<string[]>().default([]),
  achievements: jsonb('achievements').$type<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date;
  }>>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login').notNull().defaultNow(),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
    usernameIdx: uniqueIndex('username_idx').on(table.username),
  };
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ========================================
// CLUBS TABLE
// ========================================
export const clubs = pgTable('clubs', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 200 }).notNull(),
  ownerId: varchar('owner_id', { length: 100 }).notNull(),
  description: text('description').default(''),
  avatar: text('avatar'),
  members: jsonb('members').$type<Array<{
    userId: string;
    username: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    chips: number;
  }>>().default([]),
  games: jsonb('games').$type<string[]>().default([]),
  isPrivate: boolean('is_private').notNull().default(false),
  clubCode: varchar('club_code', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    clubCodeIdx: uniqueIndex('club_code_idx').on(table.clubCode),
    ownerIdx: index('owner_idx').on(table.ownerId),
  };
});

export type Club = typeof clubs.$inferSelect;
export type InsertClub = typeof clubs.$inferInsert;

// ========================================
// GAMES TABLE
// ========================================
export const games = pgTable('games', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  gameId: varchar('game_id', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull().$type<'texas-holdem' | 'omaha' | 'ofc'>(),
  phase: varchar('phase', { length: 20 }).notNull().default('waiting').$type<'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended'>(),
  players: jsonb('players').$type<Array<{
    id: string;
    userId: string;
    username: string;
    chips: number;
    bet: number;
    cards: Array<{ suit: string; rank: string; id: string }>;
    folded: boolean;
    isAllIn: boolean;
    position: number;
    isDealer: boolean;
    hasActed: boolean;
  }>>().default([]),
  communityCards: jsonb('community_cards').$type<Array<{ suit: string; rank: string; id: string }>>().default([]),
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
}, (table) => {
  return {
    gameIdIdx: uniqueIndex('game_id_idx').on(table.gameId),
    phaseIdx: index('phase_idx').on(table.phase),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  };
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

// ========================================
// PLAYER STATS TABLE
// ========================================
export const playerStats = pgTable('player_stats', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull().unique(),
  totalGames: integer('total_games').notNull().default(0),
  gamesWon: integer('games_won').notNull().default(0),
  totalChipsWon: integer('total_chips_won').notNull().default(0),
  totalChipsLost: integer('total_chips_lost').notNull().default(0),
  biggestPot: integer('biggest_pot').notNull().default(0),
  bestHand: varchar('best_hand', { length: 100 }).default(''),
  winRate: integer('win_rate').notNull().default(0),
  vpip: integer('vpip').notNull().default(0),
  pfr: integer('pfr').notNull().default(0),
  aggression: integer('aggression').notNull().default(0),
  handsPlayed: integer('hands_played').notNull().default(0),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: uniqueIndex('player_stats_user_id_idx').on(table.userId),
  };
});

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = typeof playerStats.$inferInsert;

// ========================================
// PETS TABLE
// ========================================
export const pets = pgTable('pets', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().$type<'dragon' | 'phoenix' | 'tiger' | 'turtle'>(),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  hunger: integer('hunger').notNull().default(100),
  happiness: integer('happiness').notNull().default(100),
  abilities: jsonb('abilities').$type<Array<{
    name: string;
    description: string;
    effect: 'chip-bonus' | 'exp-bonus' | 'luck-bonus';
    value: number;
  }>>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('pet_user_id_idx').on(table.userId),
  };
});

export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

// ========================================
// TOURNAMENTS TABLE
// ========================================
export const tournaments = pgTable('tournaments', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull().$type<'sit-n-go' | 'scheduled' | 'bounty'>(),
  buyIn: integer('buy_in').notNull(),
  prizePool: integer('prize_pool').notNull().default(0),
  maxPlayers: integer('max_players').notNull(),
  currentPlayers: integer('current_players').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('registering').$type<'registering' | 'in-progress' | 'completed' | 'cancelled'>(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  players: jsonb('players').$type<Array<{
    userId: string;
    username: string;
    chips: number;
    position?: number;
    prize?: number;
  }>>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    statusIdx: index('tournament_status_idx').on(table.status),
    startTimeIdx: index('tournament_start_time_idx').on(table.startTime),
  };
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;

// ========================================
// HAND HISTORY TABLE
// ========================================
export const handHistory = pgTable('hand_history', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull(),
  gameId: varchar('game_id', { length: 100 }).notNull(),
  gameType: varchar('game_type', { length: 50 }).notNull(),
  blinds: varchar('blinds', { length: 50 }).notNull(),
  chipsChange: integer('chips_change').notNull(),
  result: varchar('result', { length: 20 }).notNull().$type<'win' | 'loss' | 'tie'>(),
  hand: text('hand'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('hand_history_user_id_idx').on(table.userId),
    gameIdIdx: index('hand_history_game_id_idx').on(table.gameId),
    createdAtIdx: index('hand_history_created_at_idx').on(table.createdAt),
  };
});

export type HandHistory = typeof handHistory.$inferSelect;
export type InsertHandHistory = typeof handHistory.$inferInsert;

// ========================================
// RELATIONS
// ========================================
export const usersRelations = relations(users, ({ many }) => ({
  playerStats: many(playerStats),
  pets: many(pets),
  handHistory: many(handHistory),
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  user: one(users, {
    fields: [playerStats.userId],
    references: [users.id],
  }),
}));

export const petsRelations = relations(pets, ({ one }) => ({
  user: one(users, {
    fields: [pets.userId],
    references: [users.id],
  }),
}));

export const handHistoryRelations = relations(handHistory, ({ one }) => ({
  user: one(users, {
    fields: [handHistory.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [handHistory.gameId],
    references: [games.gameId],
  }),
}));
