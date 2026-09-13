/**
 * Xray Routing Rules API Route
 * 
 * Proxies routing rule management requests to the backend API.
 * Handles listing and creating routing rules.
 * 
 * @module app/api/admin/xray/routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest } from '@/lib/auth/cookie-helpers';
import { forwardBackendError } from '@/lib/api/backend-proxy-helpers';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

/**
 * GET /api/admin/xray/routing
 * List all routing rules
 */
export async function GET(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/xray/routing`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return forwardBackendError(response, 'GET /api/admin/xray/routing');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/xray/routing] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/xray/routing
 * Create a new routing rule
 */
export async function POST(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/admin/xray/routing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return forwardBackendError(response, 'POST /api/admin/xray/routing');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/xray/routing] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
