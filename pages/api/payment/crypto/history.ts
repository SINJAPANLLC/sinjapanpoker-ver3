import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { cryptoPaymentService } from '@/lib/crypto-payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: '無効なトークンです' });
    }

    const transactions = cryptoPaymentService.getUserTransactions(decoded.userId);

    return res.status(200).json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        currency: tx.currency,
        txHash: tx.txHash,
        confirmations: tx.confirmations,
        status: tx.status,
        timestamp: tx.timestamp,
        chipAmount: tx.chipAmount,
      })),
    });
  } catch (error) {
    console.error('Transaction history fetch error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
