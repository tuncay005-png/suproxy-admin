/**
 * Middleware Authentication Tests
 * 
 * Task 18.3: Test authentication and session handling - Middleware redirects
 * 
 * This test suite verifies:
 * 1. Session expiry redirects to login page (middleware behavior)
 * 2. Unauthenticated users are redirected from protected routes
 * 3. Authenticated users are redirected away from login page
 * 4. Existing authentication functionality still works
 * 
 * Requirements: 18.8-18.9
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware, config } from './middleware';
import { SESSION_COOKIE_NAME } from './lib/auth/session';

/**
 * Helper function to create a mock NextRequest
 */
function createRequest(pathname: string, hasSession: boolean = false): NextRequest {
  const url = `http://localhost:3000${pathname}`;
  const request = new NextRequest(url);

  // Mock cookies.get to return session token if hasSession is true
  if (hasSession) {
    vi.spyOn(request.cookies, 'get').mockReturnValue({
      name: SESSION_COOKIE_NAME,
      value: 'mock-session-token-abc123',
    } as { name: string; value: string });
  } else {
    vi.spyOn(request.cookies, 'get').mockReturnValue(undefined);
  }

  return request;
}

describe('Middleware Authentication - Session Expiry and Redirects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Expiry Redirects to Login Page', () => {
    it('should redirect to /login when accessing /admin without session', () => {
      const request = createRequest('/admin', false);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Temporary redirect
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('from=%2Fadmin'); // Preserves intended destination
    });

    it('should redirect to /login when accessing /admin/users without session', () => {
      const request = createRequest('/admin/users', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('from=%2Fadmin%2Fusers');
    });

    it('should redirect to /login when accessing /admin/plans without session', () => {
      const request = createRequest('/admin/plans', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('from=%2Fadmin%2Fplans');
    });

    it('should redirect to /login when accessing /admin/monitoring without session', () => {
      const request = createRequest('/admin/monitoring', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });

    it('should redirect to /login when accessing /admin/logs without session', () => {
      const request = createRequest('/admin/logs', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });

    it('should redirect to /login when accessing /admin/sessions without session', () => {
      const request = createRequest('/admin/sessions', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });

    it('should redirect to /login when accessing /admin/servers without session', () => {
      const request = createRequest('/admin/servers', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });

    it('should redirect to /login when accessing nested route /admin/users/123 without session', () => {
      const request = createRequest('/admin/users/123', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('from=%2Fadmin%2Fusers%2F123');
    });

    it('should redirect to /login when accessing nested route /admin/plans/new without session', () => {
      const request = createRequest('/admin/plans/new', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });

    it('should preserve deeply nested paths in from parameter', () => {
      const request = createRequest('/admin/users/123/edit', false);
      const response = middleware(request);

      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('from=%2Fadmin%2Fusers%2F123%2Fedit');
    });
  });

  describe('Authenticated Access to Protected Routes', () => {
    it('should allow access to /admin with valid session', () => {
      const request = createRequest('/admin', true);
      const response = middleware(request);

      // Should not redirect (pass through)
      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow access to /admin/users with valid session', () => {
      const request = createRequest('/admin/users', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow access to /admin/plans with valid session', () => {
      const request = createRequest('/admin/plans', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow access to /admin/monitoring with valid session', () => {
      const request = createRequest('/admin/monitoring', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow access to /admin/logs with valid session', () => {
      const request = createRequest('/admin/logs', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow access to /admin/sessions with valid session', () => {
      const request = createRequest('/admin/sessions', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow access to /admin/servers with valid session', () => {
      const request = createRequest('/admin/servers', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow access to nested routes with valid session', () => {
      const request = createRequest('/admin/users/123/edit', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });
  });

  describe('Login Page Redirect Logic', () => {
    it('should allow unauthenticated access to /login', () => {
      const request = createRequest('/login', false);
      const response = middleware(request);

      // Should allow access (pass through)
      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should redirect authenticated users from /login to /admin', () => {
      const request = createRequest('/login', true);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin');
      expect(location).not.toContain('/login');
    });

    it('should redirect to from parameter if present and valid', () => {
      const request = createRequest('/login?from=%2Fadmin%2Fusers', true);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/users');
    });

    it('should default to /admin if from parameter is not an admin route', () => {
      const request = createRequest('/login?from=%2Fhome', true);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin');
      expect(location).not.toContain('/home');
    });

    it('should handle empty from parameter gracefully', () => {
      const request = createRequest('/login?from=', true);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin');
    });
  });

  describe('Session Token Validation', () => {
    it('should check for session_token cookie', () => {
      const request = createRequest('/admin', false);
      const getCookieSpy = vi.spyOn(request.cookies, 'get');

      middleware(request);

      expect(getCookieSpy).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
      expect(getCookieSpy).toHaveBeenCalledWith('session_token');
    });

    it('should treat missing session token as unauthenticated', () => {
      const request = createRequest('/admin', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
    });

    it('should treat present session token as authenticated', () => {
      const request = createRequest('/admin', true);
      const response = middleware(request);

      // Should not redirect
      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });
  });

  describe('Middleware Configuration', () => {
    it('should include /admin/:path* in matcher config', () => {
      expect(config.matcher).toContain('/admin/:path*');
    });

    it('should include /login in matcher config', () => {
      expect(config.matcher).toContain('/login');
    });

    it('should have exactly 2 matcher patterns', () => {
      expect(config.matcher).toHaveLength(2);
    });

    it('should protect all admin routes with wildcard matcher', () => {
      const testPaths = [
        '/admin',
        '/admin/users',
        '/admin/users/123',
        '/admin/users/123/edit',
        '/admin/plans',
        '/admin/plans/new',
        '/admin/logs',
        '/admin/monitoring',
        '/admin/sessions',
        '/admin/servers',
        '/admin/servers/456',
      ];

      testPaths.forEach((path) => {
        const request = createRequest(path, false);
        const response = middleware(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/login');
      });
    });
  });

  describe('Existing Authentication Functionality', () => {
    it('should maintain route protection behavior', () => {
      const protectedRoutes = [
        '/admin',
        '/admin/users',
        '/admin/plans',
        '/admin/logs',
        '/admin/monitoring',
        '/admin/sessions',
        '/admin/servers',
      ];

      protectedRoutes.forEach((route) => {
        // Without session - should redirect
        const unauthRequest = createRequest(route, false);
        const unauthResponse = middleware(unauthRequest);
        expect(unauthResponse.status).toBe(307);

        // With session - should allow
        const authRequest = createRequest(route, true);
        const authResponse = middleware(authRequest);
        expect(authResponse.status).not.toBe(307);
        expect(authResponse.status).not.toBe(308);
      });
    });

    it('should maintain login page behavior', () => {
      // Unauthenticated - should allow access
      const unauthRequest = createRequest('/login', false);
      const unauthResponse = middleware(unauthRequest);
      expect(unauthResponse.status).not.toBe(307);

      // Authenticated - should redirect to admin
      const authRequest = createRequest('/login', true);
      const authResponse = middleware(authRequest);
      expect(authResponse.status).toBe(307);
      expect(authResponse.headers.get('location')).toContain('/admin');
    });

    it('should maintain from parameter preservation', () => {
      const routes = [
        { path: '/admin/users', expected: 'from=%2Fadmin%2Fusers' },
        { path: '/admin/plans/new', expected: 'from=%2Fadmin%2Fplans%2Fnew' },
        { path: '/admin/logs', expected: 'from=%2Fadmin%2Flogs' },
      ];

      routes.forEach(({ path, expected }) => {
        const request = createRequest(path, false);
        const response = middleware(request);

        const location = response.headers.get('location');
        expect(location).toContain('/login');
        expect(location).toContain(expected);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle /admin route without trailing slash', () => {
      const request = createRequest('/admin', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle deeply nested admin routes', () => {
      const request = createRequest('/admin/users/123/edit/settings', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle /login with query parameters', () => {
      const request = createRequest('/login?error=invalid', false);
      const response = middleware(request);

      // Should allow access to login with query params
      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should handle special characters in from parameter', () => {
      const request = createRequest('/admin/users/test%40email.com', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('from=');
    });
  });
});
