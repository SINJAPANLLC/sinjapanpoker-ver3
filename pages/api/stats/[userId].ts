import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import PlayerStatsModel from '@/models/PlayerStats';

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

    // 統計情報を検索
    let stats = await PlayerStatsModel.findOne({ userId });

    // 統計情報が存在しない場合は作成
    if (!stats) {
      stats = await PlayerStatsModel.create({
        userId,
        totalGames: 0,
        gamesWon: 0,
        totalChipsWon: 0,
        totalChipsLost: 0,
        biggestPot: 0,
        bestHand: '',
        winRate: 0,
        vpip: 0,
        pfr: 0,
        aggression: 0,
        handsPlayed: 0,
      });
    }

    return res.status(200).json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}

