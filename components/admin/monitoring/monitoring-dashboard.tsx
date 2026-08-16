/**
 * Monitoring Dashboard Client Component
 * 
 * Client-side wrapper for monitoring data display with auto-refresh support.
 * Receives initial data from server component and allows client-side refreshing.
 * 
 * ## Features
 * 
 * - Displays system health, database, Xray, and version cards
 * - Integrates auto-refresh toggle for periodic updates
 * - Handles client-side data fetching and state management
 * - Preserves initial server-rendered data for fast page load
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.7
 * - 10.7: Auto-refresh health status every 30 seconds
 * 
 * @module components/admin/monitoring/monitoring-dashboard
 */

'use client';

import * as React from 'react';
import { SystemHealthCard } from './system-health-card';
import { DatabaseStatusCard } from './database-status-card';
import { XraySystemCard } from './xray-system-card';
import { VersionInfoCard } from './version-info-card';
import { AutoRefreshToggle } from './auto-refresh-toggle';
import { systemApi } from '@/lib/api/endpoints';
import type { SystemHealth, DatabaseStatus, XraySystemStatus, VersionInfo } from '@/types/system';
import type { ApiResponse } from '@/types/api';

export interface MonitoringDashboardProps {
  /**
   * Initial system health data from server
   */
  initialHealth: SystemHealth | null;
  
  /**
   * Initial database status from server
   */
  initialDatabase: DatabaseStatus | null;
  
  /**
   * Initial Xray system status from server
   */
  initialXray: XraySystemStatus | null;
  
  /**
   * Initial version info from server
   */
  initialVersion: VersionInfo | null;
}

/**
 * Client-side monitoring dashboard with auto-refresh capability
 * 
 * @example
 * ```tsx
 * // In server component (page.tsx)
 * const data = await fetchMonitoringData();
 * 
 * <MonitoringDashboard
 *   initialHealth={data.health}
 *   initialDatabase={data.database}
 *   initialXray={data.xray}
 *   initialVersion={data.version}
 * />
 * ```
 */
export function MonitoringDashboard({
  initialHealth,
  initialDatabase,
  initialXray,
  initialVersion,
}: MonitoringDashboardProps) {
  // State for monitoring data (initialized with server data)
  const [health, setHealth] = React.useState<SystemHealth | null>(initialHealth);
  const [database, setDatabase] = React.useState<DatabaseStatus | null>(initialDatabase);
  const [xray, setXray] = React.useState<XraySystemStatus | null>(initialXray);
  const [version, setVersion] = React.useState<VersionInfo | null>(initialVersion);

  /**
   * Refresh all monitoring data
   * Fetches fresh data from all endpoints and updates state
   */
  const refreshMonitoringData = React.useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [healthRes, databaseRes, xrayRes, versionRes] = await Promise.allSettled([
        systemApi.getHealth(),
        systemApi.getDatabaseStatus(),
        systemApi.getXraySystemStatus(),
        systemApi.getVersion(),
      ]);

      // Update state for each successful fetch
      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value.data);
      } else {
        console.error('[MONITORING] Failed to refresh system health:', healthRes.reason);
        setHealth(null);
      }

      if (databaseRes.status === 'fulfilled') {
        setDatabase(databaseRes.value.data);
      } else {
        console.error('[MONITORING] Failed to refresh database status:', databaseRes.reason);
        setDatabase(null);
      }

      if (xrayRes.status === 'fulfilled') {
        setXray(xrayRes.value.data);
      } else {
        console.error('[MONITORING] Failed to refresh Xray status:', xrayRes.reason);
        setXray(null);
      }

      if (versionRes.status === 'fulfilled') {
        setVersion(versionRes.value.data);
      } else {
        console.error('[MONITORING] Failed to refresh version info:', versionRes.reason);
        setVersion(null);
      }
    } catch (error) {
      console.error('[MONITORING] Error refreshing monitoring data:', error);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Auto-refresh toggle - inline variant */}
      <AutoRefreshToggle 
        onRefresh={refreshMonitoringData}
        refreshInterval={30000}
        variant="inline"
      />

      {/* Monitoring Cards Grid - Responsive: 1 col mobile, 2 col tablet/desktop */}
      <section className="grid gap-4 md:grid-cols-2" aria-label="System Monitoring">
        <SystemHealthCard health={health} />
        <DatabaseStatusCard database={database} />
        <XraySystemCard xray={xray} />
        <VersionInfoCard version={version} />
      </section>
    </div>
  );
}
