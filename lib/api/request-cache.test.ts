/**
 * Request Cache Tests
 * 
 * Tests the request deduplication cache to ensure multiple simultaneous
 * requests result in only one network call.
 * 
 * Validates: Requirements 6.7, 12.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestCache } from './request-cache';

describe('RequestCache', () => {
  let cache: RequestCache;
  let fetchCallCount: number;
  let mockFetchFn: () => Promise<{ data: string }>;

  beforeEach(() => {
    cache = new RequestCache(1000); // 1 second TTL
    fetchCallCount = 0;
    
    // Mock fetch function that tracks how many times it's called
    mockFetchFn = vi.fn(async () => {
      fetchCallCount++;
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 10));
      return { data: `Response ${fetchCallCount}` };
    });
  });

  describe('Request Deduplication', () => {
    it('should deduplicate multiple simultaneous requests to the same key', async () => {
      // Make 5 simultaneous requests with the same key
      const promises = Array.from({ length: 5 }, () =>
        cache.fetch('test-key', mockFetchFn)
      );

      const results = await Promise.all(promises);

      // Should only call the fetch function once
      expect(fetchCallCount).toBe(1);

      // All results should be identical
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toEqual({ data: 'Response 1' });
      });
    });

    it('should make separate requests for different keys', async () => {
      // Make simultaneous requests with different keys
      const promise1 = cache.fetch('key-1', mockFetchFn);
      const promise2 = cache.fetch('key-2', mockFetchFn);
      const promise3 = cache.fetch('key-3', mockFetchFn);

      await Promise.all([promise1, promise2, promise3]);

      // Should call the fetch function 3 times (once per key)
      expect(fetchCallCount).toBe(3);
    });

    it('should deduplicate requests when called sequentially within TTL', async () => {
      // First call
      const promise1 = cache.fetch('test-key', mockFetchFn);
      
      // Second call immediately after (still using same in-flight promise)
      const promise2 = cache.fetch('test-key', mockFetchFn);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both results should be identical (same fetch)
      expect(result1).toEqual(result2);
      expect(fetchCallCount).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should remove failed requests from cache immediately', async () => {
      const errorFetchFn = vi.fn(async () => {
        throw new Error('Network error');
      });

      // First request fails
      await expect(cache.fetch('error-key', errorFetchFn)).rejects.toThrow('Network error');
      
      // Cache should be empty (error removed from cache)
      expect(cache.has('error-key')).toBe(false);

      // Second request should trigger new fetch attempt
      await expect(cache.fetch('error-key', errorFetchFn)).rejects.toThrow('Network error');
      
      // Should have called the function twice (no caching of errors)
      expect(errorFetchFn).toHaveBeenCalledTimes(2);
    });

    it('should not affect other cache entries when one fails', async () => {
      const successFn = vi.fn(async () => ({ data: 'success' }));
      const errorFn = vi.fn(async () => {
        throw new Error('Error');
      });

      // Make one successful and one failing request
      const successPromise = cache.fetch('success-key', successFn);
      const errorPromise = cache.fetch('error-key', errorFn);

      await expect(successPromise).resolves.toEqual({ data: 'success' });
      await expect(errorPromise).rejects.toThrow('Error');

      // Successful request should still be cached
      expect(cache.has('success-key')).toBe(true);
      expect(cache.has('error-key')).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should clear a specific cache entry', async () => {
      await cache.fetch('test-key', mockFetchFn);
      
      expect(cache.has('test-key')).toBe(true);
      
      cache.clear('test-key');
      
      expect(cache.has('test-key')).toBe(false);
    });

    it('should clear all cache entries', async () => {
      await Promise.all([
        cache.fetch('key-1', mockFetchFn),
        cache.fetch('key-2', mockFetchFn),
        cache.fetch('key-3', mockFetchFn),
      ]);

      expect(cache.size()).toBe(3);

      cache.clearAll();

      expect(cache.size()).toBe(0);
      expect(cache.has('key-1')).toBe(false);
      expect(cache.has('key-2')).toBe(false);
      expect(cache.has('key-3')).toBe(false);
    });

    it('should return correct cache size', async () => {
      expect(cache.size()).toBe(0);

      await cache.fetch('key-1', mockFetchFn);
      expect(cache.size()).toBe(1);

      await cache.fetch('key-2', mockFetchFn);
      expect(cache.size()).toBe(2);

      cache.clear('key-1');
      expect(cache.size()).toBe(1);

      cache.clearAll();
      expect(cache.size()).toBe(0);
    });
  });

  describe('Real-world Scenario: Multiple Component Polling', () => {
    it('should deduplicate requests from multiple components polling simultaneously', async () => {
      // Simulate 3 components all polling the same endpoint
      // All components fetch at the same time
      
      let totalFetchCalls = 0;
      const simulatedApiFetch = vi.fn(async () => {
        totalFetchCalls++;
        await new Promise(resolve => setTimeout(resolve, 50));
        return {
          data: {
            cpu_usage: 45,
            ram_used: 2048,
            ram_total: 8192,
            status: 'healthy',
          }
        };
      });

      // Component 1, 2, and 3 all request health data at the same time
      const component1Promise = cache.fetch('system:health', simulatedApiFetch);
      const component2Promise = cache.fetch('system:health', simulatedApiFetch);
      const component3Promise = cache.fetch('system:health', simulatedApiFetch);

      const [result1, result2, result3] = await Promise.all([
        component1Promise,
        component2Promise,
        component3Promise,
      ]);

      // Should only make ONE network request
      expect(totalFetchCalls).toBe(1);

      // All components should receive the same data
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
      expect(result1.data.cpu_usage).toBe(45);
    });
  });

  describe('Integration: systemApi Usage Pattern', () => {
    it('should deduplicate getHealth() calls', async () => {
      const mockApiClient = {
        get: vi.fn(async () => ({
          data: {
            status: 'healthy',
            cpu_usage: 50,
            ram_used: 4096,
            ram_total: 8192,
            disk_used: 100,
            disk_total: 500,
            swap_used: 0,
            swap_total: 2048,
            uptime: 86400,
            database: 'connected',
            timestamp: new Date().toISOString(),
          }
        }))
      };

      // Simulate systemApi.getHealth() being called 5 times simultaneously
      const promises = Array.from({ length: 5 }, () =>
        cache.fetch('system:health', () => 
          mockApiClient.get('/api/admin/system/health')
        )
      );

      await Promise.all(promises);

      // Should only call the API once
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate getXraySystemStatus() calls', async () => {
      const mockApiClient = {
        get: vi.fn(async () => ({
          data: {
            instances_total: 10,
            instances_running: 8,
            instances_stopped: 2,
            clients_total: 50,
            clients_active: 42,
          }
        }))
      };

      // Simulate systemApi.getXraySystemStatus() being called 3 times
      const promises = Array.from({ length: 3 }, () =>
        cache.fetch('system:xray', () =>
          mockApiClient.get('/api/admin/system/xray')
        )
      );

      await Promise.all(promises);

      // Should only call the API once
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should handle different endpoints independently', async () => {
      const mockApiClient = {
        get: vi.fn(async (endpoint: string) => ({
          data: endpoint === '/api/admin/system/health' 
            ? { status: 'healthy' }
            : { instances_total: 10 }
        }))
      };

      // Call two different endpoints simultaneously
      await Promise.all([
        cache.fetch('system:health', () => 
          mockApiClient.get('/api/admin/system/health')
        ),
        cache.fetch('system:xray', () =>
          mockApiClient.get('/api/admin/system/xray')
        ),
      ]);

      // Should call the API twice (once per endpoint)
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
