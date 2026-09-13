/**
 * StatCardSkeleton Component
 * 
 * Loading skeleton for StatCard component.
 * Displays during initial load to provide visual feedback while data is being fetched.
 * 
 * ## Features
 * 
 * - Matches StatCard layout structure
 * - Smooth pulse animation
 * - Maintains card dimensions during loading
 * - ARIA live region for accessibility
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 12.4, 12.5
 * - 12.4: Uses React Server Components for initial page load optimization
 * - 12.5: Provides loading state for dashboard components
 * 
 * @module components/admin/dashboard/stat-card-skeleton
 */

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface StatCardSkeletonProps {
  /** CSS class for additional styling */
  className?: string;
}

/**
 * Loading skeleton for StatCard
 * 
 * @example
 * ```tsx
 * // Standard stat card skeleton
 * <StatCardSkeleton />
 * ```
 * 
 * @example
 * ```tsx
 * // Grid of stat card skeletons
 * <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
 *   <StatCardSkeleton />
 *   <StatCardSkeleton />
 *   <StatCardSkeleton />
 * </div>
 * ```
 */
export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <Card className={cn('transition-all', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1 space-y-1">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-24" />
        </div>
        {/* Icon skeleton */}
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Value skeleton */}
        <Skeleton className="h-8 w-16" />
        {/* Description skeleton */}
        <Skeleton className="h-3 w-20" />
      </CardContent>

      {/* Accessible loading announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        Loading statistic...
      </span>
    </Card>
  );
}
