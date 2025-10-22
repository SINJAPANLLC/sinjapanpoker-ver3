import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 簡易的なユーザーデータベース
const users: any[] = [
  {
    id: '2',
    email: 'info@sinjapan.jp',
    username: 'admin',
    chips: 100000,
    diamonds: 100,
    energy: 100,
    points: 10000,
    isAdmin: true,
    createdAt: new Date(),
  }
];

// 取引履歴
const transactions: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // トークンを検証
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = users.find(u => u.id === decoded.userId);

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: '管理者権限が必要です' });
    }

    const { userId, currencyType, amount, reason } = req.body;

    // バリデーション
    if (!userId || !currencyType || !amount || !reason) {
      return res.status(400).json({ message: '必要な情報が不足しています' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: '有効な金額を入力してください' });
    }

    // ユーザーを検索
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // 通貨を付与
    switch (currencyType) {
      case 'chips':
        user.chips += amount;
        break;
      case 'diamonds':
        user.diamonds += amount;
        break;
      case 'energy':
        user.energy += amount;
        break;
      case 'points':
        user.points += amount;
        break;
      default:
        return res.status(400).json({ message: '無効な通貨タイプです' });
    }

    // 取引履歴を記録
    const transaction = {
      id: Date.now().toString(),
      userId,
      username: user.username,
      type: 'admin_grant',
      currencyType,
      amount,
      reason,
      adminId: admin.id,
      adminUsername: admin.username,
      timestamp: new Date().toISOString()
    };

    transactions.unshift(transaction);

    return res.status(200).json({
      message: '通貨を付与しました',
      user: {
        id: user.id,
        username: user.username,
        chips: user.chips,
        diamonds: user.diamonds,
        energy: user.energy,
        points: user.points
      },
      transaction
    });
  } catch (error) {
    console.error('Grant currency error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
