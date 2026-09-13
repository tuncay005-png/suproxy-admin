/**
 * Error Boundary for Xray Routing Page
 * 
 * Displays an error message when the routing page fails to load.
 * Provides a retry button to attempt reloading the page.
 * 
 * @module app/admin/xray/routing/error
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function RoutingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Xray routing page error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Failed to Load Routing Rules</CardTitle>
          </div>
          <CardDescription>
            {error.message || 'An unexpected error occurred while loading routing rules.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset} variant="outline" className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
