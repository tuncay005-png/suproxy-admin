/**
 * Error State for Plans Page
 * 
 * Displays error UI when plans data fetch fails.
 * Provides a retry button to attempt fetching again.
 * 
 * Validates: Requirements 14.5, 14.6
 * 
 * @module app/admin/plans/error
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
    console.error('[PLANS-PAGE] Error:', error);
  }, [error]);

  return (
    <div className="space-y-4 md:space-y-6">
      <ErrorState
        message="Failed to load plans"
        description={error.message || 'An error occurred while fetching plans data'}
        onRetry={reset}
        retryText="Retry"
      />
    </div>
  );
}
