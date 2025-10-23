# SIN JAPAN POKER - セキュリティガイド

## 概要

このアプリケーションは、包括的なセキュリティ対策を実装しています。

## 🔐 実装済みセキュリティ機能

### 1. **Rate Limiting（レート制限）**

APIへの過剰なリクエストを防ぐため、エンドポイント別にレート制限を実装しています。

**制限内容：**
- 一般API: 15分あたり100リクエスト
- 認証API: 15分あたり5回の試行
- 決済API: 1時間あたり10リクエスト
- 管理API: 15分あたり200リクエスト
- Socket.io: 1分あたり30接続

**使用例：**
```typescript
import { authLimiter } from '@/lib/middleware/rate-limit';

// Pages Router APIの場合
export default authLimiter(async function handler(req, res) {
  // ログイン処理
});
```

### 2. **入力バリデーション（Zod）**

全てのユーザー入力は、Zodスキーマで厳格に検証されます。

**使用例：**
```typescript
import { validateData, loginSchema } from '@/lib/validation/schemas';

const result = validateData(loginSchema, req.body);

if (!result.success) {
  return res.status(400).json({ error: result.error });
}

// result.data は型安全で検証済み
const { email, password } = result.data;
```

**実装済みスキーマ：**
- `loginSchema` - ログイン
- `registerSchema` - 新規登録
- `changePasswordSchema` - パスワード変更
- `stripeCheckoutSchema` - Stripe決済
- `cryptoInvoiceSchema` - 仮想通貨決済
- `createGameSchema` - ゲーム作成
- `playerActionSchema` - プレイヤーアクション
- `createTournamentSchema` - トーナメント作成
- `chatMessageSchema` - チャットメッセージ
- その他多数

### 3. **XSS対策**

DOMPurifyを使用したサニタイゼーションとセキュリティヘッダーで保護。

**使用例：**
```typescript
import { sanitizeHtml, sanitizeText, sanitizeChatMessage } from '@/lib/security/sanitize';

// HTMLコンテンツのサニタイズ
const cleanHtml = sanitizeHtml(userInput);

// プレーンテキストのみ許可
const cleanText = sanitizeText(userInput);

// チャットメッセージ（URLは許可）
const cleanMessage = sanitizeChatMessage(chatInput);
```

**セキュリティヘッダー：**
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 4. **CSRF対策**

トークンベースのCSRF保護を実装。

**使用例：**
```typescript
import { generateCsrfToken, csrfProtection } from '@/lib/security/csrf';

// トークン生成
const token = generateCsrfToken(sessionId);

// トークン検証
const result = csrfProtection(
  req.headers['x-csrf-token'],
  sessionId,
  req.method
);

if (!result.valid) {
  return res.status(403).json({ error: result.error });
}
```

### 5. **JWT認証**

ユーザーと管理者の認証にJWTトークンを使用。

**特徴：**
- bcryptによるパスワードハッシュ化（10 salt rounds）
- トークン有効期限: 7日間
- 環境変数`JWT_SECRET`で署名

**使用例：**
```typescript
import { generateToken, verifyToken } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/auth';

// パスワードハッシュ化
const hashedPassword = await hashPassword('password123');

// パスワード検証
const isValid = await verifyPassword('password123', hashedPassword);

// トークン生成
const token = generateToken({
  userId: user.id,
  username: user.username,
  email: user.email,
});

// トークン検証
const payload = verifyToken(token);
```

### 6. **SQL Injection防止**

Drizzle ORMを使用し、全てのクエリはパラメータ化されています。

### 7. **管理者認証**

専用の管理者認証システムで保護。

**使用例：**
```typescript
import { requireAdmin } from '@/lib/auth/admin-auth';

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  
  if ('error' in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  
  // 認証成功 - authResult.admin にアクセス可能
}
```

## 📝 APIルートのベストプラクティス

### 完全なセキュリティ実装例

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { authLimiter } from '@/lib/middleware/rate-limit';
import { validateData, loginSchema } from '@/lib/validation/schemas';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { verifyPassword, generateToken } from '@/lib/auth';
import { db } from '@/server/db-api';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. HTTPメソッドチェック
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. 入力バリデーション
  const validation = validateData(loginSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }

  // 3. サニタイゼーション
  const email = sanitizeEmail(validation.data.email);
  const { password } = validation.data;

  // 4. データベースクエリ（Drizzle ORM - SQLインジェクション対策済み）
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: '認証に失敗しました' });
  }

  // 5. パスワード検証
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: '認証に失敗しました' });
  }

  // 6. トークン生成
  const token = generateToken({
    userId: user.id,
    username: user.username,
    email: user.email,
  });

  // 7. セキュアなレスポンス
  return res.status(200).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      // パスワードは絶対に返さない
    },
  });
}

// Rate Limitingを適用してエクスポート
export default authLimiter(handler);
```

## 🔒 環境変数

以下の環境変数を必ず設定してください：

```env
# JWT署名キー（最低32文字のランダム文字列）
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# CSRF保護用秘密鍵
CSRF_SECRET=your-csrf-secret-key

# データベース接続
DATABASE_URL=postgresql://...

# Stripe API
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_...

# 許可するオリジン（本番環境）
ALLOWED_ORIGINS=https://yourdomain.com
```

## ⚠️ 重要な注意事項

### やってはいけないこと

1. **パスワードをログに出力しない**
   ```typescript
   // ❌ NG
   console.log('User password:', password);
   
   // ✅ OK
   console.log('User logged in:', userId);
   ```

2. **ユーザー入力を直接SQLに使用しない**
   ```typescript
   // ❌ NG - SQLインジェクションの危険
   const query = `SELECT * FROM users WHERE email = '${email}'`;
   
   // ✅ OK - Drizzle ORMを使用
   const users = await db.select().from(users).where(eq(users.email, email));
   ```

3. **HTMLをそのまま表示しない**
   ```typescript
   // ❌ NG - XSSの危険
   <div dangerouslySetInnerHTML={{ __html: userInput }} />
   
   // ✅ OK - サニタイズ済み
   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
   ```

4. **秘密鍵をコードにハードコーディングしない**
   ```typescript
   // ❌ NG
   const SECRET = 'my-secret-key-123';
   
   // ✅ OK
   const SECRET = process.env.JWT_SECRET;
   ```

### やるべきこと

1. ✅ 全てのユーザー入力をバリデーション
2. ✅ センシティブな情報をログに出力しない
3. ✅ HTTPSを本番環境で使用
4. ✅ 環境変数で秘密鍵を管理
5. ✅ 定期的なセキュリティ監査
6. ✅ 依存パッケージの更新
7. ✅ エラーメッセージで詳細を漏らさない

## 🛡️ セキュリティチェックリスト

リリース前に以下を確認してください：

- [ ] 全APIエンドポイントにRate Limitingを適用
- [ ] 全ユーザー入力をZodでバリデーション
- [ ] チャットなど動的コンテンツをサニタイズ
- [ ] JWT_SECRETが環境変数で設定
- [ ] HTTPS設定（本番環境）
- [ ] セキュリティヘッダーが有効
- [ ] エラーメッセージが一般的（詳細を漏らさない）
- [ ] 管理者エンドポイントに認証必須
- [ ] パスワードがbcryptでハッシュ化
- [ ] データベースクエリがパラメータ化

## 📞 セキュリティ問題の報告

セキュリティ上の問題を発見した場合は、直ちに管理者に報告してください。

---

**最終更新:** 2025年10月23日
