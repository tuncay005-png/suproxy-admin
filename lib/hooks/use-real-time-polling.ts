'use client';

import { useEffect, useRef, useState } from 'react';
import type { ApiResponse } from '@/types/api';
import { pageVisibility } from '@/lib/utils/feature-detection';

/**
 * Options for configuring the useRealTimePolling hook
 */
export interface UseRealTimePollingOptions {
  /** Enable exponential backoff on errors (default: true) */
  enableBackoff?: boolean;
  /** Maximum backoff delay in ms (default: 60000) */
  maxBackoff?: number;
  /** Pause polling when tab is not visible (default: true) */
  pauseOnInactive?: boolean;
  /** Initial data to display before first fetch */
  initialData?: any;
}

/**
 * Return type for the useRealTimePolling hook
 */
export interface UseRealTimePollingReturn<T> {
  /** Current data state */
  data: T | null;
  /** Current error state */
  error: Error | null;
  /** Loading state (true during first fetch) */
  isLoading: boolean;
  /** Fetching state (true during any fetch) */
  isFetching: boolean;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Last successful fetch timestamp */
  lastUpdated: Date | null;
}

/**
 * useRealTimePolling Hook
 * 
 * Manages periodic data fetching with configurable intervals, error handling,
 * exponential backoff, and automatic cleanup on unmount.
 * 
 * Features:
 * - Automatic polling at specified intervals
 * - Exponential backoff on consecutive failures (interval × 2^(failures-1))
 * - Page Visibility API integration (pauses when tab inactive)
 * - Automatic cleanup on unmount
 * - Manual refresh capability
 * 
 * @example
 * ```tsx
 * const { data, error, isLoading, refresh } = useRealTimePolling(
 *   () => systemApi.getStats(),
 *   5000,
 *   { enableBackoff: true, pauseOnInactive: true }
 * );
 * ```
 * 
 * @template T The type of data returned by the fetch function
 * @param fetchFunction Async function that returns a Promise of ApiResponse<T>
 * @param intervalMs Polling interval in milliseconds
 * @param options Configuration options for the hook
 * @returns Object containing data, error, loading states, refresh function, and lastUpdated timestamp
 */
export function useRealTimePolling<T>(
  fetchFunction: () => Promise<ApiResponse<T>>,
  intervalMs: number,
  options: UseRealTimePollingOptions = {}
): UseRealTimePollingReturn<T> {
  const {
    enableBackoff = true,
    maxBackoff = 60000,
    pauseOnInactive = true,
    initialData = null,
  } = options;

  // State management
  const [data, setData] = useState<T | null>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Refs for managing polling state
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const failureCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  /**
   * Manual refresh function - triggers a re-fetch by updating state
   */
  const refresh = async () => {
    setRefreshTrigger(prev => prev + 1);
  };

  /**
   * Main effect that handles polling logic
   * IMPORTANT: fetchFunction is intentionally excluded from dependencies
   * to prevent re-initialization on every render. The function is captured
   * once and used throughout the polling lifecycle.
   */
  useEffect(() => {
    isMountedRef.current = true;
    let currentInterval: NodeJS.Timeout | null = null;

    // Capture fetchFunction at mount time to avoid recreation loops
    const capturedFetchFunction = fetchFunction;

    /**
     * Execute the fetch and handle results
     */
    const executeFetch = async () => {
      if (!isMountedRef.current) return;

      setIsFetching(true);

      try {
        const response = await capturedFetchFunction();
        
        if (!isMountedRef.current) return;

        // Successfully fetched data
        setData(response.data);
        setError(null);
        setLastUpdated(new Date());
        
        // Reset backoff on success
        failureCountRef.current = 0;

        // First fetch complete
        if (isLoading) {
          setIsLoading(false);
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
        
        console.error('[useRealTimePolling] Fetch error:', errorObj);
        setError(errorObj);
        
        // Record failure
        if (enableBackoff) {
          failureCountRef.current++;
          const nextDelay = Math.min(
            intervalMs * Math.pow(2, failureCountRef.current - 1),
            maxBackoff
          );
          console.warn(
            `[useRealTimePolling] Failure ${failureCountRef.current}, next delay: ${nextDelay}ms`
          );
        }

        // First fetch complete (even with error)
        if (isLoading) {
          setIsLoading(false);
        }
      } finally {
        if (isMountedRef.current) {
          setIsFetching(false);
        }
      }
    };

    /**
     * Start polling with current delay
     */
    const startPolling = () => {
      // Stop any existing interval
      if (currentInterval) {
        clearInterval(currentInterval);
      }

      // Execute immediately
      executeFetch();

      // Calculate current delay based on failures
      const getCurrentDelay = () => {
        if (!enableBackoff || failureCountRef.current === 0) {
          return intervalMs;
        }
        return Math.min(
          intervalMs * Math.pow(2, failureCountRef.current - 1),
          maxBackoff
        );
      };

      // Set up recurring polling
      const delay = getCurrentDelay();
      currentInterval = setInterval(() => {
        executeFetch();
      }, delay);
    };

    /**
     * Stop polling
     */
    const stopPolling = () => {
      if (currentInterval) {
        clearInterval(currentInterval);
        currentInterval = null;
      }
    };

    /**
     * Handle visibility changes (with safe API wrapper)
     */
    const handleVisibilityChange = () => {
      if (pageVisibility.isHidden()) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    // Start initial polling
    startPolling();

    // Set up visibility listener if enabled (with safe API wrapper)
    if (pauseOnInactive && typeof document !== 'undefined') {
      pageVisibility.addListener(handleVisibilityChange);
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      stopPolling();
      if (pauseOnInactive && typeof document !== 'undefined') {
        pageVisibility.removeListener(handleVisibilityChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, enableBackoff, maxBackoff, pauseOnInactive, refreshTrigger]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refresh,
    lastUpdated,
  };
}
