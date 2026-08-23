/**
 * Server-Side Refresh Helper
 * 
 * Provides TOKEN_EXPIRED handling for Server Components (RSC).
 * Complements the existing client-side refresh logic without replacing it.
 * 
 * Architecture:
 * - Client-side: Browser API calls use existing refresh in lib/api/client.ts
 * - Server-side: RSC page loads use this helper
 * 
 * @module lib/api/server-refresh-helper
 */

import { refreshTokenAction } from '@/app/actions/auth';

/**
 * Single-flight refresh promise for server-side
 * Prevents concurrent refresh attempts during SSR
 */
let serverRefreshPromise: Promise<boolean> | null = null;

/**
 * Attempt server-side token refresh with single-flight pattern
 * 
 * This function is called by the API client when running server-side
 * and a TOKEN_EXPIRED error is detected.
 * 
 * @returns Promise<boolean> - true if refresh succeeded
 */
export async function attemptServerSideRefresh(): Promise<boolean> {
  // Single-flight: reuse existing refresh promise
  if (serverRefreshPromise) {
    console.log('[SERVER-REFRESH] Refresh already in progress, waiting...');
    return await serverRefreshPromise;
  }

  console.log('[SERVER-REFRESH] Starting server-side token refresh...');
  
  serverRefreshPromise = executeServerRefresh();
  
  try {
    const result = await serverRefreshPromise;
    return result;
  } finally {
    // Always cleanup to prevent stuck state
    serverRefreshPromise = null;
  }
}

/**
 * Execute the actual server-side refresh
 * Uses the existing refreshTokenAction
 */
async function executeServerRefresh(): Promise<boolean> {
  try {
    const result = await refreshTokenAction();
    
    if (result.success) {
      console.log('[SERVER-REFRESH] Token refresh successful');
      return true;
    } else {
      console.warn('[SERVER-REFRESH] Token refresh failed');
      return false;
    }
  } catch (error) {
    console.error('[SERVER-REFRESH] Refresh error:', error);
    return false;
  }
}

/**
 * Check if we are running server-side
 */
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}
