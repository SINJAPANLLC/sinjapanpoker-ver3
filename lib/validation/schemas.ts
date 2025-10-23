import { z } from 'zod';

// ========================================
// ユーザー認証スキーマ
// ========================================

export const loginSchema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .max(100, 'パスワードは100文字以下である必要があります'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上である必要があります')
    .max(20, 'ユーザー名は20文字以下である必要があります')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます'),
  email: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .max(100, 'パスワードは100文字以下である必要があります')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字、小文字、数字を含む必要があります'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .max(100, 'パスワードは100文字以下である必要があります')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字、小文字、数字を含む必要があります'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

// ========================================
// 決済スキーマ
// ========================================

export const stripeCheckoutSchema = z.object({
  chips: z
    .number()
    .int('チップ数は整数である必要があります')
    .min(50, '最小購入額は50チップです')
    .max(1000000, '最大購入額は1,000,000チップです'),
  price: z
    .number()
    .int('価格は整数である必要があります')
    .min(50, '最小金額は50円です')
    .max(1000000, '最大金額は1,000,000円です'),
  userId: z.string().min(1, 'ユーザーIDが必要です'),
});

export const cryptoInvoiceSchema = z.object({
  chipAmount: z
    .number()
    .int('チップ数は整数である必要があります')
    .min(50, '最小購入額は50チップです')
    .max(1000000, '最大購入額は1,000,000チップです'),
  currency: z.enum(['BTC', 'ETH', 'USDT', 'USDC', 'LTC']),
});

export const addChipsSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDが必要です'),
  chips: z
    .number()
    .int('チップ数は整数である必要があります')
    .positive('チップ数は正の数である必要があります')
    .max(10000000, '一度に付与できる最大チップ数は10,000,000です'),
});

// ========================================
// ゲーム関連スキーマ
// ========================================

export const createGameSchema = z.object({
  type: z.enum(['texas-holdem', 'omaha', 'ofc']),
  blinds: z.object({
    small: z.number().int().positive('スモールブラインドは正の数である必要があります'),
    big: z.number().int().positive('ビッグブラインドは正の数である必要があります'),
  }),
  maxPlayers: z
    .number()
    .int()
    .min(2, '最小プレイヤー数は2人です')
    .max(9, '最大プレイヤー数は9人です'),
});

export const playerActionSchema = z.object({
  action: z.enum(['fold', 'check', 'call', 'raise', 'all-in']),
  amount: z
    .number()
    .int()
    .nonnegative('ベット額は0以上である必要があります')
    .optional(),
});

// ========================================
// トーナメントスキーマ
// ========================================

export const createTournamentSchema = z.object({
  name: z
    .string()
    .min(3, 'トーナメント名は3文字以上である必要があります')
    .max(100, 'トーナメント名は100文字以下である必要があります'),
  description: z.string().max(500, '説明は500文字以下である必要があります').optional(),
  type: z.enum(['sit-n-go', 'scheduled', 'bounty']),
  buyIn: z
    .number()
    .int()
    .min(0, 'バイインは0以上である必要があります')
    .max(100000, 'バイインは100,000以下である必要があります'),
  maxPlayers: z
    .number()
    .int()
    .min(2, '最小プレイヤー数は2人です')
    .max(1000, '最大プレイヤー数は1,000人です'),
  startTime: z.string().datetime('有効な日時形式である必要があります').optional(),
});

// ========================================
// 管理者スキーマ
// ========================================

export const adminLoginSchema = z.object({
  email: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .min(1, 'メールアドレスは必須です'),
  password: z.string().min(1, 'パスワードは必須です'),
});

export const grantCurrencySchema = z.object({
  userId: z.string().min(1, 'ユーザーIDが必要です'),
  amount: z
    .number()
    .int('チップ数は整数である必要があります')
    .min(-1000000, '最小値は-1,000,000です')
    .max(10000000, '最大値は10,000,000です')
    .refine((val) => val !== 0, {
      message: 'チップ数は0以外である必要があります',
    }),
  reason: z
    .string()
    .min(1, '理由を入力してください')
    .max(200, '理由は200文字以下である必要があります'),
});

// ========================================
// チャットスキーマ
// ========================================

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'メッセージを入力してください')
    .max(500, 'メッセージは500文字以下である必要があります')
    .refine((val) => {
      // XSS対策：HTMLタグを含まないことをチェック
      const hasHtmlTags = /<[^>]*>/g.test(val);
      return !hasHtmlTags;
    }, {
      message: 'メッセージにHTMLタグを含めることはできません',
    }),
});

// ========================================
// ヘルパー関数
// ========================================

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: any };

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError.message,
        details: error.issues,
      };
    }
    return {
      success: false,
      error: 'バリデーションエラーが発生しました',
    };
  }
}

// ========================================
// 型エクスポート
// ========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type StripeCheckoutInput = z.infer<typeof stripeCheckoutSchema>;
export type CryptoInvoiceInput = z.infer<typeof cryptoInvoiceSchema>;
export type AddChipsInput = z.infer<typeof addChipsSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type PlayerActionInput = z.infer<typeof playerActionSchema>;
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type GrantCurrencyInput = z.infer<typeof grantCurrencySchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
