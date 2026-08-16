/**
 * Xray Instance Detail Page
 * 
 * Server Component that fetches and displays detailed information for a single Xray instance.
 * 
 * ## Features
 * 
 * - Server-side parallel data fetching for instance, health, and stats
 * - Health status monitoring with color-coded indicators
 * - Real-time statistics display
 * - Traffic metrics with formatted byte units
 * - Auto-refresh capability
 * - Instance control operations
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches instance data, health, and stats in parallel
 * 2. Data is passed to client components for rendering
 * 3. Client components handle auto-refresh and user interactions
 * 4. Error boundary handles fetch failures
 * 
 * Validates: Requirements 4.7-4.9
 * 
 * @module app/admin/xray/instances/[id]/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { PageHeader } from '@/components/admin/page-header';
import { InstanceHealthCard } from '@/components/admin/xray/instances/instance-health-card';
import { InstanceStatsCard } from '@/components/admin/xray/instances/instance-stats-card';
import { InstanceControlButtons } from '@/components/admin/xray/instances/instance-control-buttons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface InstanceDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Xray instance detail page - Server Component
 * 
 * Fetches instance data, health status, and statistics server-side in parallel
 * and renders a comprehensive view of the instance.
 * 
 * @param params - Route parameters containing instance ID
 */
export default async function InstanceDetailPage({ params }: InstanceDetailPageProps) {
  try {
    // Requirement 7.3: Fetch instance data, health status, and stats in parallel
    const [instanceResponse, healthResponse, statsResponse] = await Promise.all([
      xrayApi.instances.getById(params.id),
      xrayApi.instances.getHealth(params.id),
      xrayApi.instances.getStats(params.id),
    ]);

    const instance = instanceResponse.data;
    const health = healthResponse.data;
    const stats = statsResponse.data;

    return (
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          heading={instance.name}
          description={`Instance on ${instance.server_name}`}
        />

        {/* Instance Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Instance Information</CardTitle>
            <CardDescription>Basic instance details and control operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Instance ID</p>
                <p className="text-sm">{instance.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-sm">{instance.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Server</p>
                <p className="text-sm">{instance.server_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm capitalize">{instance.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(instance.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Updated</p>
                <p className="text-sm">{new Date(instance.updated_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-3">Control Operations</p>
              <InstanceControlButtons instance={instance} />
            </div>
          </CardContent>
        </Card>

        {/* Health and Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Requirement 7.3: Health card with auto-refresh */}
          <InstanceHealthCard 
            instanceId={params.id}
            initialHealth={health}
          />

          {/* Requirement 7.3: Stats card with auto-refresh */}
          <InstanceStatsCard 
            instanceId={params.id}
            initialStats={stats}
          />
        </div>
      </div>
    );
  } catch (error) {
    // If instance not found, show 404
    notFound();
  }
}
