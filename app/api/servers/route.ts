/**
 * Servers API Route
 * 
 * GET /api/servers
 * 
 * Proxies requests to the backend Go API for servers list.
 * Requires authentication via httpOnly session cookie.
 * 
 * @module app/api/servers
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Get session token from httpOnly cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_CONFIG.name);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get backend API URL
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backendUrl) {
      console.error('[SERVERS-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Build query string from request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/servers${queryString ? `?${queryString}` : ''}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[SERVERS-ROUTE] Backend request failed:', errorData);
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch servers' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SERVERS-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
