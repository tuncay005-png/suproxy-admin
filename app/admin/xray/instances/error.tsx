/**
 * Error State for Xray Instances Page
 * 
 * Displays an error boundary when fetching instances fails.
 * Provides a retry mechanism for users.
 * 
 * @module app/admin/xray/instances/error
 */

'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ErrorInstancesPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Xray Instances page error:', error);
  }, [error]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Xray Instances"
        description="Monitor and manage Xray proxy server instances"
      />

      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Instances</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>Failed to load Xray instances. This could be due to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Network connectivity issues</li>
                <li>Backend service unavailable</li>
                <li>Authentication session expired</li>
              </ul>
              <div className="mt-4">
                <Button onClick={reset} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
