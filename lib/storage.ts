// LocalStorage管理用のユーティリティ関数

// テーブルデータの保存・取得
export const saveTables = (tables: any[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('poker_tables', JSON.stringify(tables));
    } catch (error) {
      console.error('Failed to save tables:', error);
    }
  }
};

export const loadTables = (): any[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('poker_tables');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load tables:', error);
      return [];
    }
  }
  return [];
};

// トーナメントデータの保存・取得
export const saveTournaments = (tournaments: any[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('poker_tournaments', JSON.stringify(tournaments));
    } catch (error) {
      console.error('Failed to save tournaments:', error);
    }
  }
};

export const loadTournaments = (): any[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('poker_tournaments');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load tournaments:', error);
      return [];
    }
  }
  return [];
};

// ゲーム統計の保存・取得
export const saveGameStats = (stats: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('poker_game_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save game stats:', error);
    }
  }
};

export const loadGameStats = (): any => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('poker_game_stats');
      return data ? JSON.parse(data) : {
        handsPlayed: 0,
        handsWon: 0,
        totalWinnings: 0,
        biggestPot: 0,
        bestHand: 'ハイカード',
      };
    } catch (error) {
      console.error('Failed to load game stats:', error);
      return {
        handsPlayed: 0,
        handsWon: 0,
        totalWinnings: 0,
        biggestPot: 0,
        bestHand: 'ハイカード',
      };
    }
  }
  return {
    handsPlayed: 0,
    handsWon: 0,
    totalWinnings: 0,
    biggestPot: 0,
    bestHand: 'ハイカード',
  };
};

// ハンド履歴の保存・取得
export const saveHandHistory = (history: any[]) => {
  if (typeof window !== 'undefined') {
    try {
      // 最新100件のみ保存（容量節約）
      const limitedHistory = history.slice(-100);
      localStorage.setItem('poker_hand_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Failed to save hand history:', error);
    }
  }
};

export const loadHandHistory = (): any[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('poker_hand_history');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load hand history:', error);
      return [];
    }
  }
  return [];
};

// 獲得賞金履歴の保存・取得
export const saveWinnings = (winnings: any[]) => {
  if (typeof window !== 'undefined') {
    try {
      // 最新50件のみ保存
      const limitedWinnings = winnings.slice(-50);
      localStorage.setItem('poker_winnings', JSON.stringify(limitedWinnings));
    } catch (error) {
      console.error('Failed to save winnings:', error);
    }
  }
};

export const loadWinnings = (): any[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('poker_winnings');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load winnings:', error);
      return [];
    }
  }
  return [];
};

// フォーラム投稿の保存・取得
export const saveForumPosts = (posts: any[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('poker_forum_posts', JSON.stringify(posts));
    } catch (error) {
      console.error('Failed to save forum posts:', error);
    }
  }
};

export const loadForumPosts = (): any[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('poker_forum_posts');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load forum posts:', error);
      return [];
    }
  }
  return [];
};

// 全データのクリア（デバッグ用）
export const clearAllData = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('poker_tables');
      localStorage.removeItem('poker_tournaments');
      localStorage.removeItem('poker_game_stats');
      localStorage.removeItem('poker_hand_history');
      localStorage.removeItem('poker_winnings');
      localStorage.removeItem('poker_forum_posts');
      console.log('All poker data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
};

// データのエクスポート（バックアップ用）
export const exportAllData = () => {
  if (typeof window !== 'undefined') {
    try {
      const allData = {
        tables: loadTables(),
        tournaments: loadTournaments(),
        gameStats: loadGameStats(),
        handHistory: loadHandHistory(),
        winnings: loadWinnings(),
        forumPosts: loadForumPosts(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(allData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }
  return null;
};

// データのインポート（バックアップからの復元用）
export const importAllData = (jsonData: string) => {
  if (typeof window !== 'undefined') {
    try {
      const data = JSON.parse(jsonData);
      if (data.tables) saveTables(data.tables);
      if (data.tournaments) saveTournaments(data.tournaments);
      if (data.gameStats) saveGameStats(data.gameStats);
      if (data.handHistory) saveHandHistory(data.handHistory);
      if (data.winnings) saveWinnings(data.winnings);
      if (data.forumPosts) saveForumPosts(data.forumPosts);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
  return false;
};

// ユーザープロフィール情報の保存・取得
export const saveUserProfile = (profile: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('user_profile', JSON.stringify(profile));
      console.log('✅ User profile saved:', profile);
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }
};

export const loadUserProfile = (): any => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('user_profile');
      const profile = data ? JSON.parse(data) : null;
      if (profile) {
        console.log('✅ User profile loaded');
      }
      return profile;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }
  return null;
};

// 所有アバターの保存・取得
export const saveOwnedAvatars = (avatars: string[]) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('owned_avatars', JSON.stringify(avatars));
    } catch (error) {
      console.error('Failed to save owned avatars:', error);
    }
  }
};

export const loadOwnedAvatars = (): string[] => {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('owned_avatars');
      return data ? JSON.parse(data) : ['default']; // デフォルトアバターは常に所有
    } catch (error) {
      console.error('Failed to load owned avatars:', error);
      return ['default'];
    }
  }
  return ['default'];
};

