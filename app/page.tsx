/**
 * Root Page - Entry Point
 * 
 * This page redirects users to the appropriate destination:
 * - Authenticated users → /admin (dashboard)
 * - Unauthenticated users → /login
 * 
 * The redirect is handled server-side for better performance and SEO.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export default async function RootPage() {
  // Check for session cookie server-side
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);
  const hasSession = !!sessionToken;

  // Redirect based on authentication status
  if (hasSession) {
    redirect('/admin');
  } else {
    redirect('/login');
  }
}
