import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import PetModel from '@/models/Pet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'ユーザーIDが必要です' });
    }

    // ペットを検索
    const pet = await PetModel.findOne({ userId });

    return res.status(200).json({ pet });
  } catch (error) {
    console.error('Get pet error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}

