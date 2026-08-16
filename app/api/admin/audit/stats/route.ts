/**
 * Audit Stats API Route
 * 
 * GET /api/admin/audit/stats
 * 
 * Proxies requests to the backend Go API for audit statistics.
 * Requires authentication via httpOnly session cookie.
 * 
 * Returns aggregated statistics about audit log actions including:
 * - Total action count
 * - Actions grouped by type
 * - Recent activity count
 * 
 * Validates: Requirements 9.9, 11.6
 * 
 * @module app/api/admin/audit/stats
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
      console.error('[AUDIT-STATS-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/admin/audit/stats`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[AUDIT-STATS-ROUTE] Backend request failed:', errorData);
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch audit statistics' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[AUDIT-STATS-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
