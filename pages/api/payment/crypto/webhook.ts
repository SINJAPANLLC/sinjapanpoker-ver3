import type { NextApiRequest, NextApiResponse } from 'next';
import { cryptoPaymentService } from '@/lib/crypto-payment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { invoiceId, txHash, confirmations } = req.body;

    if (!invoiceId || !txHash || confirmations === undefined) {
      return res.status(400).json({ message: '必要な情報が不足しています' });
    }

    const success = await cryptoPaymentService.processWebhook({
      invoiceId,
      txHash,
      confirmations,
    });

    if (!success) {
      return res.status(404).json({ message: 'インボイスが見つかりません' });
    }

    const invoice = cryptoPaymentService.getInvoice(invoiceId);
    
    if (invoice && invoice.status === 'completed') {
      console.log(`[WEBHOOK] 入金完了: ${invoiceId}, ユーザー: ${invoice.userId}, チップ付与予定`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
