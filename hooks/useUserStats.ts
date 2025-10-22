import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export interface UserStats {
  totalEarnings: number;
  recentEarnings: number;
  gamesPlayed: number;
  winRate: number;
  totalChips: number;
  energy: number;
  gems: number;
  coins: number;
  vipDays: number;
  level: number;
  experience: number;
  handHistory: any[];
}

export const useUserStats = (userId?: string) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUserStats, setGameStats } = useAppStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/stats/user?userId=${userId || user?.id}`);
        
        if (!response.ok) {
          throw new Error('統計データの取得に失敗しました');
        }

        const data = await response.json();
        setStats(data);

        // グローバル状態を更新
        updateUserStats({
          energy: data.energy,
          gems: data.gems,
          chips: data.totalChips,
          level: data.level,
          vipDays: data.vipDays
        });

        setGameStats({
          totalEarnings: data.totalEarnings,
          recentEarnings: data.recentEarnings,
          gamesPlayed: data.gamesPlayed,
          winRate: data.winRate
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || userId) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [userId, user?.id, updateUserStats, setGameStats]);

  const refreshStats = async () => {
    const response = await fetch(`/api/stats/user?userId=${userId || user?.id}`);
    if (response.ok) {
      const data = await response.json();
      setStats(data);
      updateUserStats({
        energy: data.energy,
        gems: data.gems,
        chips: data.totalChips,
        level: data.level,
        vipDays: data.vipDays
      });
      setGameStats({
        totalEarnings: data.totalEarnings,
        recentEarnings: data.recentEarnings,
        gamesPlayed: data.gamesPlayed,
        winRate: data.winRate
      });
    }
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
