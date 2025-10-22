import mongoose, { Schema, Model } from 'mongoose';
import { Club } from '@/types';

const ClubMemberSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  chips: { type: Number, default: 0 },
});

const ClubSchema = new Schema<Club>({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  description: { type: String, default: '' },
  avatar: { type: String },
  members: [ClubMemberSchema],
  games: [{ type: String }],
  isPrivate: { type: Boolean, default: false },
  clubCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const ClubModel: Model<Club> = mongoose.models.Club || mongoose.model<Club>('Club', ClubSchema);

export default ClubModel;

