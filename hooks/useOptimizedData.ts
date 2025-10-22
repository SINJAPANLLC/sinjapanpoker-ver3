'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface OptimizedDataOptions {
  staleTime?: number; // データが古くなるまでの時間（ms）
  cacheTime?: number; // キャッシュを保持する時間（ms）
  retryCount?: number; // リトライ回数
  retryDelay?: number; // リトライ間隔（ms）
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// グローバルキャッシュ
const globalCache = new Map<string, CachedData<any>>();

export function useOptimizedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: OptimizedDataOptions = {}
) {
  const {
    staleTime = 5 * 60 * 1000, // 5分
    cacheTime = 10 * 60 * 1000, // 10分
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // キャッシュからデータを取得
  const getCachedData = useCallback((): T | null => {
    const cached = globalCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiresAt) {
      globalCache.delete(key);
      return null;
    }

    return cached.data;
  }, [key]);

  // データをキャッシュに保存
  const setCachedData = useCallback((newData: T) => {
    const now = Date.now();
    globalCache.set(key, {
      data: newData,
      timestamp: now,
      expiresAt: now + cacheTime
    });
  }, [key, cacheTime]);

  // データが古いかチェック
  const isStale = useCallback((): boolean => {
    const cached = globalCache.get(key);
    if (!cached) return true;

    const now = Date.now();
    return now > (cached.timestamp + staleTime);
  }, [key, staleTime]);

  // フェッチ関数
  const fetchData = useCallback(async (force = false) => {
    if (!force && !isStale()) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setIsLoading(true);
    setError(null);

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const result = await fetchFn();
        setData(result);
        setCachedData(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        if (attempt === retryCount) {
          setError(err as Error);
          setIsLoading(false);
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }, [fetchFn, isStale, getCachedData, setCachedData, retryCount, retryDelay]);

  // 初期データ読み込み
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData && !isStale()) {
      setData(cachedData);
    } else {
      fetchData();
    }
  }, [getCachedData, isStale, fetchData]);

  // リフレッシュ関数
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // キャッシュをクリア
  const clearCache = useCallback(() => {
    globalCache.delete(key);
    setData(null);
  }, [key]);

  // メモ化された値
  const memoizedData = useMemo(() => data, [data]);

  return {
    data: memoizedData,
    isLoading,
    error,
    refresh,
    clearCache,
    isStale: isStale()
  };
}

// デバウンス付き検索フック
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
