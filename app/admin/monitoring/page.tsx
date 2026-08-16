/**
 * System Monitoring Page
 * 
 * Detailed monitoring view showing system health, database status,
 * Xray system status, and version information with auto-refresh capability.
 * 
 * ## Features
 * 
 * - Parallel data fetching for optimal performance
 * - System health overview with color-coded indicators
 * - Database connection and performance metrics
 * - Xray system statistics (instances and clients)
 * - Application version information
 * - Error handling with red indicators when health checks fail
 * - Auto-refresh toggle for periodic updates (30 seconds)
 * - Last updated timestamp display
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.1-10.4, 10.6, 10.7
 * - 10.1: Display system health status from GET /api/v1/admin/system/health
 * - 10.2: Display database status (connected, response time) from GET /api/v1/admin/system/database
 * - 10.3: Display Xray system status (instances running, total clients) from GET /api/v1/admin/system/xray
 * - 10.4: Display API version information from GET /api/v1/admin/system/version
 * - 10.6: Display a red status indicator and error message when any health check fails
 * - 10.7: Auto-refresh health status every 30 seconds
 * 
 * @module app/admin/monitoring/page
 */

// Force dynamic rendering - monitoring requires real-time backend data
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { MonitoringDashboard } from '@/components/admin/monitoring/monitoring-dashboard';
import { systemApi } from '@/lib/api/endpoints';

/**
 * Fetch all monitoring data in parallel
 * Uses Promise.allSettled to handle partial failures gracefully
 */
async function getMonitoringData() {
  try {
    const [health, database, xray, version] = await Promise.allSettled([
      systemApi.getHealth(),
      systemApi.getDatabaseStatus(),
      systemApi.getXraySystemStatus(),
      systemApi.getVersion(),
    ]);

    // Log failures for debugging
    if (health.status === 'rejected') {
      console.error('[MONITORING] Failed to fetch system health:', health.reason);
    }
    if (database.status === 'rejected') {
      console.error('[MONITORING] Failed to fetch database status:', database.reason);
    }
    if (xray.status === 'rejected') {
      console.error('[MONITORING] Failed to fetch Xray status:', xray.reason);
    }
    if (version.status === 'rejected') {
      console.error('[MONITORING] Failed to fetch version info:', version.reason);
    }

    return {
      health: health.status === 'fulfilled' ? health.value?.data ?? null : null,
      database: database.status === 'fulfilled' ? database.value?.data ?? null : null,
      xray: xray.status === 'fulfilled' ? xray.value?.data ?? null : null,
      version: version.status === 'fulfilled' ? version.value?.data ?? null : null,
    };
  } catch (error) {
    console.error('[MONITORING] Error fetching monitoring data:', error);
    return {
      health: null,
      database: null,
      xray: null,
      version: null,
    };
  }
}

export default async function MonitoringPage() {
  const { health, database, xray, version } = await getMonitoringData();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <PageHeader
        heading="System Monitoring"
        description="Real-time system health, database status, and infrastructure metrics with auto-refresh."
      />

      {/* Monitoring Dashboard with Auto-Refresh */}
      <MonitoringDashboard
        initialHealth={health}
        initialDatabase={database}
        initialXray={xray}
        initialVersion={version}
      />
    </div>
  );
}
