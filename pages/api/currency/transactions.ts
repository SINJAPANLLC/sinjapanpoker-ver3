import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 簡易的な取引履歴データベース
const transactions: any[] = [
  {
    id: '1',
    userId: '1',
    type: 'purchase',
    currency: 'chips',
    amount: 5000,
    description: 'チップ購入 (500ポイント)',
    timestamp: new Date('2025-01-15T10:00:00').toISOString()
  },
  {
    id: '2',
    userId: '1',
    type: 'game',
    currency: 'chips',
    amount: -1000,
    description: 'ゲーム参加費',
    timestamp: new Date('2025-01-15T11:00:00').toISOString()
  },
  {
    id: '3',
    userId: '1',
    type: 'reward',
    currency: 'chips',
    amount: 2000,
    description: 'ゲーム勝利ボーナス',
    timestamp: new Date('2025-01-15T11:30:00').toISOString()
  },
  {
    id: '4',
    userId: '1',
    type: 'admin',
    currency: 'diamonds',
    amount: 10,
    description: 'イベント参加ボーナス',
    adminId: '2',
    timestamp: new Date('2025-01-14T15:00:00').toISOString()
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // トークンを検証
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // クエリパラメータ
    const { limit = '50', currency, type } = req.query;

    // ユーザーの取引履歴をフィルタリング
    let userTransactions = transactions.filter(t => t.userId === decoded.userId);

    // 通貨タイプでフィルタリング
    if (currency && typeof currency === 'string') {
      userTransactions = userTransactions.filter(t => t.currency === currency);
    }

    // 取引タイプでフィルタリング
    if (type && typeof type === 'string') {
      userTransactions = userTransactions.filter(t => t.type === type);
    }

    // 最大件数制限
    const limitNum = parseInt(limit as string);
    userTransactions = userTransactions.slice(0, limitNum);

    // 統計情報を計算
    const stats = {
      totalTransactions: userTransactions.length,
      totalEarned: userTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      totalSpent: Math.abs(userTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)),
      byCurrency: {} as any
    };

    // 通貨別の統計
    ['chips', 'diamonds', 'energy', 'points'].forEach(curr => {
      const currTransactions = userTransactions.filter(t => t.currency === curr);
      stats.byCurrency[curr] = {
        count: currTransactions.length,
        earned: currTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        spent: Math.abs(currTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
      };
    });

    return res.status(200).json({
      transactions: userTransactions,
      stats
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
