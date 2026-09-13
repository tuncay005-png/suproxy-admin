/**
 * CircularProgressChartSkeleton Component
 * 
 * Loading skeleton for CircularProgressChart component.
 * Displays during initial load and first fetch to provide visual feedback.
 * 
 * ## Features
 * 
 * - Matches CircularProgressChart dimensions and layout
 * - Smooth pulse animation
 * - Maintains aspect ratio during loading
 * - ARIA live region for accessibility
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 12.4, 12.5
 * - 12.4: Uses React Server Components for initial page load optimization
 * - 12.5: Lazy-loads heavy monitoring components with skeleton
 * 
 * @module components/admin/dashboard/circular-progress-chart-skeleton
 */

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface CircularProgressChartSkeletonProps {
  /** Chart diameter in pixels (default: 120) - should match CircularProgressChart size */
  size?: number;
  /** CSS class for additional styling */
  className?: string;
}

/**
 * Loading skeleton for CircularProgressChart
 * 
 * @example
 * ```tsx
 * // Standard skeleton with default size
 * <CircularProgressChartSkeleton />
 * ```
 * 
 * @example
 * ```tsx
 * // Custom size matching a larger chart
 * <CircularProgressChartSkeleton size={160} />
 * ```
 */
export function CircularProgressChartSkeleton({
  size = 120,
  className,
}: CircularProgressChartSkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading chart data"
    >
      {/* Circular skeleton matching the chart */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Outer circle skeleton */}
        <Skeleton
          className="rounded-full"
          style={{ width: size, height: size }}
        />
        
        {/* Inner circle (simulates the empty center) */}
        <div
          className="absolute bg-card rounded-full"
          style={{
            width: size * 0.65,
            height: size * 0.65,
          }}
        />
        
        {/* Center text skeleton */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>

      {/* Label skeleton below chart */}
      <Skeleton className="mt-3 h-5 w-20" />

      {/* Accessible loading announcement */}
      <span className="sr-only">Loading chart data...</span>
    </div>
  );
}
