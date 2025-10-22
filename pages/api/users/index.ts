import type { NextApiRequest, NextApiResponse } from 'next';
import { userDatabase } from '@/lib/user-database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { status, search } = req.query;

    let users = userDatabase.getAllUsers();

    // ステータスフィルター
    if (status && typeof status === 'string') {
      users = users.filter(u => u.status === status);
    }

    // 検索フィルター
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.username.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    // パスワードを除外
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return res.status(200).json({
      users: usersWithoutPasswords,
      total: users.length
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
