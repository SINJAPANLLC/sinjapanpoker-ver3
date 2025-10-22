/**
 * VIP特典システム
 * VIP Benefits System
 */

export interface VIPTier {
  id: string;
  name: string;
  level: number;
  color: string;
  cardImage: string;
  price: number; // ダイヤモンド
  duration: number; // 日数
}

export interface VIPBenefit {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'premium';
}

export interface VIPBenefits {
  allInWinRate: boolean;
  rabbitHunt: boolean;
  additionalLoginRewards: boolean;
  playData: boolean;
  simpleHUD: boolean;
  currentClubData: boolean;
  networkDisconnectionProtection: boolean;
  exclusiveStamps: number;
  clubEstablishment: number;
  freeBasicStamps: number;
  freeTimeBank: number;
}

export const VIP_TIERS: VIPTier[] = [
  {
    id: 'silver',
    name: 'シルバー',
    level: 1,
    color: '#C0C0C0',
    cardImage: '/vip-cards/silver.png',
    price: 1000,
    duration: 30
  },
  {
    id: 'black',
    name: 'ブラック',
    level: 2,
    color: '#2D2D2D',
    cardImage: '/vip-cards/black.png',
    price: 3000,
    duration: 30
  },
  {
    id: 'platinum',
    name: 'プラチナ',
    level: 3,
    color: '#8B5CF6',
    cardImage: '/vip-cards/platinum.png',
    price: 5000,
    duration: 30
  }
];

export const VIP_BENEFITS: Record<string, VIPBenefits> = {
  silver: {
    allInWinRate: true,
    rabbitHunt: true,
    additionalLoginRewards: true,
    playData: false,
    simpleHUD: false,
    currentClubData: false,
    networkDisconnectionProtection: false,
    exclusiveStamps: 3,
    clubEstablishment: 1,
    freeBasicStamps: 200,
    freeTimeBank: 15
  },
  black: {
    allInWinRate: true,
    rabbitHunt: true,
    additionalLoginRewards: true,
    playData: true,
    simpleHUD: true,
    currentClubData: false,
    networkDisconnectionProtection: false,
    exclusiveStamps: 3,
    clubEstablishment: 3,
    freeBasicStamps: 800,
    freeTimeBank: 80
  },
  platinum: {
    allInWinRate: true,
    rabbitHunt: true,
    additionalLoginRewards: true,
    playData: true,
    simpleHUD: true,
    currentClubData: true,
    networkDisconnectionProtection: true,
    exclusiveStamps: 3,
    clubEstablishment: 3,
    freeBasicStamps: 1200,
    freeTimeBank: 120
  }
};

export const BENEFIT_DESCRIPTIONS: Record<string, string> = {
  allInWinRate: 'オールイン勝率統計の表示',
  rabbitHunt: 'ラビットハント機能の利用',
  additionalLoginRewards: '追加ログインボーナス',
  playData: '詳細プレイデータの確認',
  simpleHUD: '簡易HUDの表示',
  currentClubData: '現在のクラブデータ表示',
  networkDisconnectionProtection: 'ネット切断保護機能',
  exclusiveStamps: '専用スタンプの利用',
  clubEstablishment: 'クラブ設立権限',
  freeBasicStamps: '無料基本スタンプ回数',
  freeTimeBank: '無料タイムバンク回数'
};

export interface UserVIP {
  userId: string;
  tier: string;
  purchasedAt: Date;
  expiresAt: Date;
  benefits: VIPBenefits;
  isActive: boolean;
}

export class VIPManager {
  private userVIPs: Map<string, UserVIP> = new Map();

  // VIP購入
  purchaseVIP(userId: string, tierId: string): UserVIP {
    const tier = VIP_TIERS.find(t => t.id === tierId);
    if (!tier) {
      throw new Error(`Invalid VIP tier: ${tierId}`);
    }

    const benefits = VIP_BENEFITS[tierId];
    if (!benefits) {
      throw new Error(`Benefits not found for tier: ${tierId}`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + tier.duration * 24 * 60 * 60 * 1000);

    const userVIP: UserVIP = {
      userId,
      tier: tierId,
      purchasedAt: now,
      expiresAt,
      benefits,
      isActive: true
    };

    this.userVIPs.set(userId, userVIP);
    return userVIP;
  }

  // ユーザーのVIP取得
  getUserVIP(userId: string): UserVIP | null {
    const userVIP = this.userVIPs.get(userId);
    if (!userVIP) return null;

    // 期限切れチェック
    if (new Date() > userVIP.expiresAt) {
      userVIP.isActive = false;
      this.userVIPs.set(userId, userVIP);
      return userVIP;
    }

    return userVIP;
  }

  // VIP特典チェック
  hasBenefit(userId: string, benefit: keyof VIPBenefits): boolean {
    const userVIP = this.getUserVIP(userId);
    if (!userVIP || !userVIP.isActive) return false;

    return userVIP.benefits[benefit] === true;
  }

  // 数値特典取得
  getBenefitValue(userId: string, benefit: keyof VIPBenefits): number {
    const userVIP = this.getUserVIP(userId);
    if (!userVIP || !userVIP.isActive) return 0;

    const value = userVIP.benefits[benefit];
    return typeof value === 'number' ? value : 0;
  }

  // 全ユーザーのVIP一覧
  getAllVIPUsers(): UserVIP[] {
    return Array.from(this.userVIPs.values());
  }

  // アクティブなVIPユーザー数
  getActiveVIPCount(): number {
    return Array.from(this.userVIPs.values()).filter(vip => vip.isActive).length;
  }

  // VIP別ユーザー数
  getVIPCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    VIP_TIERS.forEach(tier => {
      counts[tier.id] = 0;
    });

    Array.from(this.userVIPs.values())
      .filter(vip => vip.isActive)
      .forEach(vip => {
        counts[vip.tier]++;
      });

    return counts;
  }

  // VIP更新（管理者用）
  extendVIP(userId: string, days: number): boolean {
    const userVIP = this.getUserVIP(userId);
    if (!userVIP) return false;

    const newExpiresAt = new Date(userVIP.expiresAt.getTime() + days * 24 * 60 * 60 * 1000);
    userVIP.expiresAt = newExpiresAt;
    userVIP.isActive = true;

    this.userVIPs.set(userId, userVIP);
    return true;
  }

  // VIP取消（管理者用）
  revokeVIP(userId: string): boolean {
    const userVIP = this.getUserVIP(userId);
    if (!userVIP) return false;

    userVIP.isActive = false;
    this.userVIPs.set(userId, userVIP);
    return true;
  }

  // 期限切れVIPのクリーンアップ
  cleanupExpiredVIPs(): number {
    let cleaned = 0;
    
    this.userVIPs.forEach((userVIP, userId) => {
      if (new Date() > userVIP.expiresAt && userVIP.isActive) {
        userVIP.isActive = false;
        this.userVIPs.set(userId, userVIP);
        cleaned++;
      }
    });

    return cleaned;
  }
}

// グローバルインスタンス
export const vipManager = new VIPManager();

// モックVIPユーザー初期化
export function initializeMockVIPs() {
  // 管理者をプラチナVIPに設定
  vipManager.purchaseVIP('2', 'platinum');
  
  // 他のテストユーザー
  vipManager.purchaseVIP('3', 'black');
  vipManager.purchaseVIP('4', 'silver');

  console.log('[VIP] Initialized mock VIP users');
}

// 初期化
initializeMockVIPs();
