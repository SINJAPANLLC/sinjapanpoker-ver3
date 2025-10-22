import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import PetModel from '@/models/Pet';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // 認証トークンを検証
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: '無効なトークンです' });
    }

    // ペットを検索
    const pet = await PetModel.findOne({ userId: payload.userId });
    if (!pet) {
      return res.status(404).json({ message: 'ペットが見つかりません' });
    }

    // 空腹度と幸福度を回復
    pet.hunger = Math.min(100, pet.hunger + 30);
    pet.happiness = Math.min(100, pet.happiness + 10);

    // 経験値を追加
    pet.experience += 10;

    // レベルアップチェック
    const expNeeded = pet.level * 100;
    if (pet.experience >= expNeeded) {
      pet.level += 1;
      pet.experience -= expNeeded;

      // 新しいアビリティを追加
      if (pet.level % 5 === 0) {
        pet.abilities.push({
          name: `レベル${pet.level}ボーナス`,
          description: '経験値ボーナス+10%',
          effect: 'exp-bonus',
          value: 10,
        });
      }
    }

    await pet.save();

    return res.status(200).json({
      message: 'ペットに餌を与えました',
      pet,
      leveledUp: pet.experience < expNeeded,
    });
  } catch (error) {
    console.error('Feed pet error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}

