# Loading States and Skeleton Components

## Overview

This directory contains skeleton components for displaying loading states throughout the admin dashboard. These components provide visual feedback during data fetching and improve the perceived performance of the application.

## Components

### 1. StatCardSkeleton

**File:** `stat-card-skeleton.tsx`

Loading skeleton for the `StatCard` component. Displays during initial load while stat data is being fetched.

**Features:**
- Matches StatCard layout structure
- Smooth pulse animation
- ARIA live region for accessibility
- Screen reader announcements

**Usage:**
```tsx
import { StatCardSkeleton } from '@/components/admin/dashboard/stat-card-skeleton';

// In loading state
<div className="grid grid-cols-5 gap-4">
  {Array.from({ length: 5 }).map((_, i) => (
    <StatCardSkeleton key={i} />
  ))}
</div>
```

**Props:**
- `className?: string` - Additional CSS classes

---

### 2. ActivityCardSkeleton

**File:** `activity-card-skeleton.tsx`

Loading skeleton for the `ActivityCard` component. Displays during activity data fetching.

**Features:**
- Matches ActivityCard layout structure
- Optional status dot skeleton
- Smooth pulse animation
- ARIA live region for accessibility

**Usage:**
```tsx
import { ActivityCardSkeleton } from '@/components/admin/dashboard/activity-card-skeleton';

// Basic usage
<ActivityCardSkeleton />

// With status dot
<ActivityCardSkeleton showStatusDot={true} />
```

**Props:**
- `className?: string` - Additional CSS classes
- `showStatusDot?: boolean` - Show status dot skeleton (default: false)

---

### 3. CircularProgressChartSkeleton

**File:** `circular-progress-chart-skeleton.tsx`

Loading skeleton for the `CircularProgressChart` component. Displays during system monitoring data fetches.

**Features:**
- Matches CircularProgressChart dimensions and layout
- Circular skeleton with inner empty space
- Configurable size to match chart dimensions
- ARIA live region for accessibility

**Usage:**
```tsx
import { CircularProgressChartSkeleton } from '@/components/admin/dashboard/circular-progress-chart-skeleton';

// Default size (120px)
<CircularProgressChartSkeleton />

// Custom size
<CircularProgressChartSkeleton size={160} />
```

**Props:**
- `size?: number` - Chart diameter in pixels (default: 120)
- `className?: string` - Additional CSS classes

---

## Implementation Patterns

### Pattern 1: Server-Side Loading (Recommended)

Next.js automatically displays `loading.tsx` while server components are being rendered.

**File:** `app/admin/loading.tsx`
```tsx
import { StatCardSkeleton } from '@/components/admin/dashboard/stat-card-skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

**File:** `app/admin/page.tsx`
```tsx
export default async function DashboardPage() {
  const data = await getDashboardData(); // Server-side fetch
  return <Dashboard data={data} />;
}
```

### Pattern 2: Client-Side Loading State

Use state management to control skeleton visibility during client-side fetches.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { CircularProgressChart } from '@/components/admin/dashboard/circular-progress-chart';
import { CircularProgressChartSkeleton } from '@/components/admin/dashboard/circular-progress-chart-skeleton';

export function SystemMonitors() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const result = await fetch('/api/system/health');
      setData(await result.json());
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CircularProgressChartSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <CircularProgressChart value={data.cpu} max={100} label="CPU" unit="%" />
      {/* ... other charts */}
    </div>
  );
}
```

### Pattern 3: Smooth Transition

Add CSS transitions for smooth skeleton-to-content transitions.

```tsx
'use client';

import { useState, useEffect } from 'react';

export function SmoothTransitionExample() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

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
```

### Pattern 4: First Load Only

Show skeleton only during the initial load, not during subsequent refetches.

```tsx
'use client';

import { useState, useEffect } from 'react';

export function ConditionalSkeletonExample() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    await fetch('/api/data').then(res => res.json()).then(setData);
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

  // Show data with subtle opacity during refetch
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
```

## Accessibility

All skeleton components include:

- **ARIA live regions** (`aria-live="polite"`) for screen readers
- **Status roles** (`role="status"`) to indicate loading state
- **Screen reader announcements** with `.sr-only` class
- **Descriptive labels** (`aria-label`) explaining what's loading

Example:
```tsx
<div
  role="status"
  aria-live="polite"
  aria-label="Loading chart data"
>
  {/* Skeleton content */}
  <span className="sr-only">Loading chart data...</span>
</div>
```

## Testing

Each skeleton component has comprehensive test coverage:

- `stat-card-skeleton.test.tsx` - 7 tests
- `activity-card-skeleton.test.tsx` - 9 tests
- `circular-progress-chart-skeleton.test.tsx` - 7 tests

Run tests:
```bash
npm test -- stat-card-skeleton.test.tsx --run
npm test -- activity-card-skeleton.test.tsx --run
npm test -- circular-progress-chart-skeleton.test.tsx --run
```

## Requirements Validation

These components validate the following requirements:

**Requirement 12.4:** Uses React Server Components for initial page load optimization
- Server-side loading.tsx with skeleton components
- Smooth initial render without content flash

**Requirement 12.5:** Lazy-loads heavy monitoring components with skeleton
- Skeleton components during data fetching
- Smooth transitions when data loads
- Maintains layout stability during loading

## Best Practices

1. **Match Component Structure:** Skeleton should visually match the component it represents
2. **Use Appropriate Pulse:** Skeleton uses `animate-pulse` for consistent loading animation
3. **Maintain Layout:** Skeleton should prevent layout shift when content loads
4. **First Load vs Refetch:** Consider showing skeleton only on first load, not during real-time refetches
5. **Smooth Transitions:** Use CSS transitions for fade-in/fade-out effects
6. **Accessibility:** Always include ARIA attributes and screen reader announcements

## Examples

See `skeleton-examples.tsx` for detailed examples of:
- Server-side loading with Next.js
- Client-side loading states
- Smooth transitions with animations
- Suspense boundaries with skeletons
- Conditional skeleton display
- Complete dashboard layouts

## Related Files

- `app/admin/loading.tsx` - Dashboard loading state using skeletons
- `components/ui/skeleton.tsx` - Base Skeleton component from shadcn/ui
- `skeleton-examples.tsx` - Comprehensive usage examples
- Test files: `*-skeleton.test.tsx`

## Future Enhancements

- [ ] Add shimmer effect for enhanced visual feedback
- [ ] Create skeleton variants for other dashboard components
- [ ] Add configurable animation speeds
- [ ] Create skeleton generator utility for quick component setup
