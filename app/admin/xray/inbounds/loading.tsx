/**
 * Loading state for Xray Inbounds page
 * 
 * Displays skeleton UI while inbound data is being fetched
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function InboundsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <Skeleton className="h-9 w-[120px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search bar skeleton */}
          <Skeleton className="h-10 w-full" />
          
          {/* Table rows skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
