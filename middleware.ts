/**
 * Authentication Middleware
 * 
 * This middleware protects admin routes and manages authentication flow.
 * 
 * ## Responsibilities
 * 
 * 1. **Route Protection**: Redirects unauthenticated users from /admin/* to /login
 * 2. **Login Redirect**: Redirects authenticated users from /login to /admin
 * 3. **Session Validation**: Checks for session_token cookie presence
 * 
 * ## Flow
 * 
 * ```
 * Request → Middleware
 *   ├─ /admin/* + No session_token → Redirect to /login
 *   ├─ /admin/* + Has session_token → Allow access
 *   ├─ /login + Has session_token → Redirect to /admin
 *   └─ /login + No session_token → Allow access
 * ```
 * 
 * ## Security
 * 
 * - Checks for httpOnly session_token cookie
 * - Prevents unauthorized access to admin routes
 * - Prevents authenticated users from accessing login page
 * 
 * @module app/middleware
 * @see {@link lib/auth/session} for session utilities
 * @see {@link Requirements} 2.1, 2.2, 2.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

/**
 * Middleware function that handles authentication and route protection
 * 
 * @param request - The incoming Next.js request
 * @returns NextResponse - Either a redirect or the original response
 */
export function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] Called for path:', request.nextUrl.pathname);
  
  // Get session token from cookies
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  const hasSession = !!sessionToken;
  
  console.log('[MIDDLEWARE] Session cookie name:', SESSION_COOKIE_NAME);
  console.log('[MIDDLEWARE] Session token found:', hasSession);
  console.log('[MIDDLEWARE] Session token value:', sessionToken ? `${sessionToken.value.substring(0, 20)}...` : 'NONE');
  console.log('[MIDDLEWARE] All cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));

  // Determine route type
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  console.log('[MIDDLEWARE] Is admin route:', isAdminRoute);
  console.log('[MIDDLEWARE] Is login page:', isLoginPage);

  // Protect /admin/* routes - redirect to /login if not authenticated
  if (isAdminRoute && !hasSession) {
    console.log('[MIDDLEWARE] Redirecting to /login - no session on admin route');
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination for redirect after login
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isLoginPage && hasSession) {
    console.log('[MIDDLEWARE] Redirecting to /admin - has session on login page');
    // Check if there's a 'from' parameter to redirect back to
    const fromParam = request.nextUrl.searchParams.get('from');
    const redirectPath = fromParam && fromParam.startsWith('/admin') 
      ? fromParam 
      : '/admin';
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Allow the request to proceed
  console.log('[MIDDLEWARE] Allowing request to proceed');
  return NextResponse.next();
}

/**
 * Middleware configuration
 * 
 * Specifies which routes the middleware should run on:
 * - `/admin/:path*` - All admin routes (protected)
 * - `/login` - Login page (redirect if authenticated)
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
};
