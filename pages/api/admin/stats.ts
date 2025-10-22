import type { NextApiRequest, NextApiResponse } from 'next';
import { userDatabase } from '@/lib/user-database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 管理者認証チェック（簡易版）
    const token = req.headers.authorization;
    // 実際の実装ではJWT検証

    const stats = userDatabase.getStatistics();
    const topRakePlayers = userDatabase.getTopRakePlayers(10);
    const topEarners = userDatabase.getTopEarners(10);

    // 収益計算
    const totalRevenue = stats.totalRakePaid;
    const dailyRevenue = totalRevenue * 0.15; // モック値

    // 今日の新規ユーザー（モック）
    const newUsersToday = Math.floor(stats.totalUsers * 0.05);
    
    return res.status(200).json({
      overview: {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        bannedUsers: stats.bannedUsers,
        totalGames: stats.totalGamesPlayed,
        activeGames: Math.floor(stats.activeUsers * 0.15), // アクティブユーザーの15%がプレイ中と仮定
        totalRevenue,
        dailyRevenue
      },
      revenue: {
        total: totalRevenue,
        rake: stats.totalRakePaid,
        tournament: stats.totalRakePaid * 0.3,
        vip: stats.totalRakePaid * 0.1
      },
      users: {
        total: stats.totalUsers,
        active: stats.activeUsers,
        new: newUsersToday,
        retention: 68.5,
        kycVerified: stats.kycVerified,
        kycPending: stats.kycPending
      },
      games: {
        total: stats.totalGamesPlayed,
        avgDuration: 45,
        avgPot: 125
      },
      topRakePlayers: topRakePlayers.map(u => ({
        id: u.id,
        username: u.username,
        rakePaid: u.totalRakePaid,
        gamesPlayed: u.totalGamesPlayed
      })),
      topEarners: topEarners.map(u => ({
        id: u.id,
        username: u.username,
        earnings: u.totalEarnings,
        winRate: u.totalGamesPlayed > 0 ? (u.totalWins / u.totalGamesPlayed * 100).toFixed(1) : 0
      }))
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
