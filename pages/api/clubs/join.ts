import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import ClubModel from '@/models/Club';
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

    const { clubCode } = req.body;

    // バリデーション
    if (!clubCode) {
      return res.status(400).json({ message: 'クラブコードを入力してください' });
    }

    // クラブを検索
    const club = await ClubModel.findOne({ clubCode });
    if (!club) {
      return res.status(404).json({ message: 'クラブが見つかりません' });
    }

    // 既にメンバーかチェック
    const isMember = club.members.some(m => m.userId === payload.userId);
    if (isMember) {
      return res.status(400).json({ message: '既にこのクラブのメンバーです' });
    }

    // メンバーを追加
    club.members.push({
      userId: payload.userId,
      username: payload.username,
      role: 'member',
      joinedAt: new Date(),
      chips: 5000,
    });

    await club.save();

    return res.status(200).json({
      message: 'クラブに参加しました',
      club,
    });
  } catch (error) {
    console.error('Join club error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}

