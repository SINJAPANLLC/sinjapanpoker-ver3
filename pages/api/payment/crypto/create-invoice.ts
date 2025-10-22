import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { cryptoPaymentService, CryptoCurrency } from '@/lib/crypto-payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { chipAmount, currency } = req.body;

    if (!chipAmount || chipAmount <= 0) {
      return res.status(400).json({ message: '有効なチップ金額を入力してください' });
    }

    if (!currency || !['BTC', 'ETH', 'USDT', 'USDC', 'LTC'].includes(currency)) {
      return res.status(400).json({ message: '無効な通貨です' });
    }

    const usdAmount = chipAmount * 1;
    const cryptoAmount = cryptoPaymentService.calculateCryptoAmount(usdAmount, currency as CryptoCurrency);

    const invoice = await cryptoPaymentService.createInvoice({
      userId: decoded.userId,
      amount: cryptoAmount,
      currency: currency as CryptoCurrency,
      description: `チップ購入: ${chipAmount}チップ`,
    });

    return res.status(200).json({
      success: true,
      invoice: {
        id: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        address: invoice.address,
        qrCodeUrl: invoice.qrCodeUrl,
        expiresAt: invoice.expiresAt,
        requiredConfirmations: invoice.requiredConfirmations,
        chipAmount,
      },
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
