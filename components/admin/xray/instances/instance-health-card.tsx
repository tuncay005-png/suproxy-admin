/**
 * Instance Health Card Component
 * 
 * Displays health status for an Xray instance with color-coded indicators.
 * 
 * ## Features
 * 
 * - Health status display with visual indicators (healthy=green, unhealthy=red, unknown=gray)
 * - Uptime display formatted as human-readable duration
 * - Last check timestamp
 * - Error message display when unhealthy
 * - Auto-refresh toggle to update data every 30 seconds
 * - Manual refresh button
 * 
 * Validates: Requirements 4.7-4.9
 * 
 * @module components/admin/xray/instances/instance-health-card
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Loader2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { toast } from '@/lib/hooks/use-toast';
import type { XrayInstanceHealth } from '@/types/xray';

/**
 * Format uptime seconds to human-readable duration
 * 
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime string (e.g., "2d 5h 30m")
 */
function formatUptime(seconds: number): string {
  if (seconds === 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && days === 0) parts.push(`${secs}s`); // Only show seconds if less than a day
  
  return parts.join(' ');
}

export interface InstanceHealthCardProps {
  /**
   * The instance ID to fetch health data for
   */
  instanceId: string;
  
  /**
   * Initial health data from server-side fetch
   */
  initialHealth: XrayInstanceHealth;
}

/**
 * Instance health card component
 * 
 * Displays health status with color-coded indicators and supports auto-refresh.
 * 
 * Health indicator colors (Requirement 7.3):
 * - healthy: green
 * - unhealthy: red
 * - unknown: gray
 * 
 * @example
 * ```tsx
 * <InstanceHealthCard 
 *   instanceId="instance-123"
 *   initialHealth={healthData}
 * />
 * ```
 */
export function InstanceHealthCard({ instanceId, initialHealth }: InstanceHealthCardProps) {
  const [health, setHealth] = React.useState<XrayInstanceHealth>(initialHealth);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch fresh health data from the API
   */
  const fetchHealth = React.useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const response = await xrayApi.instances.getHealth(instanceId);
      setHealth(response.data);
      
      if (showToast) {
        toast.success('Health data refreshed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh health data';
      toast.error(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  }, [instanceId]);

  /**
   * Handle manual refresh button click
   */
  const handleRefresh = () => {
    fetchHealth(true);
  };

  /**
   * Handle auto-refresh toggle
   * Requirement 7.3: Auto-refresh toggle to refresh data every 30 seconds
   */
  const handleAutoRefreshToggle = (checked: boolean) => {
    setAutoRefresh(checked);
    
    if (checked) {
      // Start auto-refresh
      intervalRef.current = setInterval(() => {
        fetchHealth(false);
      }, 30000); // 30 seconds
      
      toast.success('Auto-refresh enabled (30s)');
    } else {
      // Stop auto-refresh
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      toast.info('Auto-refresh disabled');
    }
  };

  /**
   * Cleanup interval on unmount
   */
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Get color classes based on health status
   * Requirement 7.3: Health indicator colors
   */
  const getStatusColor = (status: XrayInstanceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'unknown':
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  /**
   * Get dot color based on health status
   */
  const getDotColor = (status: XrayInstanceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'unhealthy':
        return 'bg-red-500';
      case 'unknown':
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Health Status</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
        <CardDescription>Current health status and monitoring information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-md border',
            getStatusColor(health.status)
          )}>
            <span className={cn('h-2 w-2 rounded-full', getDotColor(health.status))} />
            <span className="text-sm font-medium capitalize">{health.status}</span>
          </div>
        </div>

        {/* Uptime Display */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Uptime</p>
          <p className="text-2xl font-semibold">{formatUptime(health.uptime)}</p>
        </div>

        {/* Last Check */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">Last Check</p>
          <p className="text-sm">{new Date(health.last_check).toLocaleString()}</p>
        </div>

        {/* Error Message (if unhealthy) */}
        {health.status === 'unhealthy' && health.error_message && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-destructive mb-1">Error Message</p>
            <p className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-md">
              {health.error_message}
            </p>
          </div>
        )}

        {/* Auto-refresh Toggle */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh" className="text-sm font-medium">
                Auto-refresh
              </Label>
              <p className="text-xs text-muted-foreground">
                Update health data every 30 seconds
              </p>
            </div>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={handleAutoRefreshToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
