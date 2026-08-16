/**
 * Users List Error Boundary
 * 
 * Catches and displays errors that occur during users list data fetching.
 * 
 * Validates: Requirements 10.1, 10.4
 * 
 * @module app/admin/users/error
 */

'use client';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { ErrorState } from '@/components/admin/error-state';

export interface UsersErrorProps {
  /**
   * The error that was thrown
   */
  error: Error & { digest?: string };
  /**
   * Function to retry loading the page
   */
  reset: () => void;
}

/**
 * Error boundary for users list page
 * 
 * Displays user-friendly error message with retry option.
 */
export default function UsersError({ error, reset }: UsersErrorProps) {
  React.useEffect(() => {
    // Log error to console for debugging
    console.error('Users page error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Users"
        description="Manage user accounts and permissions"
      />

      <ErrorState
        message="Failed to load users"
        description="There was a problem loading the users list. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
