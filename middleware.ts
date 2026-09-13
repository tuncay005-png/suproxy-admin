import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  const hasSession = !!sessionToken;
  
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';

  let response: NextResponse;

  if (isAdminRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    response = NextResponse.redirect(loginUrl);
  } else if (isLoginPage && hasSession) {
    const fromParam = request.nextUrl.searchParams.get('from');
    const redirectPath = fromParam && fromParam.startsWith('/admin') 
      ? fromParam 
      : '/admin';
    response = NextResponse.redirect(new URL(redirectPath, request.url));
  } else {
    response = NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
};
