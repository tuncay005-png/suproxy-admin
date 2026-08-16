/**
 * Session Management Utilities
 * 
 * This module provides utilities for handling session cookies and authentication state.
 * 
 * ## Session Cookie Strategy
 * 
 * The application uses httpOnly cookies for secure session management:
 * 
 * - **Cookie Name**: `session_token`
 * - **httpOnly**: `true` - Prevents client-side JavaScript access (XSS protection)
 * - **secure**: `true` in production - Ensures cookies are only sent over HTTPS
 * - **sameSite**: `lax` - Provides CSRF protection while allowing normal navigation
 * - **path**: `/` - Cookie is available for all routes
 * - **Expiration**: Defined by backend JWT expiration
 * 
 * ## Security Considerations
 * 
 * 1. **XSS Protection**: The httpOnly flag prevents malicious scripts from accessing the session token
 * 2. **CSRF Protection**: The sameSite attribute provides protection against cross-site request forgery
 * 3. **Transport Security**: The secure flag ensures tokens are only transmitted over encrypted connections in production
 * 4. **No localStorage**: Session tokens are NEVER stored in localStorage to prevent XSS attacks
 * 
 * ## Architecture
 * 
 * - **Server-Side**: Session cookies are set by the backend API on successful authentication
 * - **Client-Side**: These utilities provide helper functions for session state management
 * - **Middleware**: Next.js middleware validates session cookies on protected routes
 * 
 * @module lib/auth/session
 */

import type { Session, UserInfo } from '@/types/auth';

/**
 * Session cookie configuration constants
 */
export const SESSION_COOKIE_NAME = 'session_token';

/**
 * Session cookie configuration object
 * Used by API routes and middleware to maintain consistent cookie settings
 */
export const SESSION_COOKIE_CONFIG = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
} as const;

/**
 * Check if a session token exists in the request cookies
 * 
 * Note: This is a client-side utility. For server-side validation,
 * use Next.js middleware or server actions.
 * 
 * @returns True if session token cookie exists
 * 
 * @example
 * ```typescript
 * if (hasSessionCookie()) {
 *   console.log('User is authenticated');
 * }
 * ```
 */
export function hasSessionCookie(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return document.cookie
    .split('; ')
    .some(cookie => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));
}

/**
 * Get session expiration from a session object
 * 
 * @param session - The session object
 * @returns Date object representing when the session expires, or null if invalid
 * 
 * @example
 * ```typescript
 * const expiresAt = getSessionExpiration(session);
 * if (expiresAt && expiresAt < new Date()) {
 *   console.log('Session has expired');
 * }
 * ```
 */
export function getSessionExpiration(session: Session | null): Date | null {
  if (!session?.expiresAt) {
    return null;
  }
  
  try {
    return new Date(session.expiresAt);
  } catch {
    return null;
  }
}

/**
 * Check if a session has expired
 * 
 * @param session - The session object to check
 * @returns True if the session has expired or is invalid
 * 
 * @example
 * ```typescript
 * if (isSessionExpired(session)) {
 *   // Redirect to login
 * }
 * ```
 */
export function isSessionExpired(session: Session | null): boolean {
  const expiresAt = getSessionExpiration(session);
  if (!expiresAt) {
    return true;
  }
  
  return expiresAt < new Date();
}

/**
 * Extract user information from a session
 * 
 * @param session - The session object
 * @returns User information or null if session is invalid
 * 
 * @example
 * ```typescript
 * const user = getSessionUser(session);
 * if (user) {
 *   console.log(`Welcome, ${user.name}`);
 * }
 * ```
 */
export function getSessionUser(session: Session | null): UserInfo | null {
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

/**
 * Validate session object structure
 * 
 * @param session - The object to validate
 * @returns True if the object has the structure of a valid session
 * 
 * @example
 * ```typescript
 * if (isValidSessionStructure(data)) {
 *   // Process session data
 * }
 * ```
 */
export function isValidSessionStructure(session: unknown): session is Session {
  if (!session || typeof session !== 'object') {
    return false;
  }
  
  const s = session as Record<string, unknown>;
  
  // Check for required session properties
  if (!s.user || typeof s.user !== 'object') {
    return false;
  }
  
  if (typeof s.expiresAt !== 'string') {
    return false;
  }
  
  // Check for required user properties
  const user = s.user as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    typeof user.role === 'string'
  );
}

/**
 * Create a session object from user info and expiration
 * 
 * @param user - User information
 * @param expiresAt - Session expiration date/time
 * @returns A properly structured session object
 * 
 * @example
 * ```typescript
 * const session = createSession(userInfo, '2024-12-31T23:59:59Z');
 * ```
 */
export function createSession(user: UserInfo, expiresAt: string): Session {
  return {
    user,
    expiresAt,
  };
}

/**
 * Get the time remaining until session expires
 * 
 * @param session - The session object
 * @returns Milliseconds until expiration, or 0 if expired/invalid
 * 
 * @example
 * ```typescript
 * const timeRemaining = getSessionTimeRemaining(session);
 * console.log(`Session expires in ${Math.floor(timeRemaining / 60000)} minutes`);
 * ```
 */
export function getSessionTimeRemaining(session: Session | null): number {
  const expiresAt = getSessionExpiration(session);
  if (!expiresAt) {
    return 0;
  }
  
  const remaining = expiresAt.getTime() - Date.now();
  return Math.max(0, remaining);
}

/**
 * Format session expiration for display
 * 
 * @param session - The session object
 * @returns Formatted expiration string or 'Invalid session'
 * 
 * @example
 * ```typescript
 * const expirationText = formatSessionExpiration(session);
 * // Returns: "Expires at 11:30 PM on 12/31/2024"
 * ```
 */
export function formatSessionExpiration(session: Session | null): string {
  const expiresAt = getSessionExpiration(session);
  if (!expiresAt) {
    return 'Invalid session';
  }
  
  return `Expires at ${expiresAt.toLocaleTimeString()} on ${expiresAt.toLocaleDateString()}`;
}
