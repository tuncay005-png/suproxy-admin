/**
 * Dashboard Overview Page
 * 
 * Main landing page for authenticated administrators.
 * Displays key metrics, recent activity, and quick actions.
 * 
 * ## Features
 * 
 * - Stat cards showing system metrics from real backend data:
 *   - Total Users (with active users count)
 *   - Xray Instances (with running instances count)
 *   - Servers (with online servers count)
 *   - Plans (with active plans count)
 *   - System Status (health check)
 * - Recent activity feed from audit logs
 * - Quick action buttons for common tasks
 * - Responsive layout (mobile, tablet, desktop)
 * - Error handling for unavailable backend
 * - All stat cards are clickable and link to their respective pages
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 3.1, 3.2, 3.4, 3.5, 7.6, 10.5
 * - 3.1: Dashboard displays multiple statistic cards
 * - 3.2: Dashboard displays a recent activity section
 * - 3.4: Uses Admin_Layout component (inherited)
 * - 3.5: Dashboard is responsive and displays correctly on mobile, tablet, desktop
 * - 7.6: TailwindCSS applied for responsive styling
 * - 10.5: Displays real data from backend endpoints (stats, health, audit logs)
 * 
 * @module app/admin/page
 */

// Force dynamic rendering - admin dashboard requires authentication and real-time data
export const dynamic = 'force-dynamic';

import * as React from 'react';
import NextDynamic from 'next/dynamic';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { QuickActions } from '@/components/admin/dashboard/quick-actions';
import { SystemMonitors } from '@/components/admin/dashboard/system-monitors';
import { ActivitySection } from '@/components/admin/dashboard/activity-section';
import { Users, Server, CreditCard, Activity, Network } from 'lucide-react';
import { systemApi, serversApi, plansApi, auditApi } from '@/lib/api/endpoints';
import type { AuditLog } from '@/types/audit';

// Lazy load ActivityFeed component (below-the-fold)
// This improves LCP (Largest Contentful Paint) by prioritizing above-the-fold content
const ActivityFeed = NextDynamic(
  () => import('@/components/admin/dashboard/activity-feed').then(mod => ({ default: mod.ActivityFeed })),
  {
    loading: () => <ActivityFeedSkeleton />,
    // ssr: true is required in Server Components
  }
);

/**
 * Loading skeleton for ActivityFeed component
 * Displayed while the lazy-loaded component is being fetched
 */
function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          {/* Icon skeleton */}
          <div className="h-9 w-9 shrink-0 rounded-full bg-muted animate-pulse" />
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Fetch dashboard data from the backend
 * This runs server-side during page load
 */
async function getDashboardData() {
  try {
    // Fetch all dashboard data in parallel
    const [stats, health, xrayStatus, auditLogs, servers, plans] = await Promise.allSettled([
      systemApi.getStats(),
      systemApi.getHealth(),
      systemApi.getXrayStatus(), // Add Xray status for ActivitySection
      auditApi.getLogs({ page: 1, limit: 10 }), // Get recent 10 logs
      serversApi.list(),
      plansApi.list(),
    ]);

    // Log failures for debugging
    if (stats.status === 'rejected') {
      console.error('[DASHBOARD] Failed to fetch system stats:', stats.reason);
    }
    if (health.status === 'rejected') {
      console.error('[DASHBOARD] Failed to fetch system health:', health.reason);
    }
    if (xrayStatus.status === 'rejected') {
      console.error('[DASHBOARD] Failed to fetch Xray status:', xrayStatus.reason);
    }
    if (auditLogs.status === 'rejected') {
      console.error('[DASHBOARD] Failed to fetch audit logs:', auditLogs.reason);
    }
    if (servers.status === 'rejected') {
      console.error('[DASHBOARD] Failed to fetch servers:', servers.reason);
    }
    if (plans.status === 'rejected') {
      console.error('[DASHBOARD] Failed to fetch plans:', plans.reason);
    }
    
    return {
      stats: stats.status === 'fulfilled' ? stats.value : null,
      health: health.status === 'fulfilled' ? health.value : null,
      xrayStatus: xrayStatus.status === 'fulfilled' ? xrayStatus.value : null,
      auditLogs: auditLogs.status === 'fulfilled' ? auditLogs.value : null,
      servers: servers.status === 'fulfilled' ? servers.value : null,
      plans: plans.status === 'fulfilled' ? plans.value : null,
    };
  } catch (error) {
    console.error('[DASHBOARD] Error fetching dashboard data:', error);
    // Return null values - dashboard will display unavailable state
    
    return {
      stats: null,
      health: null,
      xrayStatus: null,
      auditLogs: null,
      servers: null,
      plans: null,
    };
  }
}

export default async function DashboardPage() {
  const { stats, health, xrayStatus, auditLogs, servers, plans } = await getDashboardData();

  // Calculate values from fetched data
  // systemApi.getStats returns ApiResponse<{...}> where data contains the flat stats object
  const totalUsers = stats?.data?.total_users ?? 'â€”';
  const activeUsers = stats?.data?.active_users ?? 0;
  
  const totalXrayInstances = stats?.data?.total_xray_instances ?? 'â€”';
  const activeXrayInstances = stats?.data?.active_xray_instances ?? 0;
  
  // Get recent audit actions count from auditApi.getLogs total
  // Use the total count from audit logs response for accurate count
  const recentAuditActions = auditLogs?.data?.total ?? 'â€”';
  
  // Get server count from serversApi.list
  // serversApi.list returns ApiResponse<ServersListResponse> where data.servers is the array
  const serverCount = servers?.data?.servers?.length ?? 'â€”';
  const onlineServers = servers?.data?.servers?.filter(s => s.status === 'online').length ?? 0;
  
  // Get plan count from plansApi.list
  // plansApi.list returns ApiResponse<PlansListResponse> where data.plans is the array
  const planCount = plans?.data?.plans?.length ?? 'â€”';
  const activePlans = plans?.data?.plans?.filter(p => p.active).length ?? 0;
  
  // Get recent logs from audit logs response
  // auditApi.getLogs returns ApiResponse<AuditLogsListResponse> where data.logs is the array
  const recentLogs: AuditLog[] = auditLogs?.data?.logs ?? [];

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      {/* Page Header */}
      <PageHeader
        heading="Dashboard"
        description="Welcome to the admin dashboard. Monitor system statistics and recent activity."
      />

      {/* System Monitors Section - Circular Progress Charts */}
      {/* Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      {/* Spacing: 12px mobile (gap-3), 16px tablet (md:gap-4), 24px desktop (lg:gap-6) */}
      <SystemMonitors initialHealth={health?.data ?? null} />

      {/* Activity Section - Xray Status, Uptime, Traffic */}
      {/* Responsive: stack vertically mobile, horizontal desktop (3 columns) */}
      {/* Spacing: 12px mobile (gap-3), 16px tablet (md:gap-4), 24px desktop (lg:gap-6) */}
      <ActivitySection initialXrayStatus={xrayStatus?.data ?? null} />

      {/* Stat Cards Section - Responsive: 1 col mobile, 2 small, 3 tablet, 5 desktop */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-6" aria-label="Statistics">
        <StatCard
          title="Total Users"
          value={String(totalUsers)}
          description={stats?.data ? `${activeUsers} active` : 'Data unavailable'}
          icon={Users}
          href="/admin/users"
        />

        <StatCard
          title="Xray Instances"
          value={String(totalXrayInstances)}
          description={stats?.data ? `${activeXrayInstances} active` : 'Data unavailable'}
          icon={Network}
          href="/admin/xray/instances"
        />

        <StatCard
          title="Servers"
          value={String(serverCount)}
          description={servers?.data ? `${onlineServers} online` : 'Data unavailable'}
          icon={Server}
          href="/admin/servers"
        />

        <StatCard
          title="Plans"
          value={String(planCount)}
          description={plans?.data ? `${activePlans} active` : 'Data unavailable'}
          icon={CreditCard}
          href="/admin/plans"
        />

        <StatCard
          title="Recent Actions"
          value={String(recentAuditActions)}
          description={stats?.data ? 'Audit log entries' : 'Data unavailable'}
          icon={Activity}
          href="/admin/logs"
        />
      </section>

      {/* Activity Feed Section */}
      <section className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-7 lg:gap-6" aria-label="Activity and Actions">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest administrative actions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed auditLogs={recentLogs} />
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

