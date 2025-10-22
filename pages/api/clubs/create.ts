import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import ClubModel from '@/models/Club';
import { verifyToken, generateClubCode } from '@/lib/auth';

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

    const { name, description, isPrivate } = req.body;

    // バリデーション
    if (!name) {
      return res.status(400).json({ message: 'クラブ名を入力してください' });
    }

    // クラブコードを生成（重複しないまで試行）
    let clubCode = generateClubCode();
    let codeExists = await ClubModel.findOne({ clubCode });
    while (codeExists) {
      clubCode = generateClubCode();
      codeExists = await ClubModel.findOne({ clubCode });
    }

    // クラブを作成
    const club = await ClubModel.create({
      name,
      ownerId: payload.userId,
      description: description || '',
      isPrivate: isPrivate || false,
      clubCode,
      members: [
        {
          userId: payload.userId,
          username: payload.username,
          role: 'owner',
          chips: 10000,
        },
      ],
      games: [],
    });

    return res.status(201).json({
      message: 'クラブが作成されました',
      club,
    });
  } catch (error) {
    console.error('Create club error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}

