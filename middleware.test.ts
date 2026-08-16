/**
 * Authentication Middleware Tests
 * 
 * Tests verify the middleware correctly handles:
 * - Route protection for /admin/* routes
 * - Authentication redirects
 * - Session token validation
 * 
 * @see Requirements 2.1, 2.2, 2.3, 2.5
 */

import { describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware, config } from './middleware';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

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
      value: 'mock-session-token',
    } as { name: string; value: string });
  } else {
    vi.spyOn(request.cookies, 'get').mockReturnValue(undefined);
  }

  return request;
}

describe('Authentication Middleware', () => {
  describe('Route Protection', () => {
    it('should redirect unauthenticated users from /admin to /login', () => {
      const request = createRequest('/admin', false);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307); // Temporary redirect
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should redirect unauthenticated users from /admin/users to /login', () => {
      const request = createRequest('/admin/users', false);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should redirect unauthenticated users from /admin/users/new to /login', () => {
      const request = createRequest('/admin/users/new', false);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should allow authenticated users to access /admin', () => {
      const request = createRequest('/admin', true);
      const response = middleware(request);

      // NextResponse.next() creates a response that passes through
      expect(response).toBeInstanceOf(NextResponse);
      // Should not be a redirect
      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should allow authenticated users to access /admin/users', () => {
      const request = createRequest('/admin/users', true);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should preserve the intended destination in the from parameter', () => {
      const request = createRequest('/admin/users/new', false);
      const response = middleware(request);

      const location = response.headers.get('location');
      expect(location).toBeDefined();
      expect(location).toContain('/login');
      expect(location).toContain('from=%2Fadmin%2Fusers%2Fnew');
    });
  });

  describe('Login Page Redirect', () => {
    it('should redirect authenticated users from /login to /admin', () => {
      const request = createRequest('/login', true);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/admin');
    });

    it('should allow unauthenticated users to access /login', () => {
      const request = createRequest('/login', false);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });

    it('should redirect back to from parameter if present and valid', () => {
      const request = createRequest('/login?from=%2Fadmin%2Fusers', true);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/users');
    });

    it('should default to /admin if from parameter is not an admin route', () => {
      const request = createRequest('/login?from=%2Fhome', true);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin');
      expect(location).not.toContain('/home');
    });
  });

  describe('Session Token Validation', () => {
    it('should check for session_token cookie', () => {
      const request = createRequest('/admin', false);
      const getCookieSpy = vi.spyOn(request.cookies, 'get');
      
      middleware(request);

      expect(getCookieSpy).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    });

    it('should treat missing session token as unauthenticated', () => {
      const request = createRequest('/admin', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should treat present session token as authenticated', () => {
      const request = createRequest('/admin', true);
      const response = middleware(request);

      expect(response.status).not.toBe(307);
      expect(response.status).not.toBe(308);
    });
  });

  describe('Matcher Configuration', () => {
    it('should include /admin/:path* in matcher', () => {
      expect(config.matcher).toContain('/admin/:path*');
    });

    it('should include /login in matcher', () => {
      expect(config.matcher).toContain('/login');
    });

    it('should have exactly 2 matcher patterns', () => {
      expect(config.matcher).toHaveLength(2);
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
      const request = createRequest('/admin/users/123/edit', false);
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle /login with query parameters', () => {
      const request = createRequest('/login?error=invalid', false);
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307);
    });

    it('should handle /login with hash fragments in from parameter', () => {
      const request = createRequest('/login?from=%2Fadmin%23section', true);
      const response = middleware(request);

      expect(response.status).toBe(307);
      // Should still redirect to admin route
      const location = response.headers.get('location');
      expect(location).toContain('/admin');
    });
  });
});
