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
  gameChips: integer('game_chips').notNull().default(10000),
  realChips: integer('real_chips').notNull().default(0),
  energy: integer('energy').notNull().default(100),
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
  ownerUsername: varchar('owner_username', { length: 100 }).notNull().default(''),
  description: text('description').default(''),
  avatar: text('avatar'),
  members: jsonb('members').$type<Array<{
    userId: string;
    username: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    gamesPlayed: number;
    rakePaid: number;
    earnings: number;
    status: 'active' | 'suspended';
    lastActiveAt: Date;
  }>>().default([]),
  maxMembers: integer('max_members').notNull().default(100),
  memberCount: integer('member_count').notNull().default(1),
  rakePercentage: integer('rake_percentage').notNull().default(20),
  totalRevenue: integer('total_revenue').notNull().default(0),
  totalGames: integer('total_games').notNull().default(0),
  totalHands: integer('total_hands').notNull().default(0),
  totalRakeCollected: integer('total_rake_collected').notNull().default(0),
  dailyRevenue: integer('daily_revenue').notNull().default(0),
  weeklyRevenue: integer('weekly_revenue').notNull().default(0),
  monthlyRevenue: integer('monthly_revenue').notNull().default(0),
  activeTables: integer('active_tables').notNull().default(0),
  totalTables: integer('total_tables').notNull().default(0),
  isPrivate: boolean('is_private').notNull().default(false),
  requiresApproval: boolean('requires_approval').notNull().default(false),
  minLevel: integer('min_level').notNull().default(1),
  clubCode: varchar('club_code', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('active').$type<'active' | 'suspended' | 'closed'>(),
  tier: varchar('tier', { length: 20 }).notNull().default('bronze').$type<'bronze' | 'silver' | 'gold' | 'platinum'>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    clubCodeIdx: uniqueIndex('club_code_idx').on(table.clubCode),
    ownerIdx: index('owner_idx').on(table.ownerId),
  };
});

export type Club = typeof clubs.$inferSelect;
export type InsertClub = typeof clubs.$inferInsert;

// ========================================
// CLUB TABLES TABLE
// ========================================
export const clubTables = pgTable('club_tables', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  clubId: varchar('club_id', { length: 100 }),
  name: varchar('name', { length: 200 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().$type<'cash' | 'tournament'>(),
  stakes: varchar('stakes', { length: 50 }).notNull(),
  rakePercentage: integer('rake_percentage').notNull().default(5),
  rakeCap: integer('rake_cap').notNull().default(10),
  totalHands: integer('total_hands').notNull().default(0),
  totalRakeCollected: integer('total_rake_collected').notNull().default(0),
  clubRevenue: integer('club_revenue').notNull().default(0),
  ownerRevenue: integer('owner_revenue').notNull().default(0),
  currentPlayers: integer('current_players').notNull().default(0),
  maxPlayers: integer('max_players').notNull().default(9),
  status: varchar('status', { length: 20 }).notNull().default('active').$type<'active' | 'paused' | 'closed'>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastHandAt: timestamp('last_hand_at').notNull().defaultNow(),
}, (table) => {
  return {
    clubIdIdx: index('club_tables_club_id_idx').on(table.clubId),
  };
});

export type ClubTable = typeof clubTables.$inferSelect;
export type InsertClubTable = typeof clubTables.$inferInsert;

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
// GAME HISTORY TABLE
// ========================================
export const gameHistory = pgTable('game_history', {
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
    userIdIdx: index('game_history_user_id_idx').on(table.userId),
    createdAtIdx: index('game_history_created_at_idx').on(table.createdAt),
  };
});

export type GameHistory = typeof gameHistory.$inferSelect;
export type InsertGameHistory = typeof gameHistory.$inferInsert;

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
// FORUM POSTS TABLE
// ========================================
export const forumPosts = pgTable('forum_posts', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }).notNull().$type<'strategy' | 'tournament' | 'community' | 'news'>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  type: varchar('type', { length: 10 }).notNull().$type<'text' | 'video'>(),
  videoUrl: text('video_url'),
  videoThumbnail: text('video_thumbnail'),
  views: integer('views').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  isPinned: boolean('is_pinned').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('forum_posts_user_id_idx').on(table.userId),
    categoryIdx: index('forum_posts_category_idx').on(table.category),
    createdAtIdx: index('forum_posts_created_at_idx').on(table.createdAt),
  };
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

// ========================================
// KYC VERIFICATION TABLE
// ========================================
export const kycVerifications = pgTable('kyc_verifications', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('pending').$type<'pending' | 'approved' | 'rejected'>(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  dateOfBirth: varchar('date_of_birth', { length: 20 }),
  nationality: varchar('nationality', { length: 100 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  phoneNumber: varchar('phone_number', { length: 30 }),
  idDocumentType: varchar('id_document_type', { length: 50 }).$type<'passport' | 'drivers_license' | 'national_id'>(),
  idDocumentNumber: varchar('id_document_number', { length: 100 }),
  idDocumentUrl: text('id_document_url'),
  selfieUrl: text('selfie_url'),
  addressDocumentUrl: text('address_document_url'),
  rejectionReason: text('rejection_reason'),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: varchar('reviewed_by', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('kyc_user_id_idx').on(table.userId),
  };
});

export type KYCVerification = typeof kycVerifications.$inferSelect;
export type InsertKYCVerification = typeof kycVerifications.$inferInsert;

// ========================================
// WITHDRAWAL REQUESTS TABLE
// ========================================
export const withdrawalRequests = pgTable('withdrawal_requests', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  amount: integer('amount').notNull(),
  method: varchar('method', { length: 20 }).notNull().$type<'bank_transfer' | 'crypto'>(),
  bankAccount: jsonb('bank_account').$type<{
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountName: string;
  }>(),
  cryptoInfo: jsonb('crypto_info').$type<{
    currency: string;
    walletAddress: string;
    network?: string;
  }>(),
  status: varchar('status', { length: 20 }).notNull().default('pending').$type<'pending' | 'approved' | 'rejected' | 'processing' | 'completed'>(),
  reason: text('reason'),
  adminNotes: text('admin_notes'),
  processedBy: varchar('processed_by', { length: 100 }),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('withdrawal_user_id_idx').on(table.userId),
    statusIdx: index('withdrawal_status_idx').on(table.status),
    submittedAtIdx: index('withdrawal_submitted_at_idx').on(table.submittedAt),
  };
});

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

// ========================================
// PAYMENT TRANSACTIONS TABLE (Stripe)
// ========================================
export const paymentTransactions = pgTable('payment_transactions', {
  id: varchar('id', { length: 100 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 100 }).notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull().$type<'deposit' | 'purchase'>(),
  amount: integer('amount').notNull(),
  stripeAmount: integer('stripe_amount'),
  currency: varchar('currency', { length: 10 }).notNull().default('JPY'),
  stripeSessionId: varchar('stripe_session_id', { length: 200 }).unique(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 200 }),
  status: varchar('status', { length: 20 }).notNull().default('pending').$type<'pending' | 'completed' | 'failed' | 'refunded'>(),
  method: varchar('method', { length: 50 }).default('credit_card'),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => {
  return {
    userIdIdx: index('payment_transactions_user_id_idx').on(table.userId),
    statusIdx: index('payment_transactions_status_idx').on(table.status),
    stripeSessionIdx: uniqueIndex('payment_transactions_stripe_session_unique_idx').on(table.stripeSessionId),
  };
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

// ========================================
// SYSTEM SETTINGS TABLE
// ========================================
export const systemSettings = pgTable('system_settings', {
  id: varchar('id', { length: 100 }).primaryKey(),
  category: varchar('category', { length: 50 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: varchar('description', { length: 500 }),
  value: jsonb('value').notNull(),
  type: varchar('type', { length: 20 }).notNull().$type<'boolean' | 'number' | 'string' | 'select'>(),
  options: jsonb('options').$type<Array<{ value: any; label: string }>>(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: varchar('updated_by', { length: 100 }),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// ========================================
// RELATIONS
// ========================================
export const usersRelations = relations(users, ({ many }) => ({
  playerStats: many(playerStats),
  pets: many(pets),
  handHistory: many(handHistory),
  forumPosts: many(forumPosts),
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

export const forumPostsRelations = relations(forumPosts, ({ one }) => ({
  user: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
}));

export const clubsRelations = relations(clubs, ({ many }) => ({
  clubTables: many(clubTables),
}));

export const clubTablesRelations = relations(clubTables, ({ one }) => ({
  club: one(clubs, {
    fields: [clubTables.clubId],
    references: [clubs.id],
  }),
}));
