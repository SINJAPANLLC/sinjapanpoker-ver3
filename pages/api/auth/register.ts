import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { users } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, generateToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: '全てのフィールドを入力してください' });
    }

    const existingUsers = await db.select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)));
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'メールアドレスまたはユーザー名が既に使用されています' });
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db.insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
        chips: 10000,
        level: 1,
        experience: 0,
      })
      .returning();

    const token = generateToken({
      userId: newUser.id.toString(),
      username: newUser.username,
      email: newUser.email,
    });

    return res.status(201).json({
      message: '登録が完了しました',
      token,
      user: {
        id: newUser.id.toString(),
        email: newUser.email,
        username: newUser.username,
        chips: newUser.chips,
        level: newUser.level,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
