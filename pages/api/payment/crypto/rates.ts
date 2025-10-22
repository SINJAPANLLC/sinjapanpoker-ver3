import type { NextApiRequest, NextApiResponse } from 'next';
import { cryptoPaymentService, CryptoCurrency } from '@/lib/crypto-payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const currencies: CryptoCurrency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'LTC'];
    
    const rates = currencies.map(currency => {
      const rate = cryptoPaymentService.getExchangeRate(currency);
      return rate ? {
        currency,
        usdRate: rate.usdRate,
        jpyRate: rate.jpyRate,
        lastUpdated: rate.lastUpdated,
      } : null;
    }).filter(r => r !== null);

    return res.status(200).json({
      success: true,
      rates,
      chipToUsdRate: 1,
    });
  } catch (error) {
    console.error('Exchange rates fetch error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
