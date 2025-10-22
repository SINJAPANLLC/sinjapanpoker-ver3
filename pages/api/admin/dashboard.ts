import type { NextApiRequest, NextApiResponse } from 'next';

interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  activeGames: number;
  totalRevenue: number;
  dailyRevenue: number;
  userStats: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  };
  gameStats: {
    gamesPlayedToday: number;
    gamesPlayedThisWeek: number;
    gamesPlayedThisMonth: number;
  };
  recentActivity: {
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 管理者認証チェック
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    // 実際の実装では、JWTトークンの検証を行う
    const token = authHeader.substring(7);

    // 管理者ダッシュボードデータ
    const dashboardData: AdminDashboardData = {
      totalUsers: 15420,
      activeUsers: 3240,
      totalGames: 89450,
      activeGames: 156,
      totalRevenue: 125678.90,
      dailyRevenue: 3456.78,
      userStats: {
        newUsersToday: 45,
        newUsersThisWeek: 312,
        newUsersThisMonth: 1280
      },
      gameStats: {
        gamesPlayedToday: 1250,
        gamesPlayedThisWeek: 8750,
        gamesPlayedThisMonth: 34200
      },
      recentActivity: [
        {
          id: 1,
          type: 'user_registration',
          description: '新しいユーザーが登録されました',
          timestamp: '2025-01-15T10:30:00Z',
          user: 'newplayer123'
        },
        {
          id: 2,
          type: 'game_completed',
          description: 'ゲームが完了しました',
          timestamp: '2025-01-15T10:25:00Z',
          user: 'pokermaster'
        },
        {
          id: 3,
          type: 'vip_purchase',
          description: 'VIPカードが購入されました',
          timestamp: '2025-01-15T10:20:00Z',
          user: 'highroller'
        }
      ]
    };

    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
