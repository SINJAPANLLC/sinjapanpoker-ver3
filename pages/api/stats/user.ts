import type { NextApiRequest, NextApiResponse } from 'next';

// ユーザー統計データの型定義
interface UserStats {
  totalEarnings: number;
  recentEarnings: number;
  gamesPlayed: number;
  winRate: number;
  totalChips: number;
  energy: number;
  gems: number;
  coins: number;
  vipDays: number;
  level: number;
  experience: number;
  handHistory: any[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // 実際のデータベースから取得する想定（現在はモックデータ）
    const userStats: UserStats = {
      totalEarnings: 565.71,
      recentEarnings: 378.39,
      gamesPlayed: 42,
      winRate: 67.5,
      totalChips: 104130000,
      energy: 185,
      gems: 38,
      coins: 104130000,
      vipDays: 28,
      level: 6,
      experience: 4250,
      handHistory: [
        {
          id: 1,
          date: '2025-01-15',
          result: 'win',
          chips: 1500,
          gameType: 'NLH',
          blinds: '0.1/0.2'
        },
        {
          id: 2,
          date: '2025-01-14',
          result: 'loss',
          chips: -800,
          gameType: 'NLH',
          blinds: '0.05/0.1'
        }
      ]
    };

    return res.status(200).json(userStats);
  } catch (error) {
    console.error('User stats error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
