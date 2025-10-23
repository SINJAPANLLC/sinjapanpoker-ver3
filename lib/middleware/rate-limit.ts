import rateLimit from 'express-rate-limit';

// 一般的なAPIエンドポイント用のレート制限
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分あたり100リクエスト
  message: 'リクエストが多すぎます。しばらくしてから再試行してください。',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'リクエストが多すぎます。しばらくしてから再試行してください。',
      retryAfter: Math.ceil(15 * 60), // 15分（秒単位）
    });
  },
});

// 認証エンドポイント用の厳格なレート制限
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 15分あたり5回の試行
  message: 'ログイン試行回数が多すぎます。15分後に再試行してください。',
  skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Login Attempts',
      message: 'ログイン試行回数が多すぎます。15分後に再試行してください。',
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

// 決済エンドポイント用の制限
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 10, // 1時間あたり10回
  message: '決済リクエストが多すぎます。しばらくしてから再試行してください。',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Payment Requests',
      message: '決済リクエストが多すぎます。1時間後に再試行してください。',
      retryAfter: Math.ceil(60 * 60),
    });
  },
});

// 管理者API用のレート制限
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 200, // 15分あたり200リクエスト（管理者は多めに許可）
  message: '管理者APIリクエストが多すぎます。しばらくしてから再試行してください。',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Admin Requests',
      message: '管理者APIリクエストが多すぎます。しばらくしてから再試行してください。',
      retryAfter: Math.ceil(15 * 60),
    });
  },
});

// Socket.io接続用のレート制限（IP単位）
export const socketLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 30, // 1分あたり30接続
  message: '接続試行が多すぎます。しばらくしてから再試行してください。',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too Many Connection Attempts',
      message: '接続試行が多すぎます。1分後に再試行してください。',
      retryAfter: 60,
    });
  },
});
