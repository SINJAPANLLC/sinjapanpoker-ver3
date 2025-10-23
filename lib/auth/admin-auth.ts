import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_EMAIL = 'info@sinjapan.jp'; // adminユーザーのメールアドレス

export interface AdminTokenPayload {
  userId: string;
  email: string;
  username: string;
  isAdmin?: boolean;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    
    // adminユーザーかチェック
    if (decoded.email !== ADMIN_EMAIL && !decoded.isAdmin) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('トークン検証エラー:', error);
    return null;
  }
}

export function getAdminFromRequest(request: NextRequest): AdminTokenPayload | null {
  // Authorizationヘッダーからトークンを取得
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7); // "Bearer " を除去
  return verifyAdminToken(token);
}

export function requireAdmin(request: NextRequest): { admin: AdminTokenPayload } | { error: string; status: number } {
  const admin = getAdminFromRequest(request);
  
  if (!admin) {
    return {
      error: '管理者権限が必要です',
      status: 401,
    };
  }
  
  return { admin };
}
