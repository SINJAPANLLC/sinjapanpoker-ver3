import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

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
    const { userId, amount, description } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: 'userId and amount are required' });
    }

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: description || 'チップ購入',
              description: `ユーザーID: ${userId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/payment/success?userId=${userId}`,
        },
      },
      metadata: {
        userId,
        type: 'chip_purchase',
      },
    });

    return res.status(200).json({
      url: paymentLink.url,
      id: paymentLink.id,
    });
  } catch (error: any) {
    console.error('Stripe payment link creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment link',
      message: error.message 
    });
  }
}
