/**
 * Audit Logs API Route
 * 
 * GET /api/admin/audit/logs
 * 
 * Proxies requests to the backend Go API for audit logs.
 * Requires authentication via httpOnly session cookie.
 * 
 * Supports query parameters:
 * - page: Page number for pagination
 * - limit: Number of results to return per page
 * - action: Filter by action type
 * - entity_type: Filter by entity type
 * - actor_id: Filter by actor (admin) user ID
 * - start_date: Start date filter (ISO 8601 format)
 * - end_date: End date filter (ISO 8601 format)
 * 
 * Validates: Requirements 9.1, 9.3-9.5, 11.6
 * 
 * @module app/api/admin/audit/logs
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
      console.error('[AUDIT-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Build query string from request URL
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/admin/audit/logs${queryString ? `?${queryString}` : ''}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[AUDIT-ROUTE] Backend request failed:', errorData);
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch audit logs' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[AUDIT-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
