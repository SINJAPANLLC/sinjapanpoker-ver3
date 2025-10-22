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

// パスワードをハッシュ化
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
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
    const { email, username, password } = req.body;

    // バリデーション
    if (!email || !username || !password) {
      return res.status(400).json({ message: '全てのフィールドを入力してください' });
    }

    // ユーザーが既に存在するか確認
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'メールアドレスまたはユーザー名が既に使用されています' });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーを作成
    const user = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      chips: 10000,
      level: 1,
      experience: 0,
      createdAt: new Date(),
    };

    users.push(user);

    // JWTトークンを生成
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    return res.status(201).json({
      message: '登録が完了しました',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        chips: user.chips,
        level: user.level,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
}
