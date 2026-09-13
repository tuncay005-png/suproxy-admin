/**
 * Skeleton Component Usage Examples
 * 
 * Demonstrates how to use skeleton components for loading states in various scenarios.
 * 
 * ## Features
 * 
 * - Server-side loading with Next.js loading.tsx
 * - Client-side loading with useState
 * - Suspense boundaries with skeletons
 * - Smooth transitions from skeleton to content
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 12.4, 12.5
 * - 12.4: Uses React Server Components for initial page load optimization
 * - 12.5: Lazy-loads heavy monitoring components with skeleton
 * 
 * @module components/admin/dashboard/skeleton-examples
 */

'use client';

import * as React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { CircularProgressChart } from './circular-progress-chart';
import { CircularProgressChartSkeleton } from './circular-progress-chart-skeleton';
import { ActivityCard } from './activity-card';
import { ActivityCardSkeleton } from './activity-card-skeleton';
import { StatCard } from './stat-card';
import { StatCardSkeleton } from './stat-card-skeleton';
import { Activity, Clock, Users } from 'lucide-react';

/**
 * Example 1: Server-Side Loading with loading.tsx
 * 
 * Next.js automatically shows loading.tsx while the page is being fetched.
 * The loading.tsx file should use skeleton components to match the page structure.
 * 
 * File: app/admin/page.tsx
 * ```tsx
 * export default async function DashboardPage() {
 *   const data = await fetchData(); // Server-side data fetch
 *   return <Dashboard data={data} />;
 * }
 * ```
 * 
 * File: app/admin/loading.tsx
 * ```tsx
 * import { StatCardSkeleton } from '@/components/admin/dashboard/stat-card-skeleton';
 * 
 * export default function DashboardLoading() {
 *   return (
 *     <div className="grid grid-cols-5 gap-4">
 *       {Array.from({ length: 5 }).map((_, i) => (
 *         <StatCardSkeleton key={i} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Example 2: Client-Side Loading State
 * 
 * Use skeleton components while data is being fetched on the client.
 */
export function ClientSideLoadingExample() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate data fetch
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setData({
        cpuUsage: 45,
        status: 'running',
        totalUsers: 1234,
      });
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Circular Progress Charts */}
      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <CircularProgressChartSkeleton />
            <CircularProgressChartSkeleton />
            <CircularProgressChartSkeleton />
            <CircularProgressChartSkeleton />
          </>
        ) : (
          <>
            <CircularProgressChart
              value={data.cpuUsage}
              max={100}
              label="CPU"
              unit="%"
            />
            {/* ... other charts */}
          </>
        )}
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <ActivityCardSkeleton showStatusDot={true} />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </>
        ) : (
          <>
            <ActivityCard
              icon={Activity}
              title="Xray Status"
              value={data.status}
              status="success"
              statusDot={true}
            />
            {/* ... other cards */}
          </>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={String(data.totalUsers)}
              description="Active users"
              icon={Users}
            />
            {/* ... other cards */}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Example 3: Smooth Transition with Animation
 * 
 * Add CSS transitions for smooth skeleton-to-content transitions.
 */
export function SmoothTransitionExample() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setData({ cpuUsage: 65 });
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="relative">
      {/* Skeleton with fade-out */}
      <div
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
        }`}
      >
        <CircularProgressChartSkeleton />
      </div>

      {/* Content with fade-in */}
      <div
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {data && (
          <CircularProgressChart
            value={data.cpuUsage}
            max={100}
            label="CPU"
            unit="%"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Example 4: Suspense Boundary with Skeleton
 * 
 * Use React Suspense with skeleton fallback for lazy-loaded components.
 */
const LazyMonitoring = React.lazy(() => import('./system-monitors').then(module => ({
  default: module.SystemMonitors
})).catch(() => ({
  default: () => <div>Failed to load</div>
})));

export function SuspenseExample() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-4 gap-4">
          <CircularProgressChartSkeleton />
          <CircularProgressChartSkeleton />
          <CircularProgressChartSkeleton />
          <CircularProgressChartSkeleton />
        </div>
      }
    >
      <LazyMonitoring initialHealth={null} />
    </Suspense>
  );
}

/**
 * Example 5: Conditional Skeleton Display
 * 
 * Show skeleton only during first fetch, display last known data on subsequent fetches.
 */
export function ConditionalSkeletonExample() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    setIsFetching(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setData({ cpuUsage: Math.random() * 100 });
    setIsFetching(false);
    setIsFirstLoad(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show skeleton only on first load
  if (isFirstLoad && !data) {
    return <CircularProgressChartSkeleton />;
  }

  // Show data (even if currently fetching new data)
  return (
    <div className={isFetching ? 'opacity-75' : ''}>
      {data && (
        <CircularProgressChart
          value={data.cpuUsage}
          max={100}
          label="CPU"
          unit="%"
        />
      )}
    </div>
  );
}

/**
 * Example 6: Grid Layout with Mixed Skeletons
 * 
 * Demonstrate skeleton components in a complete dashboard layout.
 */
export function DashboardLayoutExample() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Circular Charts */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CircularProgressChartSkeleton key={i} />
          ))}
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ActivityCardSkeleton showStatusDot={true} />
          <ActivityCardSkeleton />
          <ActivityCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actual content would go here */}
      <div className="text-center py-12">
        <p className="text-muted-foreground">Dashboard Content Loaded</p>
      </div>
    </div>
  );
}
