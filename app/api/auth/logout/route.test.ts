/**
 * Logout API Route Tests
 * 
 * Tests verify the logout endpoint correctly handles:
 * - Clearing session cookies
 * - Returning success responses
 * - Using correct cookie configuration
 * 
 * @see Requirements 2.4, 2.5
 */

import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

describe('POST /api/auth/logout', () => {
  describe('Response', () => {
    it('should return a success response', async () => {
      const response = await POST();
      const data = await response.json();

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
    });

    it('should return valid JSON', async () => {
      const response = await POST();
      const contentType = response.headers.get('content-type');

      expect(contentType).toContain('application/json');
    });
  });

  describe('Cookie Handling', () => {
    it('should clear the session_token cookie', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader).toContain(SESSION_COOKIE_NAME);
    });

    it('should set cookie with expired date', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      // Should contain either "Expires=Thu, 01 Jan 1970" or "expires=Thu, 01 Jan 1970"
      expect(setCookieHeader!.toLowerCase()).toContain('expires=thu, 01 jan 1970');
    });

    it('should set httpOnly flag', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader!.toLowerCase()).toContain('httponly');
    });

    it('should set correct path', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader!.toLowerCase()).toContain(`path=${SESSION_COOKIE_CONFIG.path}`);
    });

    it('should set correct sameSite attribute', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader!.toLowerCase()).toContain(`samesite=${SESSION_COOKIE_CONFIG.sameSite}`);
    });

    it('should set secure flag based on environment', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      
      // In development, secure flag should match SESSION_COOKIE_CONFIG
      if (SESSION_COOKIE_CONFIG.secure) {
        expect(setCookieHeader!.toLowerCase()).toContain('secure');
      }
    });

    it('should set empty cookie value', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      // Cookie should be set to empty string: session_token=;
      expect(setCookieHeader).toMatch(new RegExp(`${SESSION_COOKIE_NAME}=;`));
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent - multiple calls should succeed', async () => {
      const response1 = await POST();
      const response2 = await POST();
      const response3 = await POST();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response3.status).toBe(200);
    });

    it('should return same response structure on repeated calls', async () => {
      const response1 = await POST();
      const response2 = await POST();
      
      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1).toEqual(data2);
    });
  });

  describe('Cookie Configuration Consistency', () => {
    it('should use SESSION_COOKIE_CONFIG values', async () => {
      const response = await POST();
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toBeDefined();
      
      // Verify all config values are present
      expect(setCookieHeader!.toLowerCase()).toContain(SESSION_COOKIE_NAME.toLowerCase());
      expect(setCookieHeader!.toLowerCase()).toContain('httponly');
      expect(setCookieHeader!.toLowerCase()).toContain(`path=${SESSION_COOKIE_CONFIG.path}`);
      expect(setCookieHeader!.toLowerCase()).toContain(`samesite=${SESSION_COOKIE_CONFIG.sameSite}`);
    });
  });
});
