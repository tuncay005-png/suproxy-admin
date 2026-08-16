/**
 * Xray Inbound Detail API Route
 * 
 * GET /api/admin/xray/inbounds/:id - Get inbound details
 * PUT /api/admin/xray/inbounds/:id - Update inbound
 * DELETE /api/admin/xray/inbounds/:id - Delete inbound
 * 
 * Proxies requests to the backend Go API for Xray inbound management.
 * Requires authentication via httpOnly session cookie.
 * 
 * @module app/api/admin/xray/inbounds/[id]
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
      console.error('[XRAY-INBOUND-DETAIL-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/admin/xray/inbounds/${id}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[XRAY-INBOUND-DETAIL-ROUTE] Backend request failed:', {
        status: backendResponse.status,
        inboundId: id,
        error: errorData,
      });
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch inbound details' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[XRAY-INBOUND-DETAIL-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      console.error('[XRAY-INBOUND-UPDATE-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/admin/xray/inbounds/${id}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[XRAY-INBOUND-UPDATE-ROUTE] Backend request failed:', {
        status: backendResponse.status,
        inboundId: id,
        error: errorData,
      });
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to update inbound' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[XRAY-INBOUND-UPDATE-ROUTE] Error:', error);
    
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
      console.error('[XRAY-INBOUND-DELETE-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward request to backend with authentication
    const backendEndpoint = `${backendUrl}/api/v1/admin/xray/inbounds/${id}`;
    
    const backendResponse = await fetch(backendEndpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('[XRAY-INBOUND-DELETE-ROUTE] Backend request failed:', {
        status: backendResponse.status,
        inboundId: id,
        error: errorData,
      });
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to delete inbound' },
        { status: backendResponse.status }
      );
    }

    // Parse and return backend response
    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[XRAY-INBOUND-DELETE-ROUTE] Error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
