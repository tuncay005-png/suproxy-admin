/**
 * Global Error Boundary for Admin Routes
 * 
 * This error boundary catches errors in the admin section and displays
 * a user-friendly error message with a retry option.
 * 
 * ## Features
 * 
 * - Catches runtime errors in admin routes
 * - Displays user-friendly error messages
 * - Provides retry functionality
 * - Logs detailed error information to console for debugging
 * 
 * ## Usage
 * 
 * This error boundary is automatically applied to all routes under /admin
 * by Next.js because it's named error.tsx in the admin folder.
 * 
 * @module app/admin/error
 * @see {@link Requirements} 10.1, 10.4
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary component for admin routes
 * 
 * @param error - The error object that was thrown
 * @param reset - Function to attempt recovery by re-rendering the segment
 * @returns Error UI with retry option
 * 
 * @example
 * ```typescript
 * // This component is automatically used by Next.js
 * // when an error occurs in /admin routes
 * ```
 */
export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error details to console for debugging
    console.error('Admin route error:', {
      message: error.message,
      name: error.name,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error occurred while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display error message */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || 'An unknown error occurred'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              Try again
            </Button>
            <Button
              onClick={() => window.location.href = '/admin'}
              className="flex-1"
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </div>

          {/* Debug info (only shown in development) */}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <p className="text-xs text-center text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
