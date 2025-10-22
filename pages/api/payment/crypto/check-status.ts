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

    const { invoiceId } = req.query;

    if (!invoiceId || typeof invoiceId !== 'string') {
      return res.status(400).json({ message: 'インボイスIDが必要です' });
    }

    const invoice = await cryptoPaymentService.checkInvoiceStatus(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'インボイスが見つかりません' });
    }

    if (invoice.userId !== decoded.userId) {
      return res.status(403).json({ message: 'アクセス権限がありません' });
    }

    return res.status(200).json({
      success: true,
      invoice: {
        id: invoice.id,
        status: invoice.status,
        confirmations: invoice.confirmations,
        requiredConfirmations: invoice.requiredConfirmations,
        txHash: invoice.txHash,
        expiresAt: invoice.expiresAt,
      },
    });
  } catch (error) {
    console.error('Invoice check error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
