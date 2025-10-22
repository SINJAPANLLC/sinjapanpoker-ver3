import type { NextApiRequest, NextApiResponse } from 'next';
import { userDatabase } from '@/lib/user-database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: '無効なユーザーID' });
  }

  if (req.method === 'GET') {
    // ユーザー情報取得
    const user = userDatabase.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // パスワードを除外して返す
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json(userWithoutPassword);
  }

  if (req.method === 'PATCH') {
    // ユーザー情報更新
    const updates = req.body;
    const updatedUser = userDatabase.updateUser(id, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json(userWithoutPassword);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
