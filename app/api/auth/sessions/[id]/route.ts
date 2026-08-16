/**
 * Session Detail API Route
 * 
 * DELETE /api/auth/sessions/[id] - Revoke a specific session
 * 
 * Proxies requests to the backend Go API for individual session management.
 * Requires authentication via httpOnly session cookie.
 * 
 * @module app/api/auth/sessions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

/**
 * DELETE handler for revoking a specific session
 * 
 * Forwards request to backend /api/v1/auth/sessions/:id endpoint
 * 
 * @param request - The incoming Next.js request
 * @param context - Route context containing session ID
 * @returns JSON response with success message
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
      console.error('[SESSION-DELETE-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Extract session ID from params (await as params are now async)
    const params = await context.params;
    const sessionId = params.id;

    // Forward request to backend
    const backendEndpoint = `${backendUrl}/api/v1/auth/sessions/${sessionId}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[SESSION-DELETE-ROUTE] Backend request failed:', errorData);
      
      // Map error status codes to user-friendly messages
      let errorMessage = 'Failed to revoke session';
      if (backendResponse.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (backendResponse.status === 403) {
        errorMessage = 'Access denied. You do not have permission to revoke this session.';
      } else if (backendResponse.status === 404) {
        errorMessage = 'Session not found or already revoked.';
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
    console.error('[SESSION-DELETE-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'Connection failed. Check if backend is running.' },
      { status: 500 }
    );
  }
}
