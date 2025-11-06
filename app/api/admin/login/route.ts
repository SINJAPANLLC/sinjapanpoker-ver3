import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_EMAIL = 'info@sinjapan.jp';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードが必要です' },
        { status: 400 }
      );
    }

    // データベースからユーザーを取得
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // Admin権限チェック
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: '管理者権限がありません' },
        { status: 403 }
      );
    }

    // JWTトークン生成
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      adminUser: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: 'super-admin',
        permissions: [
          'tournament.create',
          'tournament.edit',
          'tournament.delete',
          'tournament.manage',
          'user.manage',
          'analytics.view',
          'currency.manage',
          'revenue.view',
          'monitor.view',
          'table.manage',
          'table.create',
          'table.edit',
          'table.delete',
          'realmoney.manage',
          'settings.manage',
        ],
      },
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
}
