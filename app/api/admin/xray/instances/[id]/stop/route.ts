/**
 * Xray Instance Stop API Route
 * 
 * POST /api/admin/xray/instances/:id/stop - Stop an Xray instance
 * 
 * Proxies requests to the backend Go API for Xray instance management.
 * Requires authentication via httpOnly session cookie.
 * 
 * @module app/api/admin/xray/instances/[id]/stop
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
      console.error('[XRAY-INSTANCE-STOP-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/admin/xray/instances/${id}/stop`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[XRAY-INSTANCE-STOP-ROUTE] Backend request failed:', {
        status: backendResponse.status,
        instanceId: id,
        error: errorData,
      });
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to stop instance' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[XRAY-INSTANCE-STOP-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
