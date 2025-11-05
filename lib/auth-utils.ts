import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export interface AuthResult {
  valid: boolean;
  userId?: string;
  username?: string;
  email?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false };
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    };
  } catch (error) {
    console.error('認証エラー:', error);
    return { valid: false };
  }
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    return payload?.userId || null;
  } catch (error) {
    return null;
  }
}
