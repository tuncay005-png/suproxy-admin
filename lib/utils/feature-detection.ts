/**
 * Feature Detection and Graceful Fallbacks
 * 
 * This module provides feature detection for modern web APIs used throughout the application
 * and implements graceful fallbacks for environments where these features are not available.
 * 
 * Detected Features:
 * - Page Visibility API (used in useRealTimePolling hook)
 * - IntersectionObserver API (for lazy loading)
 * - LocalStorage (for language persistence in i18n)
 * - CSS Grid/Flexbox (already widely supported)
 * 
 * @module feature-detection
 */

/**
 * Feature detection results
 */
export interface FeatureSupport {
  /** Whether Page Visibility API is supported (document.hidden) */
  pageVisibilityAPI: boolean;
  /** Whether IntersectionObserver is supported */
  intersectionObserver: boolean;
  /** Whether ResizeObserver is supported */
  resizeObserver: boolean;
  /** Whether localStorage is available and functional */
  localStorage: boolean;
  /** Whether CSS Grid is supported */
  cssGrid: boolean;
  /** Whether CSS Flexbox is supported */
  cssFlexbox: boolean;
}

/**
 * Detect if Page Visibility API is supported
 * Used by useRealTimePolling to pause polling when tab is inactive
 * 
 * @returns true if document.hidden is supported
 */
function detectPageVisibilityAPI(): boolean {
  if (typeof document === 'undefined') return false;
  
  return (
    'hidden' in document ||
    'visibilityState' in document
  );
}

/**
 * Detect if IntersectionObserver is supported
 * Used for lazy loading components below the fold
 * 
 * @returns true if IntersectionObserver constructor exists
 */
function detectIntersectionObserver(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'IntersectionObserver' in window &&
         'IntersectionObserverEntry' in window;
}

/**
 * Detect if ResizeObserver is supported
 * Used for responsive component behavior and dynamic sizing
 * 
 * @returns true if ResizeObserver constructor exists
 */
function detectResizeObserver(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ResizeObserver' in window &&
         typeof ResizeObserver === 'function';
}

/**
 * Detect if localStorage is available and functional
 * Used by i18n context to persist language preference
 * 
 * Tests both existence and functionality (some browsers block in private mode)
 * 
 * @returns true if localStorage is available and can read/write
 */
function detectLocalStorage(): boolean {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return false;
  }
  
  try {
    const testKey = '__feature_detection_test__';
    localStorage.setItem(testKey, 'test');
    const value = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return value === 'test';
  } catch {
    // localStorage may be blocked (private mode, security settings, quota exceeded)
    return false;
  }
}

/**
 * Detect if CSS Grid is supported
 * Modern browsers all support this, but we check for completeness
 * 
 * @returns true if CSS Grid is supported
 */
function detectCSSGrid(): boolean {
  if (typeof window === 'undefined') return true; // SSR default
  
  return CSS.supports('display', 'grid');
}

/**
 * Detect if CSS Flexbox is supported
 * Modern browsers all support this, but we check for completeness
 * 
 * @returns true if CSS Flexbox is supported
 */
function detectCSSFlexbox(): boolean {
  if (typeof window === 'undefined') return true; // SSR default
  
  return CSS.supports('display', 'flex');
}

/**
 * Run all feature detection tests
 * 
 * @returns Object containing detection results for all features
 */
export function detectFeatures(): FeatureSupport {
  return {
    pageVisibilityAPI: detectPageVisibilityAPI(),
    intersectionObserver: detectIntersectionObserver(),
    resizeObserver: detectResizeObserver(),
    localStorage: detectLocalStorage(),
    cssGrid: detectCSSGrid(),
    cssFlexbox: detectCSSFlexbox(),
  };
}

/**
 * Cached feature detection results
 * Tests are run once on first access to avoid repeated checks
 */
let cachedFeatures: FeatureSupport | null = null;

/**
 * Get cached feature detection results
 * Runs detection on first call, then returns cached results
 * 
 * @returns Feature support object
 */
export function getFeatures(): FeatureSupport {
  if (!cachedFeatures) {
    cachedFeatures = detectFeatures();
    
    // Log warnings for unsupported features
    if (!cachedFeatures.pageVisibilityAPI) {
      console.warn('[Feature Detection] Page Visibility API not supported - polling will remain active when tab is inactive');
    }
    if (!cachedFeatures.intersectionObserver) {
      console.warn('[Feature Detection] IntersectionObserver not supported - lazy loading will load all content immediately');
    }
    if (!cachedFeatures.resizeObserver) {
      console.warn('[Feature Detection] ResizeObserver not supported - responsive behavior may be degraded');
    }
    if (!cachedFeatures.localStorage) {
      console.warn('[Feature Detection] localStorage not available - language preference will not persist');
    }
    if (!cachedFeatures.cssGrid) {
      console.warn('[Feature Detection] CSS Grid not supported - layout may be degraded');
    }
    if (!cachedFeatures.cssFlexbox) {
      console.warn('[Feature Detection] CSS Flexbox not supported - layout may be degraded');
    }
  }
  
  return cachedFeatures;
}

/**
 * Safe localStorage wrapper with automatic fallback to in-memory storage
 * 
 * When localStorage is not available:
 * - Reads/writes use an in-memory Map
 * - Data persists only for the current session
 * - No errors are thrown
 */
class SafeStorage {
  private memoryStore = new Map<string, string>();
  private useLocalStorage: boolean;

  constructor() {
    this.useLocalStorage = detectLocalStorage();
  }

  /**
   * Get an item from storage
   * Fallback: Returns null if item doesn't exist
   * 
   * @param key - Storage key
   * @returns Stored value or null
   */
  getItem(key: string): string | null {
    if (this.useLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('[SafeStorage] localStorage.getItem failed:', error);
        return this.memoryStore.get(key) ?? null;
      }
    }
    
    return this.memoryStore.get(key) ?? null;
  }

  /**
   * Set an item in storage
   * Fallback: Stores in memory if localStorage unavailable
   * 
   * @param key - Storage key
   * @param value - Value to store
   */
  setItem(key: string, value: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.warn('[SafeStorage] localStorage.setItem failed, using memory fallback:', error);
      }
    }
    
    // Fallback to memory store
    this.memoryStore.set(key, value);
  }

  /**
   * Remove an item from storage
   * Fallback: Removes from memory if localStorage unavailable
   * 
   * @param key - Storage key
   */
  removeItem(key: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(key);
        return;
      } catch (error) {
        console.warn('[SafeStorage] localStorage.removeItem failed:', error);
      }
    }
    
    this.memoryStore.delete(key);
  }

  /**
   * Clear all items from storage
   * Fallback: Clears memory store if localStorage unavailable
   */
  clear(): void {
    if (this.useLocalStorage) {
      try {
        localStorage.clear();
        return;
      } catch (error) {
        console.warn('[SafeStorage] localStorage.clear failed:', error);
      }
    }
    
    this.memoryStore.clear();
  }
}

/**
 * Global safe storage instance
 * Use this instead of direct localStorage access for automatic fallback support
 * 
 * @example
 * ```typescript
 * import { storage } from '@/lib/utils/feature-detection';
 * 
 * // These work even when localStorage is unavailable
 * storage.setItem('language', 'en');
 * const lang = storage.getItem('language');
 * storage.removeItem('language');
 * ```
 */
export const storage = new SafeStorage();

/**
 * ResizeObserver polyfill using window resize event
 * 
 * Provides a simplified ResizeObserver interface for browsers that don't support it.
 * Falls back to monitoring window resize events with debouncing.
 * 
 * Note: This is a basic polyfill that observes window resizes, not individual element resizes.
 * For production use with legacy browsers, consider a full polyfill like @juggle/resize-observer.
 */
class ResizeObserverPolyfill {
  private callbacks = new Map<Element, ResizeObserverCallback>();
  private resizeHandler: (() => void) | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  /**
   * Observe an element for size changes
   * Fallback: Observes window resize events instead of element-specific changes
   * 
   * @param target - Element to observe
   * @param callback - Callback to execute on resize
   */
  observe(target: Element, callback: ResizeObserverCallback): void {
    this.callbacks.set(target, callback);

    // Set up window resize listener if not already set
    if (!this.resizeHandler) {
      this.resizeHandler = () => {
        // Debounce resize events
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
          // Trigger all callbacks
          this.callbacks.forEach((cb, element) => {
            try {
              const entry = {
                target: element,
                contentRect: element.getBoundingClientRect(),
                borderBoxSize: [] as any,
                contentBoxSize: [] as any,
                devicePixelContentBoxSize: [] as any,
              };
              cb([entry] as any, this as any);
            } catch (error) {
              console.error('[ResizeObserverPolyfill] Error in callback:', error);
            }
          });
        }, 150); // 150ms debounce
      };

      window.addEventListener('resize', this.resizeHandler);
    }
  }

  /**
   * Stop observing an element
   * 
   * @param target - Element to stop observing
   */
  unobserve(target: Element): void {
    this.callbacks.delete(target);

    // Clean up listener if no more elements are being observed
    if (this.callbacks.size === 0 && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  /**
   * Disconnect and stop observing all elements
   */
  disconnect(): void {
    this.callbacks.clear();
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

/**
 * Get ResizeObserver with automatic fallback
 * 
 * Returns native ResizeObserver if supported, otherwise returns a polyfill
 * that monitors window resize events.
 * 
 * @returns ResizeObserver constructor (native or polyfill)
 * 
 * @example
 * ```typescript
 * import { getSafeResizeObserver } from '@/lib/utils/feature-detection';
 * 
 * const ResizeObserver = getSafeResizeObserver();
 * const observer = new ResizeObserver((entries) => {
 *   entries.forEach(entry => {
 *     console.log('Size changed:', entry.contentRect);
 *   });
 * });
 * 
 * observer.observe(element);
 * ```
 */
export function getSafeResizeObserver(): typeof ResizeObserver {
  if (typeof window === 'undefined') {
    // SSR: Return a no-op implementation
    return class NoOpResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
  }

  if (detectResizeObserver()) {
    return ResizeObserver;
  }

  console.warn('[Feature Detection] Using ResizeObserver polyfill - only window resize events are monitored');
  return ResizeObserverPolyfill as any;
}

/**
 * Safe Page Visibility API wrapper
 * 
 * Provides methods to check page visibility with automatic fallback
 * when Page Visibility API is not supported.
 * 
 * Fallback behavior:
 * - Always returns false for isHidden() (assumes page is visible)
 * - Listeners are registered but never called
 */
export const pageVisibility = {
  /**
   * Check if the page is currently hidden
   * Fallback: Always returns false (assumes page is visible)
   * 
   * @returns true if page is hidden, false otherwise
   */
  isHidden(): boolean {
    if (typeof document === 'undefined') return false;
    
    const features = getFeatures();
    if (!features.pageVisibilityAPI) {
      return false; // Assume visible if API not supported
    }

    return document.hidden;
  },

  /**
   * Add a listener for visibility changes
   * Fallback: No-op if API not supported
   * 
   * @param callback - Function to call when visibility changes
   */
  addListener(callback: () => void): void {
    if (typeof document === 'undefined') return;
    
    const features = getFeatures();
    if (!features.pageVisibilityAPI) {
      console.warn('[Page Visibility] API not supported, listener will never be called');
      return;
    }

    document.addEventListener('visibilitychange', callback);
  },

  /**
   * Remove a visibility change listener
   * 
   * @param callback - Function to remove
   */
  removeListener(callback: () => void): void {
    if (typeof document === 'undefined') return;
    
    const features = getFeatures();
    if (!features.pageVisibilityAPI) return;

    document.removeEventListener('visibilitychange', callback);
  },
};

/**
 * Browser support requirements documentation
 * 
 * Modern browsers (latest 2 versions) fully support:
 * - CSS Grid Layout (since 2017)
 * - CSS Flexbox (since 2015)
 * - Page Visibility API (since 2013)
 * - IntersectionObserver (since 2019)
 * - localStorage (since 2009)
 * 
 * Supported browsers:
 * - Chrome/Edge: Latest 2 versions
 * - Firefox: Latest 2 versions
 * - Safari: Latest 2 versions (macOS and iOS)
 * 
 * Graceful degradation for older browsers:
 * - Page Visibility: Polling continues when tab inactive
 * - IntersectionObserver: All content loads immediately
 * - localStorage: In-memory storage (no persistence)
 * - CSS Grid/Flexbox: Modern browsers support these natively
 */
export const BROWSER_SUPPORT = {
  minimum: {
    chrome: 88, // Released Jan 2021
    firefox: 84, // Released Dec 2020
    safari: 14, // Released Sep 2020
    edge: 88, // Released Jan 2021
  },
  recommended: {
    chrome: 'latest 2 versions',
    firefox: 'latest 2 versions',
    safari: 'latest 2 versions',
    edge: 'latest 2 versions',
  },
} as const;
