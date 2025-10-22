import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/types';

const AchievementSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  chips: { type: Number, default: 10000 },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  clubs: [{ type: String }],
  friends: [{ type: String }],
  achievements: [AchievementSchema],
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;

