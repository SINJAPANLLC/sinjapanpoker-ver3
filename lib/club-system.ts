/**
 * クラブシステム
 * Club Management & Revenue Tracking
 */

export interface Club {
  id: string;
  name: string;
  code: string; // クラブコード（招待用）
  ownerId: string;
  ownerUsername: string;
  description: string;
  avatar?: string;
  
  // メンバー
  members: ClubMember[];
  maxMembers: number;
  memberCount: number;
  
  // 収益設定
  rakePercentage: number; // クラブが受け取るレーキ率（0-50%）
  
  // 収益統計
  totalRevenue: number;
  totalGames: number;
  totalHands: number;
  totalRakeCollected: number;
  
  // 期間別収益
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  
  // テーブル
  activeTables: number;
  totalTables: number;
  
  // 設定
  isPrivate: boolean;
  requiresApproval: boolean;
  minLevel: number;
  
  // 時刻
  createdAt: Date;
  updatedAt: Date;
  
  // ステータス
  status: 'active' | 'suspended' | 'closed';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ClubMember {
  userId: string;
  username: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  
  // メンバー統計
  gamesPlayed: number;
  rakePaid: number; // このクラブで支払ったレーキ
  earnings: number;
  
  // ステータス
  status: 'active' | 'suspended';
  lastActiveAt: Date;
}

export interface ClubTable {
  id: string;
  clubId: string;
  name: string;
  type: 'cash' | 'tournament';
  stakes: string;
  
  // 収益
  totalHands: number;
  totalRakeCollected: number;
  clubRevenue: number; // クラブが受け取る収益
  ownerRevenue: number; // オーナーが受け取る収益
  
  // プレイヤー
  currentPlayers: number;
  maxPlayers: number;
  
  // 時刻
  createdAt: Date;
  lastHandAt: Date;
  status: 'active' | 'paused' | 'closed';
}

export interface ClubRevenue {
  clubId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'alltime';
  
  // 総収益
  totalRevenue: number;
  
  // 内訳
  rakeRevenue: number;
  tournamentRevenue: number;
  
  // テーブル別
  tableBreakdown: Array<{
    tableId: string;
    tableName: string;
    revenue: number;
    hands: number;
    avgRevenuePerHand: number;
  }>;
  
  // メンバー別
  memberBreakdown: Array<{
    userId: string;
    username: string;
    rakePaid: number;
    gamesPlayed: number;
    contribution: number; // 収益への貢献度（%）
  }>;
  
  // 時間帯別
  hourlyRevenue: Array<{
    hour: number;
    revenue: number;
    hands: number;
  }>;
}

export class ClubManager {
  private clubs: Map<string, Club> = new Map();
  private clubTables: Map<string, ClubTable> = new Map();

  // クラブ作成
  createClub(data: {
    name: string;
    ownerId: string;
    ownerUsername: string;
    description: string;
    rakePercentage: number;
    isPrivate: boolean;
    maxMembers: number;
  }): Club {
    const clubCode = this.generateClubCode();
    
    const club: Club = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: data.name,
      code: clubCode,
      ownerId: data.ownerId,
      ownerUsername: data.ownerUsername,
      description: data.description,
      members: [{
        userId: data.ownerId,
        username: data.ownerUsername,
        role: 'owner',
        joinedAt: new Date(),
        gamesPlayed: 0,
        rakePaid: 0,
        earnings: 0,
        status: 'active',
        lastActiveAt: new Date()
      }],
      maxMembers: data.maxMembers,
      memberCount: 1,
      rakePercentage: data.rakePercentage,
      totalRevenue: 0,
      totalGames: 0,
      totalHands: 0,
      totalRakeCollected: 0,
      dailyRevenue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      activeTables: 0,
      totalTables: 0,
      isPrivate: data.isPrivate,
      requiresApproval: data.isPrivate,
      minLevel: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      tier: 'bronze'
    };

    this.clubs.set(club.id, club);
    return club;
  }

  // クラブコード生成
  private generateClubCode(): string {
    return 'SJC' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // メンバー追加
  addMember(clubId: string, userId: string, username: string): boolean {
    const club = this.clubs.get(clubId);
    if (!club) return false;

    if (club.memberCount >= club.maxMembers) {
      return false;
    }

    club.members.push({
      userId,
      username,
      role: 'member',
      joinedAt: new Date(),
      gamesPlayed: 0,
      rakePaid: 0,
      earnings: 0,
      status: 'active',
      lastActiveAt: new Date()
    });

    club.memberCount++;
    club.updatedAt = new Date();

    return true;
  }

  // クラブテーブル作成
  createTable(clubId: string, tableName: string, type: 'cash' | 'tournament', stakes: string): ClubTable {
    const club = this.clubs.get(clubId);
    if (!club) {
      throw new Error(`Club ${clubId} not found`);
    }

    const table: ClubTable = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      clubId,
      name: tableName,
      type,
      stakes,
      totalHands: 0,
      totalRakeCollected: 0,
      clubRevenue: 0,
      ownerRevenue: 0,
      currentPlayers: 0,
      maxPlayers: 9,
      createdAt: new Date(),
      lastHandAt: new Date(),
      status: 'active'
    };

    this.clubTables.set(table.id, table);
    club.totalTables++;
    club.activeTables++;
    club.updatedAt = new Date();

    return table;
  }

  // ハンド完了時の収益記録
  recordHand(
    tableId: string,
    handId: string,
    potSize: number,
    rakeAmount: number,
    players: Array<{ userId: string; rakePaid: number }>
  ): void {
    const table = this.clubTables.get(tableId);
    if (!table) return;

    const club = this.clubs.get(table.clubId);
    if (!club) return;

    // テーブル統計更新
    table.totalHands++;
    table.totalRakeCollected += rakeAmount;
    table.lastHandAt = new Date();

    // クラブの収益配分
    const clubShare = rakeAmount * (club.rakePercentage / 100);
    const ownerShare = rakeAmount - clubShare;

    table.clubRevenue += clubShare;
    table.ownerRevenue += ownerShare;

    // クラブ統計更新
    club.totalHands++;
    club.totalRakeCollected += rakeAmount;
    club.totalRevenue += clubShare;
    club.dailyRevenue += clubShare;
    club.weeklyRevenue += clubShare;
    club.monthlyRevenue += clubShare;

    // メンバー統計更新
    players.forEach(player => {
      const member = club.members.find(m => m.userId === player.userId);
      if (member) {
        member.gamesPlayed++;
        member.rakePaid += player.rakePaid;
        member.lastActiveAt = new Date();
      }
    });

    club.updatedAt = new Date();

    console.log(`[CLUB REVENUE] ${club.name}: +$${clubShare.toFixed(2)} (Table: ${table.name})`);
  }

  // クラブ収益レポート取得
  getClubRevenue(clubId: string, period: 'daily' | 'weekly' | 'monthly' | 'alltime'): ClubRevenue | null {
    const club = this.clubs.get(clubId);
    if (!club) return null;

    // テーブル別内訳
    const clubTables = Array.from(this.clubTables.values()).filter(t => t.clubId === clubId);
    const tableBreakdown = clubTables.map(table => ({
      tableId: table.id,
      tableName: table.name,
      revenue: table.clubRevenue,
      hands: table.totalHands,
      avgRevenuePerHand: table.totalHands > 0 ? table.clubRevenue / table.totalHands : 0
    })).sort((a, b) => b.revenue - a.revenue);

    // メンバー別内訳
    const totalRakePaid = club.members.reduce((sum, m) => sum + m.rakePaid, 0);
    const memberBreakdown = club.members
      .map(member => ({
        userId: member.userId,
        username: member.username,
        rakePaid: member.rakePaid,
        gamesPlayed: member.gamesPlayed,
        contribution: totalRakePaid > 0 ? (member.rakePaid / totalRakePaid) * 100 : 0
      }))
      .sort((a, b) => b.rakePaid - a.rakePaid);

    // 時間帯別収益（モック）
    const hourlyRevenue = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      revenue: club.totalRevenue * (Math.random() * 0.1),
      hands: Math.floor(club.totalHands * (Math.random() * 0.1))
    }));

    const revenue: ClubRevenue = {
      clubId,
      period,
      totalRevenue: period === 'daily' ? club.dailyRevenue :
                   period === 'weekly' ? club.weeklyRevenue :
                   period === 'monthly' ? club.monthlyRevenue :
                   club.totalRevenue,
      rakeRevenue: club.totalRevenue,
      tournamentRevenue: 0,
      tableBreakdown,
      memberBreakdown,
      hourlyRevenue
    };

    return revenue;
  }

  // クラブ取得
  getClub(clubId: string): Club | null {
    return this.clubs.get(clubId) || null;
  }

  // 全クラブ取得
  getAllClubs(): Club[] {
    return Array.from(this.clubs.values());
  }

  // ユーザーのクラブ取得
  getUserClubs(userId: string): Club[] {
    return Array.from(this.clubs.values()).filter(club =>
      club.members.some(m => m.userId === userId)
    );
  }

  // トップ収益クラブ
  getTopRevenueClubs(limit: number = 10): Club[] {
    return Array.from(this.clubs.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  // クラブ検索
  searchClubs(query: string): Club[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.clubs.values()).filter(club =>
      club.name.toLowerCase().includes(lowerQuery) ||
      club.code.toLowerCase().includes(lowerQuery)
    );
  }

  // クラブティア判定
  updateClubTier(clubId: string): void {
    const club = this.clubs.get(clubId);
    if (!club) return;

    let tier: Club['tier'] = 'bronze';

    if (club.totalRevenue >= 100000) {
      tier = 'platinum';
    } else if (club.totalRevenue >= 50000) {
      tier = 'gold';
    } else if (club.totalRevenue >= 10000) {
      tier = 'silver';
    }

    if (club.tier !== tier) {
      club.tier = tier;
      club.updatedAt = new Date();
      console.log(`[CLUB TIER] ${club.name}: ${club.tier} → ${tier}`);
    }
  }
}

// グローバルインスタンス
export const clubManager = new ClubManager();

// モッククラブ初期化
export function initializeMockClubs() {
  // クラブ1: AA Club
  const club1 = clubManager.createClub({
    name: 'AA Club - エース倶楽部',
    ownerId: '2',
    ownerUsername: 'admin',
    description: '日本最大級のポーカークラブ。初心者から上級者まで歓迎！',
    rakePercentage: 20, // クラブが20%受け取る
    isPrivate: false,
    maxMembers: 100
  });

  // メンバー追加
  clubManager.addMember(club1.id, '3', 'HighRoller');
  clubManager.addMember(club1.id, '4', 'ProPlayer');

  // テーブル作成
  const table1 = clubManager.createTable(club1.id, 'NLH 低ステークス', 'cash', '$0.10/$0.20');
  const table2 = clubManager.createTable(club1.id, 'NLH 中ステークス', 'cash', '$0.50/$1.00');
  
  // ハンド記録（モック）
  for (let i = 0; i < 100; i++) {
    clubManager.recordHand(
      table1.id,
      `hand-${i}`,
      100 + Math.random() * 400,
      5 + Math.random() * 15,
      [
        { userId: '2', rakePaid: 2 },
        { userId: '3', rakePaid: 3 }
      ]
    );
  }

  for (let i = 0; i < 50; i++) {
    clubManager.recordHand(
      table2.id,
      `hand-mid-${i}`,
      500 + Math.random() * 1000,
      10 + Math.random() * 30,
      [
        { userId: '3', rakePaid: 15 },
        { userId: '4', rakePaid: 12 }
      ]
    );
  }

  // クラブ2: High Roller Club
  const club2 = clubManager.createClub({
    name: 'High Roller VIP',
    ownerId: '3',
    ownerUsername: 'HighRoller',
    description: 'ハイステークス専用の VIP クラブ。Lv.10以上限定。',
    rakePercentage: 30,
    isPrivate: true,
    maxMembers: 50
  });

  clubManager.addMember(club2.id, '4', 'ProPlayer');

  const table3 = clubManager.createTable(club2.id, 'High Stakes NLH', 'cash', '$5/$10');
  
  for (let i = 0; i < 80; i++) {
    clubManager.recordHand(
      table3.id,
      `hand-hs-${i}`,
      2000 + Math.random() * 5000,
      50 + Math.random() * 150,
      [
        { userId: '3', rakePaid: 60 },
        { userId: '4', rakePaid: 50 }
      ]
    );
  }

  // クラブ3: Tournament Club
  const club3 = clubManager.createClub({
    name: 'Tournament Masters',
    ownerId: '4',
    ownerUsername: 'ProPlayer',
    description: 'トーナメント専門クラブ。毎日開催中！',
    rakePercentage: 15,
    isPrivate: false,
    maxMembers: 200
  });

  const table4 = clubManager.createTable(club3.id, 'Daily Tournament', 'tournament', '$50+$5');
  
  for (let i = 0; i < 30; i++) {
    clubManager.recordHand(
      table4.id,
      `hand-t-${i}`,
      1000,
      50,
      [
        { userId: '2', rakePaid: 5 },
        { userId: '4', rakePaid: 5 }
      ]
    );
  }

  // ティア更新
  clubManager.updateClubTier(club1.id);
  clubManager.updateClubTier(club2.id);
  clubManager.updateClubTier(club3.id);

  console.log('[CLUBS] Initialized 3 clubs with mock data');
}

// 初期化
initializeMockClubs();
