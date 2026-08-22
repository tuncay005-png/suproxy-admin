/**
 * Login Page
 * 
 * Public page for user authentication.
 * Displays a centered login form with branding and instructions.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/admin/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Session Expired Alert Component
 * Wrapped in Suspense boundary to satisfy Next.js requirements
 */
function SessionExpiredAlert() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'session_expired';

  if (!sessionExpired) {
    return null;
  }

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Your session has expired. Please log in again to continue.
      </AlertDescription>
    </Alert>
  );
}

/**
 * Login Page Component
 * 
 * Renders the public login page with a centered form card.
 * This page is part of the (public) route group, making it accessible
 * without authentication.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-4">
        <Suspense fallback={null}>
          <SessionExpiredAlert />
        </Suspense>
        <Card>
          <CardHeader className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
