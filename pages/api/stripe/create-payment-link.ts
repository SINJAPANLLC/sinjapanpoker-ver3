import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

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
    const { userEmail, userId, amount, description } = req.body;

    // メールアドレスまたはユーザーIDが必要
    if ((!userEmail && !userId) || !amount) {
      return res.status(400).json({ error: 'userEmail or userId, and amount are required' });
    }

    if (amount < 50) {
      return res.status(400).json({ error: 'Stripeの最低決済金額は50円です' });
    }

    let finalUserId = userId;
    let userDisplayInfo = userId || userEmail;

    // メールアドレスが提供された場合、ユーザーIDを検索
    if (userEmail && !userId) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const db = drizzle(pool);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }

      finalUserId = user.id;
      userDisplayInfo = `${userEmail} (${user.username})`;
    }

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: description || 'チップ購入',
              description: `ユーザー: ${userDisplayInfo}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/payment/success?userId=${finalUserId}`,
        },
      },
      metadata: {
        userId: finalUserId,
        userEmail: userEmail || '',
        type: 'chip_purchase',
      },
    });

    return res.status(200).json({
      url: paymentLink.url,
      id: paymentLink.id,
      userId: finalUserId,
    });
  } catch (error: any) {
    console.error('Stripe payment link creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment link',
      message: error.message 
    });
  }
}
