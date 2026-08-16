/**
 * Xray Clients API Proxy Route
 * 
 * Proxies requests to the Go backend for Xray client management operations.
 * Handles listing all clients and creating new clients.
 * 
 * Validates: Requirements 6.1, 6.4, 11.3
 * 
 * @module app/api/admin/xray/clients/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * GET /api/admin/xray/clients
 * List all Xray clients
 * 
 * Forwards to: GET /api/v1/admin/xray/clients
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    // Forward request to Go backend
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/xray/clients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Return response with appropriate status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Xray clients proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Connection Failed - Check if backend is running',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/xray/clients
 * Create a new Xray client
 * 
 * Forwards to: POST /api/v1/admin/xray/clients
 */
export async function POST(request: NextRequest) {
  try {
    // Get session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Forward request to Go backend
    const response = await fetch(`${BACKEND_URL}/api/v1/admin/xray/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Return response with appropriate status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Xray client creation proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Connection Failed - Check if backend is running',
      },
      { status: 500 }
    );
  }
}
