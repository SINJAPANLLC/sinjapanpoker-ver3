import crypto from 'crypto';

/**
 * CSRFトークン生成と検証
 */

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_LENGTH = 32;

/**
 * CSRFトークンを生成
 */
export function generateCsrfToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  
  const token = `${timestamp}.${randomBytes}`;
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}:${token}`)
    .digest('hex');
  
  return `${token}.${signature}`;
}

/**
 * CSRFトークンを検証
 */
export function verifyCsrfToken(token: string, sessionId: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const [timestamp, randomBytes, signature] = parts;
    const tokenWithoutSig = `${timestamp}.${randomBytes}`;
    
    // 署名を検証
    const expectedSignature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(`${sessionId}:${tokenWithoutSig}`)
      .digest('hex');
    
    if (signature !== expectedSignature) return false;
    
    // トークンの有効期限を確認（1時間）
    const tokenTimestamp = parseInt(timestamp, 10);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    if (now - tokenTimestamp > oneHour) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Next.js APIルート用のCSRF保護ミドルウェア
 */
export function csrfProtection(
  token: string | null | undefined,
  sessionId: string,
  method: string
): { valid: boolean; error?: string } {
  // GETリクエストはCSRF保護不要
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { valid: true };
  }
  
  if (!token) {
    return { valid: false, error: 'CSRFトークンが見つかりません' };
  }
  
  if (!verifyCsrfToken(token, sessionId)) {
    return { valid: false, error: '無効なCSRFトークンです' };
  }
  
  return { valid: true };
}

/**
 * セッションIDを安全に生成
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}
