/**
 * ActivityCardSkeleton Component
 * 
 * Loading skeleton for ActivityCard component.
 * Displays during initial load and first fetch to provide visual feedback.
 * 
 * ## Features
 * 
 * - Matches ActivityCard layout structure
 * - Smooth pulse animation
 * - Maintains card dimensions during loading
 * - ARIA live region for accessibility
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 12.4, 12.5
 * - 12.4: Uses React Server Components for initial page load optimization
 * - 12.5: Lazy-loads heavy monitoring components with skeleton
 * 
 * @module components/admin/dashboard/activity-card-skeleton
 */

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ActivityCardSkeletonProps {
  /** CSS class for additional styling */
  className?: string;
  /** Whether to show the status dot skeleton */
  showStatusDot?: boolean;
}

/**
 * Loading skeleton for ActivityCard
 * 
 * @example
 * ```tsx
 * // Standard skeleton without status dot
 * <ActivityCardSkeleton />
 * ```
 * 
 * @example
 * ```tsx
 * // Skeleton with status dot indicator
 * <ActivityCardSkeleton showStatusDot={true} />
 * ```
 */
export function ActivityCardSkeleton({
  className,
  showStatusDot = false,
}: ActivityCardSkeletonProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon skeleton with optional status dot */}
          <div className="relative shrink-0">
            <Skeleton className="h-5 w-5 rounded" />
            {showStatusDot && (
              <Skeleton className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full" />
            )}
          </div>
          
          {/* Text content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <Skeleton className="h-4 w-24" />
            
            {/* Value skeleton */}
            <Skeleton className="h-7 w-32" />
            
            {/* Description skeleton (optional) */}
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </CardContent>

      {/* Accessible loading announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        Loading activity data...
      </span>
    </Card>
  );
}
