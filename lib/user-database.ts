/**
 * ユーザーデータベース（インメモリ実装）
 * 実際の本番環境ではPostgreSQLに置き換え
 */

import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  chips: number;
  diamonds: number;
  energy: number;
  points: number;
  level: number;
  experience: number;
  avatar?: string;
  vipLevel: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  vipExpiresAt?: Date;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  status: 'active' | 'banned' | 'suspended';
  isAdmin: boolean;
  country: string;
  lastLoginAt: Date;
  lastIp: string;
  createdAt: Date;
  updatedAt: Date;
  
  // 統計
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalEarnings: number;
  totalRakePaid: number;
  biggestWin: number;
  winStreak: number;
  currentStreak: number;
}

// グローバルユーザーデータベース（インメモリ）
class UserDatabase {
  private users: Map<string, User> = new Map();
  
  constructor() {
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    const defaultUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        email: 'test@example.com',
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        chips: 15000,
        diamonds: 25,
        energy: 80,
        points: 500,
        level: 5,
        experience: 2500,
        vipLevel: 'silver',
        kycStatus: 'verified',
        status: 'active',
        isAdmin: false,
        country: 'JP',
        lastLoginAt: new Date('2025-01-15T14:30:00'),
        lastIp: '192.168.1.1',
        totalGamesPlayed: 145,
        totalWins: 85,
        totalLosses: 60,
        totalEarnings: 12543.50,
        totalRakePaid: 543.20,
        biggestWin: 2500,
        winStreak: 5,
        currentStreak: 3
      },
      {
        email: 'info@sinjapan.jp',
        username: 'admin',
        password: await bcrypt.hash('Kazuya8008', 10),
        chips: 100000,
        diamonds: 100,
        energy: 100,
        points: 10000,
        level: 100,
        experience: 999999,
        vipLevel: 'diamond',
        kycStatus: 'verified',
        status: 'active',
        isAdmin: true,
        country: 'JP',
        lastLoginAt: new Date(),
        lastIp: '127.0.0.1',
        totalGamesPlayed: 0,
        totalWins: 0,
        totalLosses: 0,
        totalEarnings: 0,
        totalRakePaid: 0,
        biggestWin: 0,
        winStreak: 0,
        currentStreak: 0
      },
      {
        email: 'player1@example.com',
        username: 'HighRoller',
        password: await bcrypt.hash('password123', 10),
        chips: 50000,
        diamonds: 50,
        energy: 100,
        points: 2000,
        level: 15,
        experience: 15000,
        vipLevel: 'gold',
        kycStatus: 'verified',
        status: 'active',
        isAdmin: false,
        country: 'US',
        lastLoginAt: new Date('2025-01-15T13:00:00'),
        lastIp: '10.0.0.1',
        totalGamesPlayed: 456,
        totalWins: 278,
        totalLosses: 178,
        totalEarnings: 45678.90,
        totalRakePaid: 5234.10,
        biggestWin: 8500,
        winStreak: 12,
        currentStreak: 0
      },
      {
        email: 'player2@example.com',
        username: 'ProPlayer',
        password: await bcrypt.hash('password123', 10),
        chips: 35000,
        diamonds: 40,
        energy: 90,
        points: 1500,
        level: 12,
        experience: 12000,
        vipLevel: 'gold',
        kycStatus: 'pending',
        status: 'active',
        isAdmin: false,
        country: 'KR',
        lastLoginAt: new Date('2025-01-15T11:00:00'),
        lastIp: '10.0.0.2',
        totalGamesPlayed: 389,
        totalWins: 215,
        totalLosses: 174,
        totalEarnings: 34567.80,
        totalRakePaid: 4567.30,
        biggestWin: 6200,
        winStreak: 8,
        currentStreak: 2
      }
    ];

    for (const userData of defaultUsers) {
      const user: User = {
        ...userData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.set(user.id, user);
    }
  }

  // ユーザー取得
  getUser(id: string): User | null {
    return this.users.get(id) || null;
  }

  // メールでユーザー検索
  getUserByEmail(email: string): User | null {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  // 全ユーザー取得
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // アクティブユーザー取得
  getActiveUsers(): User[] {
    return this.getAllUsers().filter(u => u.status === 'active');
  }

  // ユーザー作成
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const user: User = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(user.id, user);
    return user;
  }

  // ユーザー更新
  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // チップ追加
  addChips(userId: string, amount: number, reason: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.chips += amount;
    user.updatedAt = new Date();
    
    console.log(`[CHIPS] ${user.username}: +${amount} (${reason})`);
    return true;
  }

  // チップ減算
  deductChips(userId: string, amount: number, reason: string): boolean {
    const user = this.users.get(userId);
    if (!user || user.chips < amount) return false;

    user.chips -= amount;
    user.updatedAt = new Date();
    
    console.log(`[CHIPS] ${user.username}: -${amount} (${reason})`);
    return true;
  }

  // 統計更新
  updateGameStats(userId: string, result: 'win' | 'loss', earnings: number): void {
    const user = this.users.get(userId);
    if (!user) return;

    user.totalGamesPlayed++;
    
    if (result === 'win') {
      user.totalWins++;
      user.currentStreak++;
      user.winStreak = Math.max(user.winStreak, user.currentStreak);
    } else {
      user.totalLosses++;
      user.currentStreak = 0;
    }

    user.totalEarnings += earnings;
    if (earnings > user.biggestWin) {
      user.biggestWin = earnings;
    }

    user.updatedAt = new Date();
  }

  // レーキ記録
  recordRake(userId: string, rakeAmount: number): void {
    const user = this.users.get(userId);
    if (!user) return;

    user.totalRakePaid += rakeAmount;
    user.updatedAt = new Date();
  }

  // 統計取得
  getStatistics() {
    const allUsers = this.getAllUsers();
    const activeUsers = this.getActiveUsers();

    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      bannedUsers: allUsers.filter(u => u.status === 'banned').length,
      totalChips: allUsers.reduce((sum, u) => sum + u.chips, 0),
      totalGamesPlayed: allUsers.reduce((sum, u) => sum + u.totalGamesPlayed, 0),
      totalRakePaid: allUsers.reduce((sum, u) => sum + u.totalRakePaid, 0),
      averageLevel: allUsers.reduce((sum, u) => sum + u.level, 0) / allUsers.length,
      kycVerified: allUsers.filter(u => u.kycStatus === 'verified').length,
      kycPending: allUsers.filter(u => u.kycStatus === 'pending').length
    };
  }

  // トップレーキプレイヤー
  getTopRakePlayers(limit: number = 10): User[] {
    return Array.from(this.users.values())
      .sort((a, b) => b.totalRakePaid - a.totalRakePaid)
      .slice(0, limit);
  }

  // トップ収益プレイヤー
  getTopEarners(limit: number = 10): User[] {
    return Array.from(this.users.values())
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, limit);
  }
}

// グローバルインスタンス
export const userDatabase = new UserDatabase();

// ユーザー認証
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = userDatabase.getUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // 最終ログイン更新
  userDatabase.updateUser(user.id, {
    lastLoginAt: new Date()
  });

  return user;
}
