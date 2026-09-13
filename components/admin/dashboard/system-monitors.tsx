/**
 * SystemMonitors Component
 * 
 * Displays real-time system resource usage in circular progress charts.
 * Monitors CPU, RAM, Disk, and Swap usage with automatic polling and error handling.
 * 
 * Features:
 * - Real-time data updates every 5 seconds
 * - Exponential backoff on API failures
 * - Error state with last known values and timestamps
 * - Warning indicator for stale data (>30 seconds old)
 * - Manual refresh button on errors
 * - Color-coded thresholds (green, yellow, red)
 * - Bilingual support (English/Russian)
 * 
 * Requirements Validation:
 * - 4.1-4.5: Four circular progress charts for CPU, RAM, Disk, Swap
 * - 4.9: Updates every 5 seconds with fresh data
 * - 4.10: Displays last known value with warning on fetch failure
 * - 6.4: Displays "Data unavailable" when API is unavailable
 * - 6.5: Automatic retry with exponential backoff
 * - 6.6: Updates all components within 100ms of successful fetch
 * - 6.7: Logs API errors to console
 * 
 * @module components/admin/dashboard/system-monitors
 */

'use client';

import React from 'react';
import { CircularProgressChart } from './circular-progress-chart';
import { useRealTimePolling } from '@/lib/hooks/use-real-time-polling';
import { useTranslations } from '@/lib/i18n/context';
import { systemApi } from '@/lib/api/endpoints';
import type { SystemHealth } from '@/types/system';
import { AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface SystemMonitorsProps {
  /** Initial health data from server-side fetch */
  initialHealth: SystemHealth | null;
}

/**
 * SystemMonitors Component
 * 
 * Client component that displays system resource usage with real-time updates.
 * Handles error states gracefully by showing last known values with timestamps.
 * 
 * @param initialHealth - Initial system health data from server component
 * 
 * @example
 * ```tsx
 * // In a server component
 * const health = await systemApi.getHealth();
 * 
 * // Pass to SystemMonitors
 * <SystemMonitors initialHealth={health.data} />
 * ```
 */
export function SystemMonitors({ initialHealth }: SystemMonitorsProps) {
  const { t } = useTranslations();

  // Real-time polling with 5-second interval
  const { data, error, isLoading, isFetching, refresh, lastUpdated } = useRealTimePolling(
    () => systemApi.getHealth(),
    5000, // 5 seconds
    {
      initialData: initialHealth,
      enableBackoff: true,
      maxBackoff: 60000,
      pauseOnInactive: true,
    }
  );

  // Calculate if data is stale (>30 seconds old)
  const isDataStale = lastUpdated 
    ? Date.now() - lastUpdated.getTime() > 30000 
    : false;

  // Show error state if we have an error and no data at all
  if (error && !data) {
    return (
      <section 
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" 
        aria-label="System Monitors"
      >
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('common.failed_to_load')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || t('common.error')}
            </p>
            <Button
              onClick={() => refresh()}
              disabled={isFetching}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // If we have data, display the charts
  // Use 0 as fallback values to prevent encoding issues
  const cpuUsage = data?.cpu_usage ?? 0;
  const ramUsed = data?.ram_used ?? 0;
  const ramTotal = data?.ram_total ?? 1; // Prevent division by zero
  const diskUsed = data?.disk_used ?? 0;
  const diskTotal = data?.disk_total ?? 1;
  const swapUsed = data?.swap_used ?? 0;
  const swapTotal = data?.swap_total ?? 1;

  return (
    <section className="space-y-4">
      {/* Warning banner for stale data or errors with data */}
      {(error || isDataStale) && data && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {error ? t('common.error') : t('common.data_stale')}
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  {t('common.last_updated')}: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                </p>
              )}
            </div>
            <Button
              onClick={() => refresh()}
              disabled={isFetching}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* System monitors grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      {/* Spacing: 12px mobile (gap-3), 16px tablet (md:gap-4), 24px desktop (lg:gap-6) */}
      <div 
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-6"
        aria-label="System Monitors"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* CPU Usage Chart */}
        <CircularProgressChart
          value={cpuUsage}
          max={100}
          label={t('monitoring.cpu_usage')}
          unit="%"
          ariaLabel={`${t('monitoring.cpu_usage')}: ${Math.round(cpuUsage)}%`}
        />

        {/* RAM Usage Chart */}
        <CircularProgressChart
          value={ramUsed}
          max={ramTotal}
          label={t('monitoring.ram_usage')}
          unit="MB"
          ariaLabel={`${t('monitoring.ram_usage')}: ${Math.round(ramUsed)} MB of ${Math.round(ramTotal)} MB`}
        />

        {/* Disk Usage Chart */}
        <CircularProgressChart
          value={diskUsed}
          max={diskTotal}
          label={t('monitoring.disk_usage')}
          unit="GB"
          ariaLabel={`${t('monitoring.disk_usage')}: ${Math.round(diskUsed)} GB of ${Math.round(diskTotal)} GB`}
        />

        {/* Swap Usage Chart */}
        <CircularProgressChart
          value={swapUsed}
          max={swapTotal}
          label={t('monitoring.swap_usage')}
          unit="MB"
          ariaLabel={`${t('monitoring.swap_usage')}: ${Math.round(swapUsed)} MB of ${Math.round(swapTotal)} MB`}
        />
      </div>

      {/* Loading indicator */}
      {isFetching && !isLoading && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="h-3 w-3 animate-spin" />
            {t('common.loading')}
          </p>
        </div>
      )}
    </section>
  );
}
