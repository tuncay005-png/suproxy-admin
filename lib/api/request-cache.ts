/**
 * Request Deduplication Cache
 * 
 * Provides request deduplication to prevent redundant API calls when multiple
 * components request the same data simultaneously. This is particularly useful
 * for real-time polling scenarios where multiple components may poll the same
 * endpoint at similar times.
 * 
 * The cache uses a simple TTL-based strategy:
 * - When a request is made, check if an identical request is in-flight
 * - If yes, return the same promise to all callers
 * - If no, execute the request and cache the promise for the TTL duration
 * - After TTL expires, subsequent requests will trigger new network calls
 * 
 * Validates: Requirements 6.7, 12.7
 * 
 * @example
 * ```typescript
 * import { requestCache } from '@/lib/api/request-cache';
 * 
 * // All three calls within 1 second will result in only one network request
 * const [result1, result2, result3] = await Promise.all([
 *   requestCache.fetch('endpoint-key', () => fetch('/api/data')),
 *   requestCache.fetch('endpoint-key', () => fetch('/api/data')),
 *   requestCache.fetch('endpoint-key', () => fetch('/api/data')),
 * ]);
 * 
 * // All three results will be identical
 * ```
 */

interface CacheEntry<T> {
  /** The promise representing the in-flight or completed request */
  promise: Promise<T>;
  /** Timestamp when the cache entry was created */
  timestamp: number;
}

/**
 * RequestCache class implementing request deduplication with TTL
 * 
 * This cache ensures that multiple simultaneous requests to the same endpoint
 * result in only one actual network request. All callers receive the same
 * promise, which resolves to the same response data.
 */
export class RequestCache {
  /** Internal cache storage mapping keys to cache entries */
  private cache = new Map<string, CacheEntry<any>>();
  
  /** Time-to-live for cache entries in milliseconds */
  private ttl: number;

  /**
   * Create a new RequestCache instance
   * 
   * @param ttl - Time-to-live for cache entries in milliseconds (default: 1000ms)
   * 
   * @example
   * ```typescript
   * // Create cache with 1-second TTL
   * const cache = new RequestCache(1000);
   * 
   * // Create cache with 5-second TTL for less frequent updates
   * const slowCache = new RequestCache(5000);
   * ```
   */
  constructor(ttl: number = 1000) {
    this.ttl = ttl;
  }

  /**
   * Fetch data with deduplication
   * 
   * If a request with the same key is already in-flight and hasn't exceeded TTL,
   * returns the existing promise. Otherwise, executes the fetch function and
   * caches the promise.
   * 
   * @param key - Unique identifier for the request (typically the endpoint path)
   * @param fetchFn - Function that performs the actual data fetching
   * @returns Promise resolving to the fetched data
   * 
   * @example
   * ```typescript
   * const cache = new RequestCache();
   * 
   * // Example 1: Basic usage with API client
   * const data = await cache.fetch(
   *   'system:health',
   *   () => apiClient.get('/api/admin/system/health')
   * );
   * 
   * // Example 2: Multiple simultaneous calls (only one network request)
   * const results = await Promise.all([
   *   cache.fetch('user:profile', () => apiClient.get('/api/user')),
   *   cache.fetch('user:profile', () => apiClient.get('/api/user')),
   *   cache.fetch('user:profile', () => apiClient.get('/api/user')),
   * ]);
   * // All three results are identical, only one network request was made
   * 
   * // Example 3: Different keys make separate requests
   * await Promise.all([
   *   cache.fetch('user:1', () => apiClient.get('/api/users/1')),
   *   cache.fetch('user:2', () => apiClient.get('/api/users/2')),
   * ]);
   * // Two separate network requests (different keys)
   * ```
   */
  async fetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Check if we have a valid cached entry (within TTL)
    if (cached && (now - cached.timestamp) < this.ttl) {
      // Return the cached promise - multiple callers get the same promise
      return cached.promise;
    }

    // No valid cache entry, execute the fetch function
    const promise = fetchFn().catch((error) => {
      // On error, immediately remove from cache to allow retry
      this.cache.delete(key);
      throw error;
    });

    // Store the promise in cache with current timestamp
    this.cache.set(key, {
      promise,
      timestamp: now,
    });

    // Schedule cache cleanup after TTL expires
    setTimeout(() => {
      const entry = this.cache.get(key);
      // Only delete if this is still the same entry (not replaced by a newer request)
      if (entry && entry.timestamp === now) {
        this.cache.delete(key);
      }
    }, this.ttl);

    return promise;
  }

  /**
   * Manually clear a specific cache entry
   * 
   * Useful for invalidating cached data when you know it's stale,
   * such as after a mutation operation.
   * 
   * @param key - The cache key to clear
   * 
   * @example
   * ```typescript
   * const cache = new RequestCache();
   * 
   * // After updating user data, clear the cache
   * await apiClient.put('/api/user/profile', updatedData);
   * cache.clear('user:profile');
   * 
   * // Next fetch will make a fresh network request
   * const freshData = await cache.fetch(
   *   'user:profile',
   *   () => apiClient.get('/api/user/profile')
   * );
   * ```
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   * 
   * Useful for clearing all cached data at once, such as when logging out
   * or when you want to force fresh data for all subsequent requests.
   * 
   * @example
   * ```typescript
   * const cache = new RequestCache();
   * 
   * // Clear all cached data
   * cache.clearAll();
   * 
   * // Or clear on logout
   * async function logout() {
   *   await apiClient.post('/api/auth/logout');
   *   cache.clearAll();
   *   window.location.href = '/login';
   * }
   * ```
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get the current cache size
   * 
   * Useful for monitoring and debugging cache behavior.
   * 
   * @returns Number of entries currently in the cache
   * 
   * @example
   * ```typescript
   * const cache = new RequestCache();
   * 
   * console.log('Cache entries:', cache.size()); // 0
   * 
   * await cache.fetch('key1', fetchFn1);
   * await cache.fetch('key2', fetchFn2);
   * 
   * console.log('Cache entries:', cache.size()); // 2
   * ```
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if a key exists in the cache
   * 
   * @param key - The cache key to check
   * @returns true if the key exists and is within TTL, false otherwise
   * 
   * @example
   * ```typescript
   * const cache = new RequestCache();
   * 
   * if (cache.has('user:profile')) {
   *   console.log('User profile is cached');
   * } else {
   *   console.log('User profile not in cache');
   * }
   * ```
   */
  has(key: string): boolean {
    const now = Date.now();
    const cached = this.cache.get(key);
    
    if (!cached) {
      return false;
    }

    // Check if entry is still valid (within TTL)
    if ((now - cached.timestamp) >= this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * Global request cache instance with 1-second TTL
 * 
 * This is the primary cache instance used throughout the application.
 * The 1-second TTL is optimal for real-time polling scenarios where:
 * - Multiple components may poll the same endpoint
 * - Data freshness is important (1s is acceptable staleness)
 * - Network request reduction is beneficial for performance
 * 
 * @example
 * ```typescript
 * import { requestCache } from '@/lib/api/request-cache';
 * 
 * // Use the global cache instance
 * const health = await requestCache.fetch(
 *   'system:health',
 *   () => apiClient.get('/api/admin/system/health')
 * );
 * ```
 */
export const requestCache = new RequestCache(1000);
