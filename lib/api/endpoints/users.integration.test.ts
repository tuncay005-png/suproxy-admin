/**
 * Integration tests for Users API exports
 * Verifies the users API is accessible from different import paths
 */

import { describe, it, expect } from 'vitest';

describe('usersApi exports', () => {
  it('should be importable from endpoints/users', async () => {
    const { usersApi } = await import('./users');
    
    expect(usersApi).toBeDefined();
    expect(usersApi.list).toBeTypeOf('function');
    expect(usersApi.create).toBeTypeOf('function');
  });

  it('should be importable from endpoints/index', async () => {
    const { usersApi } = await import('./index');
    
    expect(usersApi).toBeDefined();
    expect(usersApi.list).toBeTypeOf('function');
    expect(usersApi.create).toBeTypeOf('function');
  });

  it('should be importable from lib/api/index', async () => {
    const { usersApi } = await import('../index');
    
    expect(usersApi).toBeDefined();
    expect(usersApi.list).toBeTypeOf('function');
    expect(usersApi.create).toBeTypeOf('function');
  });

  it('should have consistent exports across all paths', async () => {
    const { usersApi: fromDirect } = await import('./users');
    const { usersApi: fromEndpoints } = await import('./index');
    const { usersApi: fromApi } = await import('../index');
    
    expect(fromDirect).toBe(fromEndpoints);
    expect(fromEndpoints).toBe(fromApi);
  });
});
