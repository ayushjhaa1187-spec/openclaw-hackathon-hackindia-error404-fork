'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { showNexusInfo } from '../components/shared/Skeleton';

interface UseAPIOptions {
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
}

export function useAPI<T>(
  url: string,
  options: UseAPIOptions = {}
) {
  const {
    cache = true,
    cacheTTL = 5 * 60 * 1000, // 5 min default
    retries = 3,
    timeout = 10000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  const cacheKey = `nexus:api:${url}`;
  const timestampKey = `${cacheKey}:ts`;

  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Nexus Response Error [${res.status}]: ${res.statusText}`);
      }

      const json = await res.json();
      const result = json.data || json;

      setData(result);
      setError(null);
      setIsFromCache(false);
      setLoading(false);

      if (cache && typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(result));
        localStorage.setItem(timestampKey, Date.now().toString());
      }
    } catch (err: any) {
      console.error(`API Fetch Error (Retry ${retryCount}/${retries}):`, err.message);

      // Graceful Degradation: Check Cache
      const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      const cachedTime = typeof window !== 'undefined' ? parseInt(localStorage.getItem(timestampKey) || '0') : 0;
      const isExpired = Date.now() - cachedTime > cacheTTL;

      if (cachedData && !isExpired) {
        setData(JSON.parse(cachedData));
        setError(null);
        setIsFromCache(true);
        setLoading(false);
        showNexusInfo('Nexus Warning: Using cached data due to connectivity issues.');
      } else if (retryCount < retries) {
        const nextRetry = retryCount + 1;
        setTimeout(() => fetchData(nextRetry), 1000 * nextRetry);
      } else {
        setError(err);
        setLoading(false);
        toast.error('Nexus Connection Failure: Could not reach institutional node.');
        
        // Report critical fetch error
        fetch('/api/v1/errors/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorMessage: err.message,
            url: window.location.href,
            type: 'api_error',
            timestamp: new Date().toISOString()
          }),
        }).catch(() => {});
      }
    }
  }, [url, cache, cacheTTL, retries, timeout, cacheKey, timestampKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, isFromCache, refresh: () => fetchData(0) };
}
