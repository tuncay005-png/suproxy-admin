import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

const isDev = process.env.NODE_ENV === 'development';
const enableDebugLogs = isDev && process.env.MIDDLEWARE_DEBUG === 'true';
const enableTiming = isDev && process.env.MIDDLEWARE_TIMING === 'true';

function debugLog(message: string, ...args: unknown[]) {
  if (enableDebugLogs) {
    console.log(`[MIDDLEWARE] ${message}`, ...args);
  }
}

export function middleware(request: NextRequest) {
  const startTime = enableTiming ? performance.now() : 0;
  
  debugLog('Called for path:', request.nextUrl.pathname);
  
  const cookieStartTime = enableTiming ? performance.now() : 0;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  const hasSession = !!sessionToken;
  const cookieTime = enableTiming ? performance.now() - cookieStartTime : 0;
  
  debugLog('Session token found:', hasSession);

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';

  let response: NextResponse;

  if (isAdminRoute && !hasSession) {
    debugLog('Redirecting to /login - no session on admin route');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    response = NextResponse.redirect(loginUrl);
  } else if (isLoginPage && hasSession) {
    debugLog('Redirecting to /admin - has session on login page');
    const fromParam = request.nextUrl.searchParams.get('from');
    const redirectPath = fromParam && fromParam.startsWith('/admin') 
      ? fromParam 
      : '/admin';
    response = NextResponse.redirect(new URL(redirectPath, request.url));
  } else {
    response = NextResponse.next();
  }

  if (enableTiming) {
    const totalTime = performance.now() - startTime;
    console.log(`[MIDDLEWARE-TIMING] ${request.nextUrl.pathname}: ${totalTime.toFixed(2)}ms (cookie: ${cookieTime.toFixed(2)}ms)`);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
};
