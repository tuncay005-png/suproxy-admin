/**
 * ActivitySection Component
 * 
 * Displays real-time activity cards for Xray status, system uptime, and traffic monitoring.
 * Uses ActivityCard components in a responsive grid layout.
 * 
 * ## Features
 * 
 * - Real-time Xray status with running/stopped indicator
 * - System uptime display in days, hours, minutes format
 * - Traffic speed with current throughput
 * - Automatic polling every 10 seconds
 * - Responsive grid: vertical stack on mobile, horizontal on desktop
 * - Error handling with retry functionality
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.3, 10.3, 10.5
 * - 5.1: Display Xray Status Activity_Card showing operational state
 * - 5.2: Display "Running"/"Stopped" with green/red indicator dot
 * - 5.3: Display System Uptime Activity_Card
 * - 5.4: Display Traffic Speed Activity_Card
 * - 5.5: Display Total Traffic Activity_Card
 * - 5.6: Update every 10 seconds with fresh data
 * - 5.7: Update every 10 seconds
 * - 8.3: Stack vertically mobile, horizontal desktop
 * - 10.3: Activity Cards section below System Monitors
 * - 10.5: Display with appropriate spacing
 * 
 * @module components/admin/dashboard/activity-section
 */

'use client';

import React from 'react';
import { ActivityCard } from './activity-card';
import { useRealTimePolling } from '@/lib/hooks/use-real-time-polling';
import { useTranslations } from '@/lib/i18n/context';
import { systemApi } from '@/lib/api/endpoints';
import type { XrayStatus } from '@/types/system';
import { Activity, Clock, TrendingUp, HardDrive, AlertCircle, RefreshCw } from 'lucide-react';
import { formatTrafficSpeed, formatTrafficVolume, formatUptime } from '@/lib/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActivitySectionProps {
  /** Initial Xray status data from server-side fetch */
  initialXrayStatus: XrayStatus | null;
}

/**
 * ActivitySection Component
 * 
 * Client component that displays activity cards with real-time updates.
 * Handles error states gracefully by showing last known values.
 * 
 * @param initialXrayStatus - Initial Xray status data from server component
 * 
 * @example
 * ```tsx
 * // In a server component
 * const xrayStatus = await systemApi.getXrayStatus();
 * 
 * // Pass to ActivitySection
 * <ActivitySection initialXrayStatus={xrayStatus.data} />
 * ```
 */
export function ActivitySection({ initialXrayStatus }: ActivitySectionProps) {
  const { t } = useTranslations();

  // Real-time polling with 10-second interval
  const { data, error, isLoading, isFetching, refresh } = useRealTimePolling(
    () => systemApi.getXrayStatus(),
    10000, // 10 seconds
    {
      initialData: initialXrayStatus,
      enableBackoff: true,
      maxBackoff: 60000,
      pauseOnInactive: true,
    }
  );

  // Show error state if we have an error and no data at all
  if (error && !data) {
    return (
      <section 
        className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-3 lg:gap-6" 
        aria-label="Activity Status"
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

  // Extract data with safe fallbacks
  const xrayStatus = data?.status ?? 'stopped';
  const uptime = data?.uptime ?? 0;
  const trafficSpeed = data?.traffic_speed ?? 0;
  const trafficTotal = data?.traffic_total ?? 0;

  // Determine status indicator
  const isRunning = xrayStatus === 'running';
  const statusText = isRunning ? t('dashboard.running') : t('dashboard.stopped');
  const statusVariant = isRunning ? 'success' : 'error';

  return (
    <section 
      className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-3 lg:gap-6" 
      aria-label="Activity Status"
      aria-live="polite"
    >
      {/* Xray Status Card */}
      <ActivityCard
        icon={Activity}
        title={t('dashboard.xray_status')}
        value={statusText}
        status={statusVariant}
        statusDot={true}
      />

      {/* System Uptime Card */}
      <ActivityCard
        icon={Clock}
        title={t('dashboard.system_uptime')}
        value={formatUptime(uptime)}
        status="neutral"
      />

      {/* Traffic Speed Card */}
      <ActivityCard
        icon={TrendingUp}
        title={t('dashboard.traffic_speed')}
        value={formatTrafficSpeed(trafficSpeed)}
        description={`${formatTrafficVolume(trafficTotal)} ${t('dashboard.total_traffic_label')}`}
        status="neutral"
      />
    </section>
  );
}
