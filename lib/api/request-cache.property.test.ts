/**
 * Property-Based Tests for Request Deduplication
 * 
 * **Validates: Requirements 12.7**
 * 
 * These tests use fast-check to generate random test cases and verify
 * that the RequestCache correctly deduplicates simultaneous requests,
 * ensuring only one network call is made when multiple components request
 * the same data within the TTL window.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { RequestCache } from './request-cache';

describe('Property 9: Request Deduplication Within Time Window', () => {
  let cache: RequestCache;

  beforeEach(() => {
    cache = new RequestCache(1000); // 1 second TTL
    vi.clearAllMocks();
  });

  /**
   * Property: Multiple simultaneous requests to the same endpoint result in exactly 1 network call
   * 
   * For any number of simultaneous requests (N ≥ 2) to the same cache key,
   * the fetch function should be called exactly once, and all callers should
   * receive the same promise that resolves to the same response.
   */
  it('should deduplicate N simultaneous requests to the same key, making exactly 1 network call', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a random number of simultaneous requests (2-10)
        fc.integer({ min: 2, max: 10 }),
        // Generate random response value
        fc.integer({ min: 1, max: 1000 }),
        async (numRequests, responseValue) => {
          // Create fresh cache for this test case
          const testCache = new RequestCache(1000);
          
          // Track how many times the fetch function is actually called
          let fetchCallCount = 0;
          
          // Create mock fetch function that returns the same data
          const mockFetchFn = vi.fn(async () => {
            fetchCallCount++;
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 10));
            return { data: responseValue };
          });

          // Make N simultaneous requests to the same cache key
          const promises = Array.from({ length: numRequests }, () =>
            testCache.fetch('test-key', mockFetchFn)
          );

          // Wait for all promises to resolve
          const results = await Promise.all(promises);

          // Property 1: Fetch function should be called exactly once
          expect(fetchCallCount).toBe(1);
          expect(mockFetchFn).toHaveBeenCalledTimes(1);

          // Property 2: All results should be identical
          for (const result of results) {
            expect(result).toEqual({ data: responseValue });
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Requests with different cache keys are independent
   * 
   * For any set of distinct cache keys, each key should trigger its own
   * network request, regardless of timing.
   */
  it('should make separate network calls for different cache keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate 2-5 distinct keys
        fc.integer({ min: 2, max: 5 }),
        async (numKeys) => {
          // Create fresh cache for this test case
          const testCache = new RequestCache(1000);
          
          // Create distinct keys
          const keys = Array.from({ length: numKeys }, (_, i) => `key-${i}`);
          
          let totalFetchCalls = 0;
          const mockFetchFunctions = keys.map((key) => {
            return vi.fn(async () => {
              totalFetchCalls++;
              await new Promise(resolve => setTimeout(resolve, 5));
              return { key, value: totalFetchCalls };
            });
          });

          // Make simultaneous requests with different keys
          const promises = keys.map((key, index) =>
            testCache.fetch(key, mockFetchFunctions[index])
          );

          const results = await Promise.all(promises);

          // Property: Each distinct key should trigger exactly one fetch
          expect(totalFetchCalls).toBe(numKeys);
          
          // Property: Each result should match its key
          results.forEach((result, index) => {
            expect(result.key).toBe(keys[index]);
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: All callers receive identical response data
   * 
   * When N callers request the same resource simultaneously, all should
   * receive identical response data (deep equality).
   */
  it('should return identical response data to all callers', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random number of callers
        fc.integer({ min: 2, max: 10 }),
        // Generate response data
        fc.record({
          status: fc.constantFrom('success', 'error'),
          value: fc.integer({ min: 0, max: 100 }),
        }),
        async (numCallers, responseData) => {
          // Create fresh cache for this test case
          const testCache = new RequestCache(1000);
          
          const mockFetch = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 5));
            // Return response data
            return responseData;
          });

          // Make simultaneous calls
          const promises = Array.from({ length: numCallers }, () =>
            testCache.fetch('endpoint', mockFetch)
          );

          const results = await Promise.all(promises);

          // Property: All results should be deeply equal
          for (const result of results) {
            expect(result).toEqual(responseData);
          }

          // Property: Only one fetch should have occurred
          expect(mockFetch).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Failed requests are not cached
   * 
   * When a request fails, it should be removed from cache immediately,
   * allowing subsequent requests to retry.
   */
  it('should not cache failed requests, allowing immediate retry', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate number of retry attempts
        fc.integer({ min: 2, max: 5 }),
        async (numRetries) => {
          let attemptCount = 0;
          const mockFetch = vi.fn(async () => {
            attemptCount++;
            throw new Error('Network error');
          });

          // Make multiple failed requests
          for (let i = 0; i < numRetries; i++) {
            await expect(cache.fetch('error-key', mockFetch)).rejects.toThrow('Network error');
          }

          // Property: Each attempt should trigger a new fetch (no caching of errors)
          expect(mockFetch).toHaveBeenCalledTimes(numRetries);
          expect(attemptCount).toBe(numRetries);

          // Property: Cache should not contain the failed key
          expect(cache.has('error-key')).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Cache respects manual clear operations
   * 
   * After clearing a cache entry, subsequent requests should trigger
   * new network calls.
   */
  it('should trigger new fetch after manual cache clear', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        async (responseValue) => {
          // Create fresh cache for this test case
          const testCache = new RequestCache(1000);
          
          let fetchCount = 0;
          const mockFetch = vi.fn(async () => {
            fetchCount++;
            return { value: responseValue, attempt: fetchCount };
          });

          // First fetch
          const result1 = await testCache.fetch('cache-key', mockFetch);
          expect(fetchCount).toBe(1);
          expect(result1.attempt).toBe(1);

          // Clear the cache entry
          testCache.clear('cache-key');

          // Second fetch should trigger new network call
          const result2 = await testCache.fetch('cache-key', mockFetch);
          expect(fetchCount).toBe(2);
          expect(result2.attempt).toBe(2);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Deduplication works within TTL window
   * 
   * Requests made within the TTL window should be deduplicated,
   * while requests after TTL should trigger new network calls.
   */
  it('should deduplicate requests within TTL window but allow new requests after TTL', async () => {
    // Test with a shorter TTL for faster execution
    const shortCache = new RequestCache(100); // 100ms TTL
    
    let fetchCount = 0;
    const mockFetch = vi.fn(async () => {
      fetchCount++;
      return { data: `response-${fetchCount}` };
    });

    // First request
    const result1 = await shortCache.fetch('key', mockFetch);
    expect(fetchCount).toBe(1);
    expect(shortCache.has('key')).toBe(true);

    // Second request immediately - should be deduplicated
    const result2 = await shortCache.fetch('key', mockFetch);
    expect(fetchCount).toBe(1); // Still 1, deduplicated
    expect(result2).toBe(result1); // Same result

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Cache should be cleared
    expect(shortCache.has('key')).toBe(false);

    // Third request after TTL - should trigger new fetch
    const result3 = await shortCache.fetch('key', mockFetch);
    expect(fetchCount).toBe(2); // New fetch occurred
    expect(result3).not.toBe(result1); // Different result
  });

  /**
   * Property: Deduplication preserves promise resolution timing
   * 
   * All callers should receive their results at approximately the same time.
   */
  it('should resolve all deduplicated requests simultaneously', async () => {
    const numCallers = 10;
    const networkDelay = 50;
    const resolutionTimes: number[] = [];
    
    const mockFetch = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, networkDelay));
      return { data: 'test' };
    });

    // Track when each promise resolves
    const startTime = Date.now();
    const promises = Array.from({ length: numCallers }, () =>
      cache.fetch('timing-test', mockFetch).then(result => {
        resolutionTimes.push(Date.now() - startTime);
        return result;
      })
    );

    await Promise.all(promises);

    // Property: All resolutions should occur within a small time window (< 30ms)
    const minTime = Math.min(...resolutionTimes);
    const maxTime = Math.max(...resolutionTimes);
    const timeDelta = maxTime - minTime;
    
    expect(timeDelta).toBeLessThan(30); // All should resolve nearly simultaneously
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  /**
   * Property: Cache size is correctly maintained
   * 
   * The cache size should reflect the number of active cache entries.
   */
  it('should maintain correct cache size', async () => {
    expect(cache.size()).toBe(0);

    // Add first entry
    await cache.fetch('key-1', async () => ({ data: 1 }));
    expect(cache.size()).toBe(1);

    // Add second entry
    await cache.fetch('key-2', async () => ({ data: 2 }));
    expect(cache.size()).toBe(2);

    // Clear one entry
    cache.clear('key-1');
    expect(cache.size()).toBe(1);

    // Clear all
    cache.clearAll();
    expect(cache.size()).toBe(0);
  });

  /**
   * Real-world scenario: Multiple components polling simultaneously
   * 
   * Simulates 5 components all polling the same endpoint at the same time.
   */
  it('should handle real-world scenario: multiple components polling same endpoint', async () => {
    let totalFetchCalls = 0;
    const simulatedApiFetch = vi.fn(async () => {
      totalFetchCalls++;
      await new Promise(resolve => setTimeout(resolve, 20));
      return {
        data: {
          cpu_usage: 45,
          ram_used: 2048,
          status: 'healthy',
        }
      };
    });

    // Simulate 5 components all requesting health data simultaneously
    const componentPromises = Array.from({ length: 5 }, () =>
      cache.fetch('system:health', simulatedApiFetch)
    );

    const results = await Promise.all(componentPromises);

    // Should only make ONE network request
    expect(totalFetchCalls).toBe(1);

    // All components should receive the same data
    for (const result of results) {
      expect(result.data.cpu_usage).toBe(45);
      expect(result.data.status).toBe('healthy');
    }
  });

  /**
   * Integration scenario: Different endpoints are independent
   */
  it('should handle different endpoints independently', async () => {
    const mockHealthFetch = vi.fn(async () => ({ status: 'healthy' }));
    const mockXrayFetch = vi.fn(async () => ({ instances: 10 }));

    // Call two different endpoints simultaneously
    await Promise.all([
      cache.fetch('system:health', mockHealthFetch),
      cache.fetch('system:xray', mockXrayFetch),
    ]);

    // Should call each API once
    expect(mockHealthFetch).toHaveBeenCalledTimes(1);
    expect(mockXrayFetch).toHaveBeenCalledTimes(1);
  });
});
