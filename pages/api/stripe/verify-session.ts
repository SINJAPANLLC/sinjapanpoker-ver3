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
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        userId: session.metadata?.userId,
        chips: parseInt(session.metadata?.chips || '0'),
        amount: session.amount_total,
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
