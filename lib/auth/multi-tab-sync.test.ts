/**
 * Tests for Multi-Tab Synchronization
 * 
 * Simple smoke tests to verify the module loads and basic functionality works
 */

import { describe, it, expect } from 'vitest';
import { multiTabSync } from './multi-tab-sync';

describe('MultiTabSync', () => {
  it('should export multiTabSync singleton', () => {
    expect(multiTabSync).toBeDefined();
    expect(multiTabSync.notifyTokenRefreshed).toBeDefined();
    expect(multiTabSync.notifyLogout).toBeDefined();
    expect(multiTabSync.destroy).toBeDefined();
  });

  it('should have notifyTokenRefreshed method', () => {
    expect(typeof multiTabSync.notifyTokenRefreshed).toBe('function');
  });

  it('should have notifyLogout method', () => {
    expect(typeof multiTabSync.notifyLogout).toBe('function');
  });

  it('should have destroy method', () => {
    expect(typeof multiTabSync.destroy).toBe('function');
  });

  it('should not throw when calling methods in test environment', () => {
    expect(() => multiTabSync.notifyTokenRefreshed()).not.toThrow();
    expect(() => multiTabSync.notifyLogout('test')).not.toThrow();
    expect(() => multiTabSync.destroy()).not.toThrow();
  });
});
