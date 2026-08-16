/**
 * Refresh Button Component
 * 
 * Button to refresh the users list by revalidating server data.
 * 
 * ## Features
 * 
 * - Triggers router.refresh() to revalidate server components
 * - Shows loading state during refresh
 * - Rotating icon animation during refresh
 * - Responsive sizing for mobile/desktop
 * 
 * Validates: Requirements 4.4, 3.5, 7.6
 * 
 * @module components/admin/users/refresh-button
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Refresh button component
 * 
 * Reloads the users list by revalidating server data.
 * 
 * @example
 * ```tsx
 * <RefreshButton />
 * ```
 */
export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    
    // Reset loading state after a short delay
    // (router.refresh() doesn't provide a callback)
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleRefresh}
      disabled={isRefreshing}
      aria-label="Refresh users list"
      className="w-full sm:w-auto"
    >
      <RefreshCw
        className={cn(
          'h-4 w-4 sm:mr-2',
          isRefreshing && 'animate-spin'
        )}
      />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );
}
