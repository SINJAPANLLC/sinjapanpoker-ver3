// カードの型定義
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

// プレイヤーの型定義
export interface Player {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  chips: number;
  bet: number;
  cards: Card[];
  folded: boolean;
  isAllIn: boolean;
  position: number;
  isDealer: boolean;
  hasActed: boolean;
  pet?: Pet;
  stats?: PlayerStats;
}

// ゲームの型定義
export type GameType = 'texas-holdem' | 'omaha' | 'ofc';
export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
export type Action = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface Game {
  id: string;
  type: GameType;
  phase: GamePhase;
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
  clubId?: string;
  tournamentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// クラブの型定義
export interface Club {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  avatar?: string;
  members: ClubMember[];
  games: string[];
  isPrivate: boolean;
  clubCode: string;
  createdAt: Date;
}

export interface ClubMember {
  userId: string;
  username: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  chips: number;
}

// トーナメントの型定義
export interface Tournament {
  id: string;
  name: string;
  type: 'mtt' | 'sng' | 'spinup';
  buyIn: number;
  prizePool: number;
  structure: TournamentStructure;
  status: 'registering' | 'running' | 'finished';
  players: TournamentPlayer[];
  tables: Game[];
  startTime: Date;
  endTime?: Date;
}

export interface TournamentStructure {
  startingChips: number;
  blindLevels: BlindLevel[];
  levelDuration: number; // 分単位
}

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
}

export interface TournamentPlayer {
  userId: string;
  username: string;
  chips: number;
  position?: number;
  prize?: number;
  eliminatedAt?: Date;
}

// チャットの型定義
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  type: 'text' | 'voice' | 'emoji';
  gameId?: string;
  clubId?: string;
  timestamp: Date;
}

// ペット育成の型定義
export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: 'dragon' | 'phoenix' | 'tiger' | 'turtle';
  level: number;
  experience: number;
  hunger: number;
  happiness: number;
  abilities: PetAbility[];
  createdAt: Date;
}

export interface PetAbility {
  name: string;
  description: string;
  effect: 'chip-bonus' | 'exp-bonus' | 'luck-bonus';
  value: number;
}

// 統計の型定義
export interface PlayerStats {
  userId: string;
  totalGames: number;
  gamesWon: number;
  totalChipsWon: number;
  totalChipsLost: number;
  biggestPot: number;
  bestHand: string;
  winRate: number;
  vpip: number; // Voluntarily Put money In Pot
  pfr: number; // Pre-Flop Raise
  aggression: number;
  handsPlayed: number;
  lastUpdated: Date;
}

// ユーザーの型定義
export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  avatar?: string;
  chips: number;
  level: number;
  experience: number;
  clubs: string[];
  friends: string[];
  achievements: Achievement[];
  createdAt: Date;
  lastLogin: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

// ゲームアクションの型定義
export interface GameAction {
  playerId: string;
  action: Action;
  amount?: number;
  timestamp: Date;
}

// ハンドランキングの型定義
export type HandRank = 
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush';

export interface HandResult {
  rank: HandRank;
  cards: Card[];
  value: number;
  description: string;
}

// クイックゲームの型定義
export interface QuickGame {
  id: string;
  shareLink: string;
  hostId: string;
  gameType: GameType;
  blinds: { small: number; big: number };
  maxPlayers: number;
  expiresAt: Date;
}

