/**
 * Loading State for Xray Instances Page
 * 
 * Displays a skeleton UI while the instances data is being fetched.
 * 
 * @module app/admin/xray/instances/loading
 */

import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingInstancesPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Xray Instances"
        description="Monitor and manage Xray proxy server instances"
      />

      <Card>
        <CardHeader>
          <CardTitle>Xray Instances</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
