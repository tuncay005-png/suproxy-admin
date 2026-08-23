import { NextRequest, NextResponse } from 'next/server';
import { getSessionTokenFromRequest } from '@/lib/auth/cookie-helpers';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionTokenFromRequest(request);
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!backendUrl) {
      console.error('[STATS-ROUTE] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { success: false, error: { code: 'CONFIG_ERROR', message: 'Server configuration error' } },
        { status: 500 }
      );
    }

    const backendResponse = await fetch(`${backendUrl}/api/v1/admin/system/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    });

    const responseData = await backendResponse.json().catch(() => ({ 
      success: false, 
      error: { code: 'PARSE_ERROR', message: 'Failed to parse response' } 
    }));

    if (!backendResponse.ok) {
      console.error('[STATS-ROUTE] Backend request failed:', responseData);
      return NextResponse.json(responseData, { status: backendResponse.status });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[STATS-ROUTE] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
