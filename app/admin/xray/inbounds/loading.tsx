/**
 * Loading State for Xray Inbounds Page
 * 
 * Displays a skeleton UI while the inbounds data is being fetched.
 * 
 * @module app/admin/xray/inbounds/loading
 */

import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingInboundsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Xray Inbounds"
        description="Manage Xray inbound proxy configurations"
      />

      <Card>
        <CardHeader>
          <CardTitle>Xray Inbounds</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
