/**
 * Error State for Servers Page
 * 
 * Displays error UI when servers data fetch fails.
 * Provides a retry button to attempt fetching again.
 * 
 * Validates: Requirements 14.5, 14.6
 * 
 * @module app/admin/servers/error
 */

'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/admin/error-state';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('[SERVERS-PAGE] Error:', error);
  }, [error]);

  return (
    <div className="space-y-4 md:space-y-6">
      <ErrorState
        message="Failed to load servers"
        description={error.message || 'An error occurred while fetching servers data'}
        onRetry={reset}
        retryText="Retry"
      />
    </div>
  );
}
