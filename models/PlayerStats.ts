import mongoose, { Schema, Model } from 'mongoose';
import { PlayerStats } from '@/types';

const PlayerStatsSchema = new Schema<PlayerStats>({
  userId: { type: String, required: true, unique: true },
  totalGames: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
  totalChipsWon: { type: Number, default: 0 },
  totalChipsLost: { type: Number, default: 0 },
  biggestPot: { type: Number, default: 0 },
  bestHand: { type: String, default: '' },
  winRate: { type: Number, default: 0 },
  vpip: { type: Number, default: 0 },
  pfr: { type: Number, default: 0 },
  aggression: { type: Number, default: 0 },
  handsPlayed: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const PlayerStatsModel: Model<PlayerStats> = mongoose.models.PlayerStats || mongoose.model<PlayerStats>('PlayerStats', PlayerStatsSchema);

export default PlayerStatsModel;

