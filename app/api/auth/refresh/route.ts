/**
 * Token Refresh API Route
 * 
 * POST /api/auth/refresh
 * 
 * This Route Handler performs token refresh by calling the backend refresh endpoint
 * with the refresh token from cookies. It handles token rotation and cookie updates.
 * 
 * ## Architecture
 * 
 * Frontend → /api/auth/refresh → Backend /api/v1/auth/refresh
 *                ↓
 *        Set new httpOnly cookies (access_token + refresh_token)
 *                ↓
 *        Return success/failure
 * \n * ## Security
 * 
 * - Refresh token stored in httpOnly cookie
 * - New tokens rotated on each refresh (backend handles rotation)
 * - Cookies cleared on refresh failure
 * 
 * @module app/api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG, REFRESH_COOKIE_CONFIG } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    console.log('[REFRESH-ROUTE] Token refresh request received');
    
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_CONFIG.name);

    if (!refreshToken) {
      console.error('[REFRESH-ROUTE] No refresh token found in cookies');
      return NextResponse.json(
        { success: false, error: 'No refresh token' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backendUrl) {
      console.error('[REFRESH-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const backendEndpoint = `${backendUrl}/api/v1/auth/refresh`;
    console.log('[REFRESH-ROUTE] Calling backend refresh endpoint');

    const backendResponse = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken.value,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[REFRESH-ROUTE] Backend refresh failed:', backendResponse.status, errorData);

      const response = NextResponse.json(
        { success: false, error: 'Token refresh failed' },
        { status: 401 }
      );

      response.cookies.set(SESSION_COOKIE_CONFIG.name, '', {
        ...SESSION_COOKIE_CONFIG,
        maxAge: 0,
        expires: new Date(0),
      });
      response.cookies.set(REFRESH_COOKIE_CONFIG.name, '', {
        ...REFRESH_COOKIE_CONFIG,
        maxAge: 0,
        expires: new Date(0),
      });

      return response;
    }

    const data = await backendResponse.json();
    const { access_token, refresh_token } = data.data;

    console.log('[REFRESH-ROUTE] Backend refresh successful, setting new cookies');

    const response = NextResponse.json({ success: true });

    response.cookies.set(
      SESSION_COOKIE_CONFIG.name,
      access_token,
      SESSION_COOKIE_CONFIG
    );

    response.cookies.set(
      REFRESH_COOKIE_CONFIG.name,
      refresh_token,
      REFRESH_COOKIE_CONFIG
    );

    console.log('[REFRESH-ROUTE] New tokens set successfully');

    return response;
  } catch (error) {
    console.error('[REFRESH-ROUTE] Unexpected error during token refresh:', error);
    
    const response = NextResponse.json(
      { success: false, error: 'Refresh failed' },
      { status: 500 }
    );

    response.cookies.set(SESSION_COOKIE_CONFIG.name, '', {
      ...SESSION_COOKIE_CONFIG,
      maxAge: 0,
      expires: new Date(0),
    });
    response.cookies.set(REFRESH_COOKIE_CONFIG.name, '', {
      ...REFRESH_COOKIE_CONFIG,
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  }
}