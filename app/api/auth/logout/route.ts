/**
 * Logout API Route
 * 
 * POST /api/auth/logout
 * 
 * This endpoint handles user logout by clearing the session cookie.
 * 
 * ## Behavior
 * 
 * 1. Clears the session_token cookie by setting it with an expired date
 * 2. Uses the same cookie configuration as session management for consistency
 * 3. Returns a success response
 * 
 * ## Security
 * 
 * - Sets httpOnly flag to prevent client-side JavaScript access
 * - Uses secure flag in production for HTTPS-only transmission
 * - Sets expires to epoch (new Date(0)) to immediately invalidate the cookie
 * 
 * @module app/api/auth/logout
 */

import { NextResponse } from 'next/server';
import { SESSION_COOKIE_CONFIG, REFRESH_COOKIE_CONFIG } from '@/lib/auth/session';

/**
 * POST handler for logout
 * 
 * Clears the session cookie and returns a success response.
 * 
 * @returns JSON response with success status
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const response = await fetch('/api/auth/logout', {
 *   method: 'POST',
 *   credentials: 'include',
 * });
 * const data = await response.json();
 * // { success: true, message: 'Logged out successfully' }
 * ```
 */
export async function POST() {
  // Create success response
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear access token cookie (session_token)
  response.cookies.set(SESSION_COOKIE_CONFIG.name, '', {
    httpOnly: SESSION_COOKIE_CONFIG.httpOnly,
    secure: SESSION_COOKIE_CONFIG.secure,
    sameSite: SESSION_COOKIE_CONFIG.sameSite,
    path: SESSION_COOKIE_CONFIG.path,
    maxAge: 0,
    expires: new Date(0),
  });


  // Clear refresh token cookie (refresh_token)
  response.cookies.set(REFRESH_COOKIE_CONFIG.name, '', {
    httpOnly: REFRESH_COOKIE_CONFIG.httpOnly,
    secure: REFRESH_COOKIE_CONFIG.secure,
    sameSite: REFRESH_COOKIE_CONFIG.sameSite,
    path: REFRESH_COOKIE_CONFIG.path,
    maxAge: 0,
    expires: new Date(0),
  });

  console.log('[LOGOUT-ROUTE] Both authentication cookies cleared');

  return response;
}
