import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'メールアドレスとパスワードを入力してください' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
    }

    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    const token = generateToken({
      userId: user.id.toString(),
      username: user.username,
      email: user.email,
    });

    return res.status(200).json({
      message: 'ログインに成功しました',
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        chips: user.chips,
        level: user.level,
        avatar: user.avatar,
        experience: user.experience,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
