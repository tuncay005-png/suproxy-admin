/**
 * Login API Route
 * 
 * POST /api/auth/login
 * 
 * This endpoint acts as a proxy between the frontend and the backend Go API.
 * It handles the authentication flow by:
 * 1. Forwarding credentials to the backend API
 * 2. Extracting the access_token from the backend response
 * 3. Setting it as an httpOnly session_token cookie
 * 4. Returning user information to the frontend
 * 
 * ## Architecture
 * 
 * Frontend → Next.js API Route → Backend Go API
 *                ↓
 *        Set httpOnly cookie
 *                ↓
 *        Return user data
 * 
 * ## Security
 * 
 * - Session token stored in httpOnly cookie (prevents XSS)
 * - Cookie set server-side only (not accessible to client JavaScript)
 * - Uses secure flag in production (HTTPS-only)
 * - Backend credentials never exposed to client
 * 
 * @module app/api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_CONFIG, REFRESH_COOKIE_CONFIG } from '@/lib/auth/session';
import type { LoginCredentials, BackendLoginResponse } from '@/types/auth';

/**
 * POST handler for login
 * 
 * Authenticates user credentials with the backend API and establishes a session.
 * 
 * @param request - The incoming Next.js request containing credentials
 * @returns JSON response with user data or error
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const response = await fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, password }),
 * });
 * const data = await response.json();
 * // { user: { id, email, name, role } }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Parse credentials from request body
    const credentials: LoginCredentials = await request.json();
    
    console.log('[LOGIN-ROUTE] Received login request for:', credentials.email);

    // Get backend API URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backendUrl) {
      console.error('[LOGIN-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward credentials to backend API
    const backendEndpoint = `${backendUrl}/api/v1/auth/login`;
    console.log('[LOGIN-ROUTE] Forwarding to backend:', backendEndpoint);
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('[LOGIN-ROUTE] Backend response status:', backendResponse.status);

    // Handle backend errors
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[LOGIN-ROUTE] Backend authentication failed:', errorData);
      
      return NextResponse.json(
        { error: errorData.message || 'Authentication failed' },
        { status: backendResponse.status }
      );
    }

    // Parse backend response
    const backendData: BackendLoginResponse = await backendResponse.json();
    console.log('[LOGIN-ROUTE] Backend authentication successful');
    console.log('[LOGIN-ROUTE] User:', backendData.data.user.email);

    // Extract access token and user data
    const { access_token, refresh_token, user } = backendData.data;

    // Create response with user data
    const response = NextResponse.json({
      user,
    });

    // Set session cookie with access token
    // This cookie will be httpOnly and only accessible by the server
    response.cookies.set(SESSION_COOKIE_CONFIG.name, access_token, {
      httpOnly: SESSION_COOKIE_CONFIG.httpOnly,
      secure: SESSION_COOKIE_CONFIG.secure,
      sameSite: SESSION_COOKIE_CONFIG.sameSite,
      path: SESSION_COOKIE_CONFIG.path,
      // Cookie will persist for the session (browser lifetime)
      // Backend token expiration is managed by the backend
    });

    // Set refresh token cookie (refresh_token) - 7 days
    response.cookies.set(
      REFRESH_COOKIE_CONFIG.name,
      refresh_token,
      REFRESH_COOKIE_CONFIG
    );

    console.log('[LOGIN-ROUTE] Both authentication cookies set successfully');

    return response;
  } catch (error) {
    console.error('[LOGIN-ROUTE] Login error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
