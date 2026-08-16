/**
 * DatabaseStatusCard Component
 * 
 * Displays detailed database connection and performance metrics.
 * Shows connection status, response time, active connections, and max connections.
 * 
 * ## Features
 * 
 * - Connection status with color-coded indicator
 * - Response time in milliseconds
 * - Active connections vs max connections
 * - Connection utilization percentage
 * - Error handling with red indicator when database check fails
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.2, 10.6
 * - 10.2: Display database status (connected, response time) from GET /api/v1/admin/system/database
 * - 10.6: Display red error indicator when database check fails
 * 
 * @module components/admin/monitoring/database-status-card
 */

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DatabaseStatus } from '@/types/system';

export interface DatabaseStatusCardProps {
  /**
   * Database status data from the API
   * null indicates failed database check
   */
  database: DatabaseStatus | null;
}

/**
 * Get badge color for database connection status
 */
function getConnectionColorClass(status: DatabaseStatus['status']): string {
  return status === 'connected'
    ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700';
}

/**
 * Get color class for response time based on performance
 */
function getResponseTimeColor(responseTime: number): string {
  if (responseTime < 50) return 'text-green-600 dark:text-green-400';
  if (responseTime < 100) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get color class for connection utilization based on percentage
 */
function getUtilizationColor(utilization: number): string {
  if (utilization < 70) return 'text-green-600 dark:text-green-400';
  if (utilization < 90) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * DatabaseStatusCard component for displaying database metrics
 * 
 * @example
 * ```tsx
 * <DatabaseStatusCard database={databaseData} />
 * ```
 * 
 * @example
 * ```tsx
 * // Error state (failed database check)
 * <DatabaseStatusCard database={null} />
 * ```
 */
export function DatabaseStatusCard({ database }: DatabaseStatusCardProps) {
  // Error state - database check failed
  if (!database) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-500" />
            <CardTitle>Database Status</CardTitle>
          </div>
          <CardDescription>Connection and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Database check failed</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Unable to retrieve database status. The database may be unavailable.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate connection utilization percentage
  const utilization = database.max_connections > 0
    ? (database.active_connections / database.max_connections * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Database Status</CardTitle>
        </div>
        <CardDescription>Connection and performance metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge 
            className={cn(
              'capitalize text-white',
              getConnectionColorClass(database.status)
            )}
          >
            {database.status}
          </Badge>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Response Time:</span>
          </div>
          <span className={cn(
            'text-sm font-semibold',
            getResponseTimeColor(database.response_time_ms)
          )}>
            {database.response_time_ms} ms
          </span>
        </div>

        {/* Active Connections */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Connections:</span>
            </div>
            <span className="text-sm font-semibold">
              {database.active_connections} / {database.max_connections}
            </span>
          </div>
          
          {/* Connection Utilization Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all',
                  utilization < 70 ? 'bg-green-500' : utilization < 90 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <p className={cn(
              'text-xs font-medium text-right',
              getUtilizationColor(utilization)
            )}>
              {utilization.toFixed(1)}% utilization
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
