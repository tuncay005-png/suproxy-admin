/**
 * Dashboard Loading State
 * 
 * Displays skeleton loaders while the dashboard is being loaded.
 * Matches the structure of the main dashboard page.
 * 
 * ## Features
 * 
 * - Skeleton loaders for page header
 * - Skeleton loaders for stat cards (4 cards, responsive grid)
 * - Skeleton loaders for activity feed section
 * - Skeleton loaders for quick actions section
 * - Responsive layout matching dashboard
 * 
 * Validates: Requirements 11.1, 11.2
 * - 11.1: Loading state displayed during asynchronous operations
 * - 11.2: Loading state uses skeleton screens from shadcn/ui
 * 
 * @module app/admin/loading
 */

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading state for dashboard page
 * 
 * Shows skeleton UI while dashboard data is being fetched.
 * Matches the layout of the actual dashboard page.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stat Cards Section Skeleton - Responsive: 1 col mobile, 2 tablet, 4 desktop */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" aria-label="Statistics Loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Activity Feed and Quick Actions Section Skeleton */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-7" aria-label="Activity and Actions Loading">
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
    </div>
  );
}
