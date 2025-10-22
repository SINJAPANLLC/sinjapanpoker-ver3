import { NextApiRequest, NextApiResponse } from 'next';
import { RAKE_CONFIG } from '@/lib/rake-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // 現在のレーキ設定を取得
    return res.status(200).json(RAKE_CONFIG);
  }

  if (req.method === 'PUT') {
    // レーキ設定を更新（実際の実装ではデータベースに保存）
    const { rakePercentage, rakeCap, tournamentFeePercentage } = req.body;

    if (rakePercentage !== undefined && (rakePercentage < 0 || rakePercentage > 20)) {
      return res.status(400).json({ message: 'レーキ率は0-20%の範囲で設定してください' });
    }

    if (rakeCap !== undefined && (rakeCap < 0 || rakeCap > 1000)) {
      return res.status(400).json({ message: 'レーキキャップは0-1000チップの範囲で設定してください' });
    }

    if (tournamentFeePercentage !== undefined && (tournamentFeePercentage < 0 || tournamentFeePercentage > 50)) {
      return res.status(400).json({ message: 'トーナメント参加料は0-50%の範囲で設定してください' });
    }

    // 実際の実装ではデータベースに保存
    return res.status(200).json({ message: '設定を更新しました', config: RAKE_CONFIG });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
