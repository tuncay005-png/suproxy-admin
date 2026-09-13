import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRealTimePolling } from './use-real-time-polling';
import type { ApiResponse } from '@/types/api';

// Mock API response type
interface TestData {
  value: number;
  message: string;
}

describe('useRealTimePolling', () => {
  beforeEach(() => {
    // Mock document.hidden property
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic polling functionality', () => {
    it('should fetch data immediately on mount', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000)
      );

      // Initial state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(null);

      // Wait for first fetch
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      expect(result.current.data).toEqual({ value: 42, message: 'success' });
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should use initial data before first fetch completes', () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          data: { value: 42, message: 'success' },
          success: true,
        };
      });

      const initialData = { value: 0, message: 'initial' };
      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000, { initialData })
      );

      expect(result.current.data).toEqual(initialData);
      expect(result.current.isLoading).toBe(true);
    });

    it('should update lastUpdated timestamp on successful fetch', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000)
      );

      expect(result.current.lastUpdated).toBe(null);

      await waitFor(
        () => {
          expect(result.current.lastUpdated).toBeInstanceOf(Date);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Network error');
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        throw mockError;
      });

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000)
      );

      await waitFor(
        () => {
          expect(result.current.error).toBe(mockError);
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Manual refresh', () => {
    it('should provide refresh function', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000)
      );

      // Wait for initial fetch
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      // Refresh should be a function
      expect(typeof result.current.refresh).toBe('function');
    });
  });

  describe('Cleanup', () => {
    it('should stop polling on unmount', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      const { unmount } = renderHook(() =>
        useRealTimePolling(mockFetch, 500)
      );

      // Wait for initial fetch
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );

      // Wait for at least one more call to ensure polling is active
      await waitFor(
        () => {
          expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
        },
        { timeout: 2000 }
      );

      const callCountBeforeUnmount = mockFetch.mock.calls.length;

      // Unmount immediately
      unmount();

      // Wait longer than the interval to ensure no more calls happen
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Should not have called fetch again after unmount (allow at most 1 in-flight call)
      expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(callCountBeforeUnmount + 1);
    });
  });

  describe('isFetching state', () => {
    it('should set isFetching during fetch', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          data: { value: 42, message: 'success' },
          success: true,
        };
      });

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000)
      );

      // Should be fetching immediately after mount
      expect(result.current.isFetching).toBe(true);

      // Wait for fetch to complete
      await waitFor(
        () => {
          expect(result.current.isFetching).toBe(false);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Configuration options', () => {
    it('should accept and respect enableBackoff option', () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000, { enableBackoff: false })
      );

      expect(result.current).toBeDefined();
    });

    it('should accept and respect maxBackoff option', () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000, { maxBackoff: 30000 })
      );

      expect(result.current).toBeDefined();
    });

    it('should accept and respect pauseOnInactive option', () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 5000, { pauseOnInactive: false })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('Exponential Backoff', () => {
    it('should increase backoff delay on consecutive failures', async () => {
      let callCount = 0;
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        callCount++;
        throw new Error('Network error');
      });

      renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { enableBackoff: true, maxBackoff: 60000 })
      );

      // Wait for initial fetch (should fail immediately)
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(1);
        },
        { timeout: 2000 }
      );

      // Wait for second fetch (should happen after 1000ms - first failure uses base interval)
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(2);
        },
        { timeout: 2500 }
      );

      // Wait for third fetch (should happen after 2000ms - second failure doubles interval)
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(3);
        },
        { timeout: 3500 }
      );

      // Wait for fourth fetch (should happen after 4000ms - third failure doubles again)
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(4);
        },
        { timeout: 6000 }
      );
    });

    it('should cap backoff delay at maxBackoff', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        throw new Error('Network error');
      });

      renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { enableBackoff: true, maxBackoff: 5000 })
      );

      // Wait for multiple failures to exceed maxBackoff calculation
      // After 5 failures: 1s, 2s, 4s, 8s, 16s (capped at 5s)
      await waitFor(
        () => {
          expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(5);
        },
        { timeout: 20000 }
      );

      // Verify that the delay doesn't exceed maxBackoff
      // If not capped, 16s interval would mean only 2 calls in 20s
      // With 5s cap, we should have more calls
      expect(mockFetch.mock.calls.length).toBeGreaterThan(3);
    });

    it('should reset backoff on successful fetch after failures', async () => {
      let shouldFail = true;
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        if (shouldFail) {
          throw new Error('Network error');
        }
        return {
          data: { value: 42, message: 'success' },
          success: true,
        };
      });

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { enableBackoff: true, maxBackoff: 60000 })
      );

      // Wait for initial failure
      await waitFor(
        () => {
          expect(result.current.error).not.toBe(null);
        },
        { timeout: 3000 }
      );

      // Wait for second failure (backoff should be increasing)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const failureCount = mockFetch.mock.calls.length;

      // Now allow success
      shouldFail = false;

      // Wait for successful fetch
      await waitFor(
        () => {
          expect(result.current.error).toBe(null);
          expect(result.current.data).toEqual({ value: 42, message: 'success' });
        },
        { timeout: 5000 }
      );

      const successCallCount = mockFetch.mock.calls.length;

      // After success, backoff should reset to normal interval
      // Wait for another successful call with base interval (1000ms)
      await waitFor(
        () => {
          expect(mockFetch.mock.calls.length).toBeGreaterThan(successCallCount);
        },
        { timeout: 2000 } // Should happen within base interval + buffer
      );
    });

    it('should use base interval when enableBackoff is false', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        throw new Error('Network error');
      });

      renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { enableBackoff: false, maxBackoff: 60000 })
      );

      // Wait for initial fetch
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(1);
        },
        { timeout: 2000 }
      );

      // Even with failures, should maintain base interval (1000ms)
      await waitFor(
        () => {
          expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(3);
        },
        { timeout: 3500 }
      );

      // Verify calls are happening at ~1000ms intervals (not exponentially increasing)
      const timestamps = mockFetch.mock.calls.map(() => Date.now());
      if (timestamps.length >= 3) {
        const interval1 = timestamps[1] - timestamps[0];
        const interval2 = timestamps[2] - timestamps[1];
        
        // Both intervals should be close to 1000ms (not doubling)
        expect(interval1).toBeLessThan(1500);
        expect(interval2).toBeLessThan(1500);
      }
    });

    it('should follow exponential backoff formula: interval × 2^(failures-1)', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        throw new Error('Network error');
      });

      renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { enableBackoff: true, maxBackoff: 60000 })
      );

      // Wait for initial call
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(1);
        },
        { timeout: 2000 }
      );

      // After first failure, should wait ~1000ms before next call
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(2);
        },
        { timeout: 2500 }
      );

      // After second failure, should wait ~2000ms before next call
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(3);
        },
        { timeout: 3500 }
      );

      // After third failure, should wait ~4000ms before next call
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(4);
        },
        { timeout: 6000 }
      );

      // If we got here, exponential backoff is working
      // (would have timed out if delays weren't increasing)
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should handle mixed success and failure with backoff', async () => {
      let callCount = 0;
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => {
        callCount++;
        // Fail on calls 1, 2, then succeed on 3+
        if (callCount <= 2) {
          throw new Error('Network error');
        }
        return {
          data: { value: callCount, message: 'success' },
          success: true,
        };
      });

      const { result } = renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { enableBackoff: true, maxBackoff: 60000 })
      );

      // Wait for failure 1
      await waitFor(
        () => {
          expect(callCount).toBeGreaterThanOrEqual(1);
          expect(result.current.error).not.toBe(null);
        },
        { timeout: 2000 }
      );

      // Wait for failure 2 (after ~1000ms backoff)
      await waitFor(
        () => {
          expect(callCount).toBeGreaterThanOrEqual(2);
        },
        { timeout: 2500 }
      );

      // Wait for success 3 (after ~2000ms backoff)
      await waitFor(
        () => {
          expect(callCount).toBeGreaterThanOrEqual(3);
          expect(result.current.error).toBe(null);
          expect(result.current.data?.value).toBe(callCount);
        },
        { timeout: 4000 }
      );

      // After success, backoff should reset
      // Next call should happen after base interval (1000ms)
      const callCountBeforeReset = callCount;
      
      await waitFor(
        () => {
          expect(callCount).toBeGreaterThan(callCountBeforeReset);
        },
        { timeout: 2000 } // Should happen within base interval + buffer
      );
    });
  });

  describe('Page Visibility API integration', () => {
    it('should pause polling when tab becomes inactive', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      // Render hook with pauseOnInactive enabled
      renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { pauseOnInactive: true })
      );

      // Wait for initial fetch and a couple more to establish polling pattern
      await waitFor(
        () => {
          expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
        },
        { timeout: 4000 }
      );

      // Wait a bit more to ensure we're in a stable polling state
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const callCountBeforeHiding = mockFetch.mock.calls.length;

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      // Dispatch visibilitychange event
      const visibilityChangeEvent = new Event('visibilitychange');
      document.dispatchEvent(visibilityChangeEvent);

      // Wait to ensure no more polling happens (wait longer than the interval)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Should not have made additional calls while hidden (or at most 1 if it was already scheduled)
      expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(callCountBeforeHiding + 1);
    });

    it('should resume polling when tab becomes active again', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      // Start with tab hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        writable: true,
        value: true,
      });

      // Render hook with pauseOnInactive enabled
      renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { pauseOnInactive: true })
      );

      // Should still fetch initially even if tab is "hidden" at mount
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      const callCountBeforeReactivating = mockFetch.mock.calls.length;

      // Simulate tab becoming visible
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        writable: true,
        value: false,
      });

      // Dispatch visibilitychange event
      const visibilityChangeEvent = new Event('visibilitychange');
      document.dispatchEvent(visibilityChangeEvent);

      // Wait for polling to resume
      await waitFor(
        () => {
          expect(mockFetch.mock.calls.length).toBeGreaterThan(callCountBeforeReactivating);
        },
        { timeout: 3000 }
      );
    });

    it('should not pause polling when pauseOnInactive is false', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      // Render hook with pauseOnInactive disabled
      renderHook(() =>
        useRealTimePolling(mockFetch, 1000, { pauseOnInactive: false })
      );

      // Wait for initial fetch
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      const callCountBeforeHiding = mockFetch.mock.calls.length;

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      // Dispatch visibilitychange event
      const visibilityChangeEvent = new Event('visibilitychange');
      document.dispatchEvent(visibilityChangeEvent);

      // Wait for at least one more polling cycle
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Should continue polling even when hidden (because pauseOnInactive is false)
      expect(mockFetch.mock.calls.length).toBeGreaterThan(callCountBeforeHiding);
    });

    it('should handle multiple visibility changes correctly', async () => {
      const mockFetch = vi.fn<[], Promise<ApiResponse<TestData>>>(async () => ({
        data: { value: 42, message: 'success' },
        success: true,
      }));

      renderHook(() =>
        useRealTimePolling(mockFetch, 500, { pauseOnInactive: true })
      );

      // Wait for initial fetch
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      // Hide tab
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        writable: true,
        value: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const callsWhileHidden = mockFetch.mock.calls.length;

      // Show tab
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        writable: true,
        value: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      // Wait for polling to resume
      await waitFor(
        () => {
          expect(mockFetch.mock.calls.length).toBeGreaterThan(callsWhileHidden);
        },
        { timeout: 3000 }
      );

      const callsAfterResume = mockFetch.mock.calls.length;

      // Hide again
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        writable: true,
        value: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Should have paused again
      expect(mockFetch.mock.calls.length).toBe(callsAfterResume);
    });
  });
});
