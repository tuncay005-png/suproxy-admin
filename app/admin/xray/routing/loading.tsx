/**
 * Loading State for Xray Routing Page
 * 
 * Displays a skeleton loader while the routing rules data is being fetched.
 * This component is automatically shown by Next.js during page loading.
 * 
 * @module app/admin/xray/routing/loading
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoutingLoading() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[150px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[100px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search bar skeleton */}
            <Skeleton className="h-10 w-full" />
            
            {/* Table rows skeleton */}
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
