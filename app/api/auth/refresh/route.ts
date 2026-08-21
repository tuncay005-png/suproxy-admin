import { NextResponse } from 'next/server';
import { refreshTokenAction } from '@/app/actions/auth';

/**
 * Client-side proxy for refresh action
 */
export async function POST() {
  try {
    console.log('[REFRESH-ROUTE] Refresh request received');
    
    const result = await refreshTokenAction();
    
    if (result.success) {
      console.log('[REFRESH-ROUTE] Refresh successful');
      return NextResponse.json({ success: true });
    } else {
      console.log('[REFRESH-ROUTE] Refresh failed');
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    console.error('[REFRESH-ROUTE] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
