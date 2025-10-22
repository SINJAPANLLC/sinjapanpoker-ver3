import mongoose, { Schema, Model } from 'mongoose';

export interface GamePlayer {
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
}

export interface Game {
  gameId: string;
  type: 'texas-holdem' | 'omaha' | 'ofc';
  phase: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended';
  players: GamePlayer[];
  communityCards: Array<{ suit: string; rank: string; id: string }>;
  pot: number;
  currentBet: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  winner?: string;
  winningHand?: string;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
}

const CardSchema = new Schema({
  suit: { type: String, required: true },
  rank: { type: String, required: true },
  id: { type: String, required: true },
}, { _id: false });

const GamePlayerSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  chips: { type: Number, required: true },
  bet: { type: Number, default: 0 },
  cards: [CardSchema],
  folded: { type: Boolean, default: false },
  isAllIn: { type: Boolean, default: false },
  position: { type: Number, required: true },
  isDealer: { type: Boolean, default: false },
  hasActed: { type: Boolean, default: false },
}, { _id: false });

const GameSchema = new Schema<Game>({
  gameId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['texas-holdem', 'omaha', 'ofc'], required: true },
  phase: { type: String, enum: ['waiting', 'preflop', 'flop', 'turn', 'river', 'showdown', 'ended'], default: 'waiting' },
  players: [GamePlayerSchema],
  communityCards: [CardSchema],
  pot: { type: Number, default: 0 },
  currentBet: { type: Number, default: 0 },
  currentPlayerIndex: { type: Number, default: 0 },
  dealerIndex: { type: Number, default: 0 },
  smallBlind: { type: Number, required: true },
  bigBlind: { type: Number, required: true },
  winner: { type: String },
  winningHand: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
});

GameSchema.index({ gameId: 1 });
GameSchema.index({ phase: 1 });
GameSchema.index({ createdAt: -1 });

const GameModel: Model<Game> = mongoose.models.Game || mongoose.model<Game>('Game', GameSchema);

export default GameModel;
