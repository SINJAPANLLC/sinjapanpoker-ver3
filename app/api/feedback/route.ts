import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { feedback } from '@shared/schema';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'improvement', 'other']),
  message: z.string().min(10).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = feedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '入力が無効です', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { category, message } = validationResult.data;

    const newFeedback = await db.insert(feedback).values({
      userId: payload.userId,
      username: payload.username,
      category,
      message,
      status: 'pending',
    }).returning();

    return NextResponse.json({
      success: true,
      feedback: newFeedback[0],
      message: 'フィードバックを送信しました。ありがとうございます！',
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'フィードバックの送信に失敗しました' },
      { status: 500 }
    );
  }
}
