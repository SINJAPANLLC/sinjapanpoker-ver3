import DOMPurify from 'isomorphic-dompurify';

/**
 * HTMLコンテンツをサニタイズしてXSS攻撃を防止
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
  });
}

/**
 * プレーンテキストのみを許可（すべてのHTMLタグを削除）
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * チャットメッセージ用のサニタイズ（URLは許可）
 */
export function sanitizeChatMessage(message: string): string {
  // まず基本的なサニタイゼーション
  let cleaned = DOMPurify.sanitize(message, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  
  // URLを検出してリンクに変換（安全に）
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  cleaned = cleaned.replace(urlRegex, (url) => {
    const sanitizedUrl = encodeURI(url);
    return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${sanitizedUrl}</a>`;
  });
  
  return cleaned;
}

/**
 * JSONオブジェクトの全文字列フィールドをサニタイズ
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * SQLインジェクション対策用のエスケープ（Drizzle ORMが主に処理するが追加防御）
 */
export function escapeSql(value: string): string {
  return value.replace(/['";\\]/g, '\\$&');
}

/**
 * ユーザー名のサニタイズ（英数字、アンダースコア、ハイフンのみ許可）
 */
export function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * メールアドレスの検証とサニタイズ
 */
export function sanitizeEmail(email: string): string {
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(cleaned)) {
    throw new Error('無効なメールアドレス形式です');
  }
  
  return cleaned;
}

/**
 * パス トラバーサル攻撃を防ぐファイルパスのサニタイズ
 */
export function sanitizeFilePath(path: string): string {
  // ../ や ..\ などのディレクトリトラバーサルを除去
  return path.replace(/\.\.[\/\\]/g, '');
}
