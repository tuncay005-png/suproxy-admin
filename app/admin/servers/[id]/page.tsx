/**
 * Server Detail Page
 * 
 * Server Component that fetches and displays detailed server information
 * along with associated nodes.
 * 
 * ## Features
 * 
 * - Parallel data fetching for server and nodes using Promise.all
 * - Server details display (name, location, IP, status)
 * - Associated nodes list with health indicators
 * - Responsive layout with back navigation
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches server and nodes data in parallel
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 7.3-7.5
 * 
 * @module app/admin/servers/[id]/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Server as ServerIcon, MapPin, Globe, Network, Activity } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServerStatusBadge } from '@/components/admin/servers/server-status-badge';
import { NodesList } from '@/components/admin/servers/nodes-list';
import { serversApi } from '@/lib/api/endpoints/servers';
import { nodesApi } from '@/lib/api/endpoints/nodes';
import { formatDate } from '@/lib/utils/format';

interface ServerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch server details and associated nodes in parallel
 */
async function getServerData(id: string) {
  try {
    // Fetch server and nodes in parallel for optimal performance
    const [serverResponse, nodesResponse] = await Promise.all([
      serversApi.getById(id),
      nodesApi.listByServer(id),
    ]);

    return {
      server: serverResponse.data,
      nodes: nodesResponse.data.nodes,
    };
  } catch (error) {
    console.error('[SERVER-DETAIL-PAGE] Failed to fetch server data:', error);
    return null;
  }
}

export default async function ServerDetailPage({ params }: ServerDetailPageProps) {
  const { id } = await params;
  const data = await getServerData(id);

  if (!data) {
    notFound();
  }

  const { server, nodes } = data;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/servers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          heading="Server Details"
          description={`Viewing information for ${server.name}`}
        />
      </div>

      {/* Server Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{server.name}</CardTitle>
              <CardDescription>
                {server.city}, {server.country}
              </CardDescription>
            </div>
            <ServerStatusBadge status={server.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Server Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ServerIcon className="h-4 w-4" />
                Server Name
              </div>
              <p className="text-sm">{server.name}</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <p className="text-sm">
                {server.city}, {server.country}
              </p>
            </div>

            {/* IP Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Network className="h-4 w-4" />
                IP Address
              </div>
              <p className="text-sm font-mono">{server.ip_address}</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4" />
                Server Status
              </div>
              <ServerStatusBadge status={server.status} />
            </div>

            {/* Node Count */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                Active Nodes
              </div>
              <p className="text-sm">{server.node_count}</p>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                Created
              </div>
              <p className="text-sm">{formatDate(server.created_at)}</p>
            </div>

            {/* Server ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                Server ID
              </div>
              <p className="text-sm font-mono text-muted-foreground">{server.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nodes Card */}
      <Card>
        <CardHeader>
          <CardTitle>Server Nodes</CardTitle>
          <CardDescription>
            Services and processes running on this server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NodesList nodes={nodes} />
        </CardContent>
      </Card>
    </div>
  );
}
