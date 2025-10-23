/**
 * セキュリティヘッダーの設定
 * XSS, クリックジャッキング, MIME sniffing などの攻撃を防ぐ
 */

export const securityHeaders = {
  // XSS保護を有効化（ブラウザの組み込み保護）
  'X-XSS-Protection': '1; mode=block',
  
  // MIMEタイプスニッフィングを防止
  'X-Content-Type-Options': 'nosniff',
  
  // クリックジャッキング攻撃を防止
  'X-Frame-Options': 'DENY',
  
  // リファラーポリシー（プライバシー保護）
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy（厳格なXSS保護）
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com", // Stripe用
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com wss: ws:",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Permissions Policy（機能制限）
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()', // FLoC無効化
  ].join(', '),
  
  // HSTS（HTTPS強制）※本番環境のみ
  ...(process.env.NODE_ENV === 'production' ? {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  } : {}),
};

/**
 * Next.js用のセキュリティヘッダー設定を生成
 */
export function getNextSecurityHeaders() {
  return Object.entries(securityHeaders).map(([key, value]) => ({
    key,
    value,
  }));
}

/**
 * CORSヘッダーの設定（開発環境と本番環境で分ける）
 */
export function getCorsHeaders(origin?: string) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  
  const isAllowed = allowedOrigins.includes('*') || 
    (origin && allowedOrigins.includes(origin));
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24時間キャッシュ
  };
}

/**
 * APIレスポンス用のセキュリティヘッダー
 */
export function getApiSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
  };
}
