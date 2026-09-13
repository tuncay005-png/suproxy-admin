/**
 * Error state for Xray Inbounds page
 * 
 * Displays user-friendly error message when data fetching fails
 */

'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function InboundsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Inbounds page error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Failed to load inbounds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            An error occurred while fetching inbound configurations. This might be due to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
            <li>Network connectivity issues</li>
            <li>Backend API unavailability</li>
            <li>Authentication session expiration</li>
          </ul>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/admin'} variant="ghost">
              Go to dashboard
            </Button>
          </div>
          {error.message && (
            <details className="mt-4">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Technical details
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
