/**
 * Server Detail Error Boundary
 * 
 * Catches and displays errors that occur during server detail data fetching.
 * 
 * Validates: Requirements 14.5, 14.6
 * 
 * @module app/admin/servers/[id]/error
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
    console.error('[SERVER-DETAIL-PAGE] Error:', error);
  }, [error]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Server Details"
        description="View server information and associated nodes"
      />

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Failed to Load Server Details</CardTitle>
          </div>
          <CardDescription>
            An error occurred while fetching server data.
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
