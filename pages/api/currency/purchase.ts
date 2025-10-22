import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 簡易的なユーザーデータベース
const users: any[] = [
  {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    chips: 10000,
    diamonds: 50,
    energy: 100,
    points: 0,
    createdAt: new Date(),
  },
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
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    const { currencyType, amount, pointsCost } = req.body;

    // バリデーション
    if (!currencyType || !amount || !pointsCost) {
      return res.status(400).json({ message: '必要な情報が不足しています' });
    }

    if (user.points < pointsCost) {
      return res.status(400).json({ message: 'ポイントが不足しています' });
    }

    // 購入処理
    user.points -= pointsCost;
    
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
      default:
        return res.status(400).json({ message: '無効な通貨タイプです' });
    }

    return res.status(200).json({
      message: '購入が完了しました',
      currency: {
        chips: user.chips,
        diamonds: user.diamonds,
        energy: user.energy,
        points: user.points
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
