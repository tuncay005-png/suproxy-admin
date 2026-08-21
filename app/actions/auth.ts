'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_CONFIG, REFRESH_COOKIE_CONFIG } from '@/lib/auth/session';

/**
 * Refresh access token using refresh token
 */
export async function refreshTokenAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_CONFIG.name);

    if (!refreshToken) {
      console.error('[REFRESH-ACTION] No refresh token found');
      return { success: false };
    }

    console.log('[REFRESH-ACTION] Attempting token refresh...');

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backendUrl) {
      console.error('[REFRESH-ACTION] NEXT_PUBLIC_API_BASE_URL not configured');
      return { success: false };
    }

    const backendResponse = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken.value,
      }),
    });

    if (!backendResponse.ok) {
      console.error('[REFRESH-ACTION] Backend refresh failed:', backendResponse.status);
      
      // Clear cookies on failure
      cookieStore.set(SESSION_COOKIE_CONFIG.name, '', {
        ...SESSION_COOKIE_CONFIG,
        maxAge: 0,
        expires: new Date(0),
      });
      cookieStore.set(REFRESH_COOKIE_CONFIG.name, '', {
        ...REFRESH_COOKIE_CONFIG,
        maxAge: 0,
        expires: new Date(0),
      });
      
      return { success: false };
    }

    const data = await backendResponse.json();
    const { access_token, refresh_token } = data.data;

    // Set new tokens (rotation)
    cookieStore.set(SESSION_COOKIE_CONFIG.name, access_token, SESSION_COOKIE_CONFIG);
    cookieStore.set(REFRESH_COOKIE_CONFIG.name, refresh_token, REFRESH_COOKIE_CONFIG);

    console.log('[REFRESH-ACTION] Tokens refreshed successfully');
    
    return { success: true };
  } catch (error) {
    console.error('[REFRESH-ACTION] Error:', error);
    return { success: false };
  }
}

/**
 * Clear auth cookies and redirect to login
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_CONFIG.name, '', {
    ...SESSION_COOKIE_CONFIG,
    maxAge: 0,
    expires: new Date(0),
  });
  
  cookieStore.set(REFRESH_COOKIE_CONFIG.name, '', {
    ...REFRESH_COOKIE_CONFIG,
    maxAge: 0,
    expires: new Date(0),
  });

  console.log('[LOGOUT-ACTION] Cookies cleared, redirecting to login');
  
  redirect('/login');
}
