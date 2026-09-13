/**
 * Dashboard Loading State
 * 
 * Displays skeleton loaders while the dashboard is being loaded.
 * Matches the structure of the main dashboard page with enhanced skeleton components.
 * 
 * ## Features
 * 
 * - Skeleton loaders for page header
 * - StatCardSkeleton components for stat cards (5 cards, responsive grid)
 * - Skeleton loaders for activity feed section
 * - Skeleton loaders for quick actions section
 * - Responsive layout matching dashboard
 * - Smooth transitions when data loads
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 11.1, 11.2, 12.4, 12.5
 * - 11.1: Loading state displayed during asynchronous operations
 * - 11.2: Loading state uses skeleton screens from shadcn/ui
 * - 12.4: Uses React Server Components for initial page load optimization
 * - 12.5: Lazy-loads heavy monitoring components with skeleton
 * 
 * @module app/admin/loading
 */

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatCardSkeleton } from '@/components/admin/dashboard/stat-card-skeleton';

/**
 * Loading state for dashboard page
 * 
 * Shows skeleton UI while dashboard data is being fetched.
 * Matches the layout of the actual dashboard page.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      {/* Stat Cards Section Skeleton - Responsive: 1 col mobile, 2 small, 3 tablet, 5 desktop */}
      <section 
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-5" 
        aria-label="Statistics Loading"
        role="status"
        aria-live="polite"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>

      {/* Activity Feed and Quick Actions Section Skeleton */}
      <section 
        className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-7" 
        aria-label="Activity and Actions Loading"
      >
        {/* Activity Feed Card Skeleton */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card Skeleton */}
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Accessible loading announcement */}
      <span className="sr-only">Loading dashboard data...</span>
    </div>
  );
}
