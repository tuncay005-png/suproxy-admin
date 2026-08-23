/**
 * Fast Cookie Helpers for API Routes
 * 
 * Provides optimized cookie parsing from Request headers.
 * Avoids the async overhead of Next.js 15+ cookies() API.
 * 
 * @module lib/auth/cookie-helpers
 */

import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_CONFIG } from './session';

/**
 * Parse cookie string into key-value map
 * @param cookieHeader - Cookie header string
 * @returns Map of cookie name to value
 */
function parseCookies(cookieHeader: string): Map<string, string> {
  const cookies = new Map<string, string>();
  
  if (!cookieHeader) {
    return cookies;
  }
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies.set(name, rest.join('='));
    }
  });
  
  return cookies;
}

/**
 * Get session token from request headers (fast, synchronous)
 * Alternative to await cookies() which adds significant latency in Next.js 15+
 * 
 * @param request - NextRequest object
 * @returns Session token string or null
 * 
 * @example
 * ```typescript
 * const sessionToken = getSessionTokenFromRequest(request);
 * if (!sessionToken) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * ```
 */
export function getSessionTokenFromRequest(request: NextRequest): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = parseCookies(cookieHeader);
  return cookies.get(SESSION_COOKIE_CONFIG.name) || null;
}

/**
 * Get any cookie value from request headers (fast, synchronous)
 * 
 * @param request - NextRequest object
 * @param name - Cookie name
 * @returns Cookie value or null
 */
export function getCookieFromRequest(request: NextRequest, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = parseCookies(cookieHeader);
  return cookies.get(name) || null;
}
