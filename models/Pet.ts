import mongoose, { Schema, Model } from 'mongoose';
import { Pet } from '@/types';

const PetAbilitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  effect: { type: String, enum: ['chip-bonus', 'exp-bonus', 'luck-bonus'], required: true },
  value: { type: Number, required: true },
});

const PetSchema = new Schema<Pet>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['dragon', 'phoenix', 'tiger', 'turtle'], required: true },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  hunger: { type: Number, default: 100 },
  happiness: { type: Number, default: 100 },
  abilities: [PetAbilitySchema],
  createdAt: { type: Date, default: Date.now },
});

const PetModel: Model<Pet> = mongoose.models.Pet || mongoose.model<Pet>('Pet', PetSchema);

export default PetModel;

