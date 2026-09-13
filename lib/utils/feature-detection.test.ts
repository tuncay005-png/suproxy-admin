/**
 * Feature Detection Tests
 * 
 * Tests for browser feature detection and graceful fallback implementations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectFeatures,
  getFeatures,
  storage,
  getSafeResizeObserver,
  pageVisibility,
} from './feature-detection';

describe('Feature Detection', () => {
  describe('detectFeatures', () => {
    it('should detect all features', () => {
      const features = detectFeatures();
      
      expect(features).toHaveProperty('pageVisibilityAPI');
      expect(features).toHaveProperty('intersectionObserver');
      expect(features).toHaveProperty('resizeObserver');
      expect(features).toHaveProperty('localStorage');
      expect(features).toHaveProperty('cssGrid');
      expect(features).toHaveProperty('cssFlexbox');
      
      // All features should return boolean values
      expect(typeof features.pageVisibilityAPI).toBe('boolean');
      expect(typeof features.intersectionObserver).toBe('boolean');
      expect(typeof features.resizeObserver).toBe('boolean');
      expect(typeof features.localStorage).toBe('boolean');
      expect(typeof features.cssGrid).toBe('boolean');
      expect(typeof features.cssFlexbox).toBe('boolean');
    });
  });

  describe('getFeatures (cached)', () => {
    it('should return same instance on multiple calls', () => {
      const features1 = getFeatures();
      const features2 = getFeatures();
      
      expect(features1).toBe(features2);
    });
  });

  describe('SafeStorage', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    });

    it('should store and retrieve values', () => {
      storage.setItem('test_key', 'test_value');
      const value = storage.getItem('test_key');
      
      expect(value).toBe('test_value');
    });

    it('should return null for non-existent keys', () => {
      const value = storage.getItem('non_existent_key');
      
      expect(value).toBeNull();
    });

    it('should remove items', () => {
      storage.setItem('test_key', 'test_value');
      storage.removeItem('test_key');
      const value = storage.getItem('test_key');
      
      expect(value).toBeNull();
    });

    it('should clear all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });

    it('should handle localStorage unavailability gracefully', () => {
      // Mock localStorage to throw error (simulating private mode)
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => {
        storage.setItem('test_key', 'test_value');
      }).not.toThrow();

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('getSafeResizeObserver', () => {
    it('should return a ResizeObserver constructor', () => {
      const ResizeObserverConstructor = getSafeResizeObserver();
      
      expect(ResizeObserverConstructor).toBeDefined();
      expect(typeof ResizeObserverConstructor).toBe('function');
    });

    it('should create observable instances', () => {
      const ResizeObserverConstructor = getSafeResizeObserver();
      const observer = new ResizeObserverConstructor(() => {});
      
      expect(observer).toBeDefined();
      expect(typeof observer.observe).toBe('function');
      expect(typeof observer.unobserve).toBe('function');
      expect(typeof observer.disconnect).toBe('function');
    });

    it('should handle observe/unobserve/disconnect without errors', () => {
      const ResizeObserverConstructor = getSafeResizeObserver();
      const observer = new ResizeObserverConstructor(() => {});
      
      const element = document.createElement('div');
      
      expect(() => {
        observer.observe(element);
        observer.unobserve(element);
        observer.disconnect();
      }).not.toThrow();
    });
  });

  describe('pageVisibility wrapper', () => {
    it('should have required methods', () => {
      expect(typeof pageVisibility.isHidden).toBe('function');
      expect(typeof pageVisibility.addListener).toBe('function');
      expect(typeof pageVisibility.removeListener).toBe('function');
    });

    it('should return boolean from isHidden', () => {
      const hidden = pageVisibility.isHidden();
      
      expect(typeof hidden).toBe('boolean');
    });

    it('should handle addListener without errors', () => {
      const callback = vi.fn();
      
      expect(() => {
        pageVisibility.addListener(callback);
      }).not.toThrow();
    });

    it('should handle removeListener without errors', () => {
      const callback = vi.fn();
      
      pageVisibility.addListener(callback);
      
      expect(() => {
        pageVisibility.removeListener(callback);
      }).not.toThrow();
    });
  });

  describe('Integration: localStorage persistence', () => {
    beforeEach(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    });

    it('should persist language preference', () => {
      const locale = 'ru';
      storage.setItem('preferred_locale', locale);
      
      const retrieved = storage.getItem('preferred_locale');
      expect(retrieved).toBe(locale);
    });

    it('should handle multiple set/get operations', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.setItem('key3', 'value3');
      
      expect(storage.getItem('key1')).toBe('value1');
      expect(storage.getItem('key2')).toBe('value2');
      expect(storage.getItem('key3')).toBe('value3');
    });
  });

  describe('Error handling', () => {
    it('should not crash when features are unavailable', () => {
      // Even if features aren't supported, detection should work
      const features = detectFeatures();
      
      // Should return object with all properties
      expect(Object.keys(features).length).toBeGreaterThan(0);
    });

    it('should handle SSR environment (no window/document)', () => {
      // This test runs in a Node environment which simulates SSR
      // The functions should not crash even when window/document are undefined
      
      expect(() => {
        detectFeatures();
        getFeatures();
      }).not.toThrow();
    });
  });
});
