/**
 * リアルマネー/ゲームマネー切り替えシステム
 * Real Money / Play Money Mode
 */

export type MoneyMode = 'real' | 'play';

export interface WalletBalance {
  real: {
    balance: number;
    currency: 'USD' | 'BTC' | 'ETH' | 'USDT';
    locked: number; // ゲーム中でロックされている金額
    available: number; // 利用可能金額
  };
  play: {
    balance: number;
    locked: number;
    available: number;
  };
}

export interface MoneyModeState {
  currentMode: MoneyMode;
  wallet: WalletBalance;
  canSwitchMode: boolean;
  switchRestriction?: string;
}

// ウォレット管理クラス
export class WalletManager {
  private wallets: Map<string, WalletBalance> = new Map();

  // ウォレット初期化
  initializeWallet(userId: string): WalletBalance {
    const wallet: WalletBalance = {
      real: {
        balance: 0,
        currency: 'USD',
        locked: 0,
        available: 0
      },
      play: {
        balance: 10000, // 初期プレイマネー
        locked: 0,
        available: 10000
      }
    };

    this.wallets.set(userId, wallet);
    return wallet;
  }

  // ウォレット取得
  getWallet(userId: string): WalletBalance | null {
    return this.wallets.get(userId) || null;
  }

  // 残高更新
  updateBalance(
    userId: string,
    mode: MoneyMode,
    amount: number,
    type: 'deposit' | 'withdraw' | 'lock' | 'unlock'
  ): boolean {
    const wallet = this.getWallet(userId);
    if (!wallet) return false;

    const account = wallet[mode];

    switch (type) {
      case 'deposit':
        account.balance += amount;
        account.available += amount;
        break;
      
      case 'withdraw':
        if (account.available < amount) return false;
        account.balance -= amount;
        account.available -= amount;
        break;
      
      case 'lock':
        if (account.available < amount) return false;
        account.locked += amount;
        account.available -= amount;
        break;
      
      case 'unlock':
        account.locked -= amount;
        account.available += amount;
        break;
    }

    return true;
  }
}

// モード切り替えマネージャー
export class MoneyModeManager {
  private userModes: Map<string, MoneyMode> = new Map();
  private walletManager: WalletManager;

  constructor(walletManager: WalletManager) {
    this.walletManager = walletManager;
  }

  // 現在のモード取得
  getCurrentMode(userId: string): MoneyMode {
    return this.userModes.get(userId) || 'play';
  }

  // モード切り替え
  switchMode(userId: string, newMode: MoneyMode): {
    success: boolean;
    mode?: MoneyMode;
    error?: string;
  } {
    const currentMode = this.getCurrentMode(userId);
    
    // 既に同じモードの場合
    if (currentMode === newMode) {
      return { success: true, mode: newMode };
    }

    // 切り替え可能かチェック
    const canSwitch = this.canSwitchMode(userId);
    if (!canSwitch.allowed) {
      return { success: false, error: canSwitch.reason };
    }

    // モード切り替え
    this.userModes.set(userId, newMode);

    // ログ記録
    console.log(`[MODE SWITCH] User ${userId}: ${currentMode} -> ${newMode}`);

    return { success: true, mode: newMode };
  }

  // 切り替え可能かチェック
  canSwitchMode(userId: string): { allowed: boolean; reason?: string } {
    const wallet = this.walletManager.getWallet(userId);
    
    if (!wallet) {
      return { allowed: false, reason: 'ウォレットが見つかりません' };
    }

    // リアルマネーがロックされている場合は切り替え不可
    if (wallet.real.locked > 0) {
      return {
        allowed: false,
        reason: 'ゲーム中のため切り替えできません。ゲームを終了してください。'
      };
    }

    // プレイマネーがロックされている場合も切り替え不可
    if (wallet.play.locked > 0) {
      return {
        allowed: false,
        reason: 'ゲーム中のため切り替えできません。ゲームを終了してください。'
      };
    }

    return { allowed: true };
  }

  // 状態取得
  getState(userId: string): MoneyModeState {
    const currentMode = this.getCurrentMode(userId);
    const wallet = this.walletManager.getWallet(userId);
    const canSwitch = this.canSwitchMode(userId);

    return {
      currentMode,
      wallet: wallet || {
        real: { balance: 0, currency: 'USD', locked: 0, available: 0 },
        play: { balance: 0, locked: 0, available: 0 }
      },
      canSwitchMode: canSwitch.allowed,
      switchRestriction: canSwitch.reason
    };
  }
}

// ゲームテーブル管理
export interface GameTable {
  id: string;
  name: string;
  moneyMode: MoneyMode;
  stakes: {
    smallBlind: number;
    bigBlind: number;
  };
  minBuyIn: number;
  maxBuyIn: number;
  players: number;
  maxPlayers: number;
}

export function filterTablesByMode(tables: GameTable[], mode: MoneyMode): GameTable[] {
  return tables.filter(table => table.moneyMode === mode);
}

// ゲーム参加時のバリデーション
export function validateGameEntry(
  userId: string,
  table: GameTable,
  buyInAmount: number,
  walletManager: WalletManager,
  modeManager: MoneyModeManager
): {
  allowed: boolean;
  error?: string;
} {
  // モードチェック
  const userMode = modeManager.getCurrentMode(userId);
  if (userMode !== table.moneyMode) {
    return {
      allowed: false,
      error: `このテーブルは${table.moneyMode === 'real' ? 'リアルマネー' : 'プレイマネー'}専用です`
    };
  }

  // 残高チェック
  const wallet = walletManager.getWallet(userId);
  if (!wallet) {
    return { allowed: false, error: 'ウォレットが見つかりません' };
  }

  const account = wallet[table.moneyMode];
  if (account.available < buyInAmount) {
    return {
      allowed: false,
      error: '残高が不足しています'
    };
  }

  // バイイン額チェック
  if (buyInAmount < table.minBuyIn || buyInAmount > table.maxBuyIn) {
    return {
      allowed: false,
      error: `バイイン額は${table.minBuyIn}から${table.maxBuyIn}の範囲で指定してください`
    };
  }

  // リアルマネーの場合は追加チェック
  if (table.moneyMode === 'real') {
    // KYC認証チェック（実装例）
    // const kycStatus = await checkKYCStatus(userId);
    // if (kycStatus !== 'verified') {
    //   return { allowed: false, error: 'KYC認証が必要です' };
    // }
  }

  return { allowed: true };
}

// 日次ボーナス（プレイマネー専用）
export function getDailyBonus(userId: string, walletManager: WalletManager): {
  granted: boolean;
  amount: number;
  nextBonusIn?: number; // 秒数
} {
  const DAILY_BONUS_AMOUNT = 5000;
  const BONUS_INTERVAL = 24 * 60 * 60 * 1000; // 24時間

  // 最後のボーナス取得時刻をチェック（実装時）
  // const lastBonus = await getLastBonusTime(userId);
  // const now = Date.now();
  
  // if (now - lastBonus < BONUS_INTERVAL) {
  //   return {
  //     granted: false,
  //     amount: 0,
  //     nextBonusIn: Math.floor((BONUS_INTERVAL - (now - lastBonus)) / 1000)
  //   };
  // }

  // ボーナス付与
  walletManager.updateBalance(userId, 'play', DAILY_BONUS_AMOUNT, 'deposit');

  return {
    granted: true,
    amount: DAILY_BONUS_AMOUNT
  };
}

// グローバルインスタンス
export const walletManager = new WalletManager();
export const moneyModeManager = new MoneyModeManager(walletManager);

// 使用例
export function exampleUsage() {
  const userId = 'user123';

  // ウォレット初期化
  walletManager.initializeWallet(userId);

  // リアルマネーに切り替え
  const switchResult = moneyModeManager.switchMode(userId, 'real');
  console.log('モード切り替え:', switchResult);

  // 状態確認
  const state = moneyModeManager.getState(userId);
  console.log('現在の状態:', state);

  // デポジット（リアルマネー）
  walletManager.updateBalance(userId, 'real', 100, 'deposit');

  // テーブル参加バリデーション
  const table: GameTable = {
    id: 'table1',
    name: 'Real Money Table 1',
    moneyMode: 'real',
    stakes: { smallBlind: 0.5, bigBlind: 1 },
    minBuyIn: 20,
    maxBuyIn: 200,
    players: 3,
    maxPlayers: 6
  };

  const validation = validateGameEntry(userId, table, 50, walletManager, moneyModeManager);
  console.log('参加可否:', validation);
}
