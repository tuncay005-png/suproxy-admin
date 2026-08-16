/**
 * SystemHealthCard Component
 * 
 * Displays overall system health status and database connection.
 * Uses color-coded indicators (green=healthy, yellow=degraded, red=unhealthy).
 * 
 * ## Features
 * 
 * - Overall system health status indicator
 * - Database connection status
 * - Color-coded badges (healthy=green, degraded=yellow, unhealthy=red)
 * - Error handling with red indicator when health check fails
 * - Timestamp of last health check
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.1, 10.6
 * - 10.1: Display system health status from GET /api/v1/admin/system/health
 * - 10.6: Display red error indicator when health check fails
 * 
 * @module components/admin/monitoring/system-health-card
 */

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SystemHealth } from '@/types/system';

export interface SystemHealthCardProps {
  /**
   * System health data from the API
   * null indicates failed health check
   */
  health: SystemHealth | null;
}

/**
 * Get badge variant based on system health status
 */
function getHealthVariant(status: SystemHealth['status']): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'healthy':
      return 'default'; // Green
    case 'degraded':
      return 'secondary'; // Yellow
    case 'unhealthy':
      return 'destructive'; // Red
    default:
      return 'secondary';
  }
}

/**
 * Get badge color classes for system health status
 */
function getHealthColorClass(status: SystemHealth['status']): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700';
    case 'degraded':
      return 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700';
    case 'unhealthy':
      return 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700';
    default:
      return '';
  }
}

/**
 * Get database connection badge color
 */
function getDatabaseColorClass(status: SystemHealth['database']): string {
  return status === 'connected'
    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700';
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

/**
 * SystemHealthCard component for displaying overall system health
 * 
 * @example
 * ```tsx
 * <SystemHealthCard health={healthData} />
 * ```
 * 
 * @example
 * ```tsx
 * // Error state (failed health check)
 * <SystemHealthCard health={null} />
 * ```
 */
export function SystemHealthCard({ health }: SystemHealthCardProps) {
  // Error state - health check failed
  if (!health) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            <CardTitle>System Health</CardTitle>
          </div>
          <CardDescription>Overall system health status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Health check failed</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to retrieve system health data. The backend may be unavailable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <CardTitle>System Health</CardTitle>
        </div>
        <CardDescription>Overall system health status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">System Status:</span>
            <Badge 
              className={cn(
                'capitalize text-white',
                getHealthColorClass(health.status)
              )}
            >
              {health.status}
            </Badge>
          </div>
        </div>

        {/* Database Connection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Database:</span>
            <Badge 
              className={cn(
                'capitalize text-white',
                getDatabaseColorClass(health.database)
              )}
            >
              {health.database}
            </Badge>
          </div>
        </div>

        {/* Last Checked Timestamp */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Last checked: {formatTimestamp(health.timestamp)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
