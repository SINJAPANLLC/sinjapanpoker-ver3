/**
 * コンプライアンスシステム
 * SIN JAPAN LIBERIA CO.,INC
 * AML/CFT対策、IP制限、ログ管理
 */

// 違法国リスト（プレイ禁止国）
export const RESTRICTED_COUNTRIES = [
  'US', // アメリカ合衆国
  'GB', // イギリス
  'AU', // オーストラリア
  'FR', // フランス
  'ES', // スペイン
  'IT', // イタリア
  'NL', // オランダ
  'BE', // ベルギー
  'DK', // デンマーク
  'SE', // スウェーデン
  'PL', // ポーランド
  'TR', // トルコ
  'IL', // イスラエル
  'SG', // シンガポール（ライセンス国遮断）
  'MY', // マレーシア（ライセンス国遮断）
  'CN', // 中国
  'KR', // 韓国
  'KP', // 北朝鮮
  'IR', // イラン
  'SY', // シリア
  'CU', // キューバ
  'SD', // スーダン
];

// AML対策 - 高リスク国
export const HIGH_RISK_COUNTRIES = [
  'AF', // アフガニスタン
  'KP', // 北朝鮮
  'IR', // イラン
  'IQ', // イラク
  'LY', // リビア
  'ML', // マリ
  'SO', // ソマリア
  'SS', // 南スーダン
  'SD', // スーダン
  'SY', // シリア
  'YE', // イエメン
  'VE', // ベネズエラ
  'MM', // ミャンマー
];

// CFT対策 - テロ資金供与監視国
export const TERRORIST_FINANCE_RISK_COUNTRIES = [
  'AF', 'PK', 'IQ', 'SY', 'YE', 'SO', 'LY'
];

// IP制限チェック
export async function checkIPRestriction(ip: string): Promise<{
  allowed: boolean;
  country: string | null;
  reason?: string;
}> {
  try {
    // IPアドレスから国を取得（実際の実装ではIP Geolocation APIを使用）
    const country = await getCountryFromIP(ip);
    
    if (!country) {
      return { allowed: false, country: null, reason: 'IP解析失敗' };
    }

    // 制限国チェック
    if (RESTRICTED_COUNTRIES.includes(country)) {
      return {
        allowed: false,
        country,
        reason: 'この国からのアクセスは制限されています'
      };
    }

    // 高リスク国の場合は追加検証が必要
    if (HIGH_RISK_COUNTRIES.includes(country)) {
      return {
        allowed: true,
        country,
        reason: '追加のKYC認証が必要です'
      };
    }

    return { allowed: true, country };
  } catch (error) {
    console.error('IP制限チェックエラー:', error);
    return { allowed: false, country: null, reason: 'システムエラー' };
  }
}

// IP Geolocation（モック実装）
async function getCountryFromIP(ip: string): Promise<string | null> {
  // 実際の実装では以下のようなAPIを使用:
  // - ipapi.co
  // - ip-api.com
  // - maxmind GeoIP2
  
  // 開発用: ローカルIPの場合は日本として扱う
  if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.')) {
    return 'JP';
  }

  // 実際の実装例:
  // const response = await fetch(`https://ipapi.co/${ip}/country/`);
  // return await response.text();
  
  return 'JP'; // デフォルト（実装時に変更）
}

// AML/CFT スクリーニング
export interface AMLScreeningResult {
  passed: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  requiresEnhancedDueDiligence: boolean;
}

export async function performAMLScreening(userData: {
  userId: string;
  email: string;
  country: string;
  transactionAmount?: number;
}): Promise<AMLScreeningResult> {
  const flags: string[] = [];
  let riskLevel: AMLScreeningResult['riskLevel'] = 'low';
  let requiresEnhancedDueDiligence = false;

  // 高リスク国チェック
  if (HIGH_RISK_COUNTRIES.includes(userData.country)) {
    flags.push('高リスク国からのアクセス');
    riskLevel = 'high';
    requiresEnhancedDueDiligence = true;
  }

  // CFTリスク国チェック
  if (TERRORIST_FINANCE_RISK_COUNTRIES.includes(userData.country)) {
    flags.push('テロ資金供与リスク国');
    riskLevel = 'critical';
    requiresEnhancedDueDiligence = true;
  }

  // 大額取引チェック（10,000ドル相当以上）
  if (userData.transactionAmount && userData.transactionAmount >= 10000) {
    flags.push('大額取引（$10,000以上）');
    riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
    requiresEnhancedDueDiligence = true;
  }

  // リスクレベルによる判定
  const passed = riskLevel !== 'critical';

  return {
    passed,
    riskLevel,
    flags,
    requiresEnhancedDueDiligence
  };
}

// ログ保存（法的要件）
export interface ComplianceLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  ip: string;
  country: string;
  userAgent: string;
  details: any;
  riskLevel?: string;
}

export class ComplianceLogger {
  private logs: ComplianceLog[] = [];

  // ログ追加
  log(logData: Omit<ComplianceLog, 'id' | 'timestamp'>): void {
    const log: ComplianceLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      ...logData
    };

    this.logs.push(log);

    // 実際の実装では永続ストレージに保存
    // - データベース（PostgreSQL, MongoDB等）
    // - ログ管理システム（ELK Stack, Splunk等）
    // - クラウドストレージ（S3等）
    
    console.log('[COMPLIANCE LOG]', log);

    // 法的要件: 最低5年間のログ保存
    this.saveToStorage(log);
  }

  // ストレージ保存（実装例）
  private saveToStorage(log: ComplianceLog): void {
    // 実際の実装:
    // await db.complianceLogs.create(log);
    // または
    // await s3.putObject({ Bucket: 'compliance-logs', Key: log.id, Body: JSON.stringify(log) });
  }

  // ログ取得
  getLogs(filters?: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: string;
  }): ComplianceLog[] {
    let filteredLogs = [...this.logs];

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters?.riskLevel) {
      filteredLogs = filteredLogs.filter(log => log.riskLevel === filters.riskLevel);
    }

    return filteredLogs;
  }

  // ログエクスポート（規制当局への報告用）
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    // CSV形式
    const headers = ['ID', 'Timestamp', 'UserID', 'Action', 'IP', 'Country', 'Risk Level'];
    const rows = this.logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.userId,
      log.action,
      log.ip,
      log.country,
      log.riskLevel || 'N/A'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

// グローバルインスタンス
export const complianceLogger = new ComplianceLogger();

// DNS & WAF設定（設定例）
export const SECURITY_CONFIG = {
  dns: {
    provider: 'Cloudflare', // または AWS Route 53
    ddosProtection: true,
    rateLimiting: true,
    geoBlocking: RESTRICTED_COUNTRIES
  },
  waf: {
    enabled: true,
    rules: [
      'SQL Injection防御',
      'XSS防御',
      'CSRF防御',
      'DDoS防御',
      'Bot防御'
    ],
    ipWhitelist: [], // 管理者IP等
    ipBlacklist: [] // 不正アクセスIP
  }
};

// eKYC必須判定
export function requiresKYC(userData: {
  country: string;
  totalDeposits: number;
  accountAge: number; // 日数
}): boolean {
  // 高リスク国は即座にKYC必要
  if (HIGH_RISK_COUNTRIES.includes(userData.country)) {
    return true;
  }

  // 累計入金額が$2,000以上
  if (userData.totalDeposits >= 2000) {
    return true;
  }

  // アカウント作成後30日以上経過している場合
  if (userData.accountAge >= 30) {
    return true;
  }

  return false;
}

// 出金制限チェック
export function checkWithdrawalCompliance(userData: {
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  withdrawalAmount: number;
  totalWithdrawals: number;
  country: string;
}): {
  allowed: boolean;
  reason?: string;
  maxAmount?: number;
} {
  // KYC未完了の場合
  if (userData.kycStatus !== 'verified') {
    // 小額出金は許可（$500まで）
    if (userData.withdrawalAmount <= 500 && userData.totalWithdrawals < 1000) {
      return { allowed: true, maxAmount: 500 };
    }

    return {
      allowed: false,
      reason: 'KYC認証が必要です。$500以上の出金にはKYC認証が必須です。'
    };
  }

  // 高リスク国の場合は追加制限
  if (HIGH_RISK_COUNTRIES.includes(userData.country)) {
    if (userData.withdrawalAmount > 5000) {
      return {
        allowed: false,
        reason: '高リスク国からの出金は$5,000が上限です。'
      };
    }
  }

  return { allowed: true };
}
