/**
 * Xray Clients Error Boundary
 * 
 * Displays error UI when clients data fetching fails.
 * 
 * Validates: Requirements 14.5, 15.1
 * 
 * @module app/admin/xray/clients/error
 */

'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for Xray clients page
 * Displays error message with retry option
 */
export default function XrayClientsError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log error to console for debugging
    console.error('Xray clients page error:', error);
  }, [error]);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Xray Clients"
        description="Manage individual user access configurations and view traffic statistics"
      />

      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading clients</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm">
                {error.message || 'Failed to load Xray clients. Please try again.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="mt-2"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
