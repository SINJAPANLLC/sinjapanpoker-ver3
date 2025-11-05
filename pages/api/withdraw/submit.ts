import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { withdrawalRequests, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/api-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) {
    return;
  }

  try {
    const {
      amount,
      method,
      bankAccount,
      cryptoInfo,
      reason
    } = req.body;

    const userId = authUser.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: '有効な金額を入力してください' });
    }

    if (amount < 1000) {
      return res.status(400).json({ message: '最小出金額は1000チップです' });
    }

    if (!method || (method !== 'bank_transfer' && method !== 'crypto')) {
      return res.status(400).json({ message: '出金方法を選択してください' });
    }

    if (method === 'bank_transfer') {
      if (!bankAccount || !bankAccount.bankName || !bankAccount.accountNumber || !bankAccount.accountName) {
        return res.status(400).json({ message: 'すべての銀行情報を入力してください' });
      }
    }

    if (method === 'crypto') {
      if (!cryptoInfo || !cryptoInfo.walletAddress || !cryptoInfo.currency) {
        return res.status(400).json({ message: 'ウォレット情報を入力してください' });
      }
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    if (user.realChips < amount) {
      return res.status(400).json({ message: '残高が不足しています' });
    }

    const [newWithdrawal] = await db.insert(withdrawalRequests).values({
      userId,
      username: user.username,
      amount,
      method,
      bankAccount: method === 'bank_transfer' ? bankAccount : null,
      cryptoInfo: method === 'crypto' ? cryptoInfo : null,
      status: 'pending',
      reason: reason || null,
      submittedAt: new Date()
    }).returning();

    return res.status(200).json({
      success: true,
      message: '出金申請が送信されました。通常1-3営業日以内に処理されます。',
      withdrawal: newWithdrawal
    });
  } catch (error) {
    console.error('出金申請エラー:', error);
    return res.status(500).json({ message: '出金申請中にエラーが発生しました' });
  }
}
