/**
 * Error State for Monitoring Page
 * 
 * Displays error state when monitoring page fails to load.
 * Provides a retry button to attempt reloading the page.
 * 
 * @module app/admin/monitoring/error
 */

'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function MonitoringError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('[MONITORING-ERROR]', error);
  }, [error]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <PageHeader
        heading="System Monitoring"
        description="Real-time system health, database status, and infrastructure metrics."
      />

      {/* Error Card */}
      <Card className="border-red-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Failed to Load Monitoring Data</CardTitle>
          </div>
          <CardDescription>
            An error occurred while fetching system monitoring information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Message */}
          <div className="rounded-md bg-red-50 dark:bg-red-950 p-3">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>

          {/* Retry Button */}
          <div className="flex gap-2">
            <Button
              onClick={reset}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>

          {/* Troubleshooting Tips */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Troubleshooting:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Check if the backend server is running</li>
              <li>Verify your network connection</li>
              <li>Try refreshing the page</li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
