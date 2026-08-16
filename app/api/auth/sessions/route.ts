/**
 * Sessions API Route
 * 
 * GET /api/auth/sessions - List all active sessions
 * POST /api/auth/sessions - Logout all sessions for a user
 * 
 * Proxies requests to the backend Go API for session management.
 * Requires authentication via httpOnly session cookie.
 * 
 * @module app/api/auth/sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

/**
 * GET handler for listing all active sessions
 * 
 * Forwards request to backend /api/v1/auth/sessions endpoint
 * 
 * @param request - The incoming Next.js request
 * @returns JSON response with sessions list
 */
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
      console.error('[SESSIONS-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward request to backend
    const backendEndpoint = `${backendUrl}/api/v1/auth/sessions`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[SESSIONS-ROUTE] Backend request failed:', errorData);
      
      // Map error status codes to user-friendly messages
      let errorMessage = 'Failed to fetch sessions';
      if (backendResponse.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (backendResponse.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view sessions.';
      } else if (backendResponse.status === 404) {
        errorMessage = 'Sessions endpoint not found.';
      } else if (backendResponse.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      return NextResponse.json(
        { error: errorData.message || errorMessage },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SESSIONS-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'Connection failed. Check if backend is running.' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for logout-all functionality
 * 
 * Revokes all sessions for a specified user.
 * Forwards request to backend /api/v1/auth/logout-all endpoint
 * 
 * @param request - The incoming Next.js request containing user_id
 * @returns JSON response with success message
 */
export async function POST(request: NextRequest) {
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
      console.error('[SESSIONS-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Forward to backend logout-all endpoint
    const backendEndpoint = `${backendUrl}/api/v1/auth/logout-all`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[SESSIONS-ROUTE] Backend request failed:', errorData);
      
      // Map error status codes to user-friendly messages
      let errorMessage = 'Failed to revoke all sessions';
      if (backendResponse.status === 400) {
        errorMessage = 'Invalid request. User ID is required.';
      } else if (backendResponse.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (backendResponse.status === 403) {
        errorMessage = 'Access denied. You do not have permission to revoke sessions.';
      } else if (backendResponse.status === 404) {
        errorMessage = 'User not found or no sessions to revoke.';
      } else if (backendResponse.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      return NextResponse.json(
        { error: errorData.message || errorMessage },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SESSIONS-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'Connection failed. Check if backend is running.' },
      { status: 500 }
    );
  }
}
