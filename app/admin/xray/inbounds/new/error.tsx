/**
 * Error State for Create Xray Inbound Page
 * 
 * Displays error UI when the create inbound page fails to load.
 * Provides a retry button to attempt loading again.
 * 
 * Validates: Requirements 14.5, 14.6
 * 
 * @module app/admin/xray/inbounds/new/error
 */

'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('[XRAY-INBOUND-CREATE-PAGE] Error:', error);
  }, [error]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Create Xray Inbound"
        description="Configure a new inbound connection for an Xray instance"
      />

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Failed to Load Create Inbound Page</CardTitle>
          </div>
          <CardDescription>
            An error occurred while loading the inbound creation form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'Unknown error occurred'}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
