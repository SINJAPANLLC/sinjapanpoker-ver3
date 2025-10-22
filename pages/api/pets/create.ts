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

    const { name, type } = req.body;

    // バリデーション
    if (!name || !type) {
      return res.status(400).json({ message: 'ペット名とタイプを入力してください' });
    }

    const validTypes = ['dragon', 'phoenix', 'tiger', 'turtle'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: '無効なペットタイプです' });
    }

    // 既にペットを持っているかチェック
    const existingPet = await PetModel.findOne({ userId: payload.userId });
    if (existingPet) {
      return res.status(400).json({ message: '既にペットを持っています' });
    }

    // 初期アビリティを設定
    const abilities = [
      {
        name: '初心者の運',
        description: 'チップボーナス+5%',
        effect: 'chip-bonus' as const,
        value: 5,
      },
    ];

    // ペットを作成
    const pet = await PetModel.create({
      userId: payload.userId,
      name,
      type,
      level: 1,
      experience: 0,
      hunger: 100,
      happiness: 100,
      abilities,
    });

    return res.status(201).json({
      message: 'ペットが作成されました',
      pet,
    });
  } catch (error) {
    console.error('Create pet error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}

