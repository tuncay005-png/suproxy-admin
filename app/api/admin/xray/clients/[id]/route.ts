/**
 * Xray Client Detail API Route
 * 
 * GET /api/admin/xray/clients/:id - Get specific client details
 * DELETE /api/admin/xray/clients/:id - Delete client
 * 
 * Proxies requests to the backend Go API for Xray client management.
 * Requires authentication via httpOnly session cookie.
 * 
 * @module app/api/admin/xray/clients/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

export async function GET(
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
      console.error('[XRAY-CLIENT-DETAIL-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/admin/xray/clients/${id}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[XRAY-CLIENT-DETAIL-ROUTE] Backend request failed:', {
        status: backendResponse.status,
        clientId: id,
        error: errorData,
      });
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch client details' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[XRAY-CLIENT-DETAIL-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      console.error('[XRAY-CLIENT-DELETE-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward delete request to backend
    const backendEndpoint = `${backendUrl}/api/v1/admin/xray/clients/${id}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[XRAY-CLIENT-DELETE-ROUTE] Backend request failed:', {
        status: backendResponse.status,
        clientId: id,
        error: errorData,
      });
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete client' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[XRAY-CLIENT-DELETE-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
