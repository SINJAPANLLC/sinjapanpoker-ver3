import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 簡易的なユーザーデータベース（事前にテストユーザーを作成）
const users: any[] = [
  {
    id: '2',
    email: 'info@sinjapan.jp',
    username: 'admin',
    password: '$2a$10$/cGUiWoD8uRHCF41Jk0Ng.aeRXnq.MiFNz40oXgeMRH2Huo/wBQQi', // Kazuya8008
    chips: 100000,
    level: 100,
    experience: 999999,
    isAdmin: true,
    createdAt: new Date(),
  }
];

// パスワードを検証
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// JWTトークンを生成
function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      return res.status(400).json({ message: 'メールアドレスとパスワードを入力してください' });
    }

    // ユーザーを検索
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
    }

    // パスワードを検証
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが間違っています' });
    }

    // JWTトークンを生成
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    return res.status(200).json({
      message: 'ログインに成功しました',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        chips: user.chips,
        level: user.level,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
