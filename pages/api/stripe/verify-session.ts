import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { db } from '@/server/db-api';
import { users, paymentTransactions } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId;
      const chips = parseInt(session.metadata?.chips || '0');
      const amount = session.amount_total || 0;

      if (!userId || chips <= 0) {
        return res.status(400).json({ error: 'Invalid session metadata' });
      }

      // トランザクション内でユーザー残高更新と決済履歴を記録
      // ユニーク制約により、同じセッションIDでの二重処理を防止
      try {
        await db.transaction(async (tx) => {
          // まず決済履歴を記録（ユニーク制約により二重処理を防止）
          const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
          
          if (!user) {
            throw new Error('User not found');
          }

          await tx.insert(paymentTransactions).values({
            userId,
            username: user.username,
            type: 'deposit',
            amount: chips,
            stripeAmount: amount,
            currency: 'JPY',
            stripeSessionId: sessionId,
            stripePaymentIntentId: (session.payment_intent as string) || null,
            status: 'completed',
            method: 'credit_card',
            description: `${chips.toLocaleString()}チップ購入（¥${amount.toLocaleString()}）`,
            completedAt: new Date(),
          });

          // ユーザーの残高を原子的に増やす（並行処理での競合を防止）
          await tx
            .update(users)
            .set({
              realChips: sql`${users.realChips} + ${chips}`,
            })
            .where(eq(users.id, userId));
        });
      } catch (txError: any) {
        // ユニーク制約違反の場合は既に処理済み
        if (txError.code === '23505' || txError.message?.includes('duplicate key')) {
          return res.status(200).json({
            success: true,
            userId,
            chips,
            amount,
            alreadyProcessed: true,
          });
        }
        throw txError;
      }

      return res.status(200).json({
        success: true,
        userId,
        chips,
        amount,
      });
    } else {
      return res.status(200).json({
        success: false,
        status: session.payment_status,
      });
    }
  } catch (error: any) {
    console.error('Stripe session verification error:', error);
    return res.status(500).json({ 
      error: 'Failed to verify session',
      message: error.message 
    });
  }
}
