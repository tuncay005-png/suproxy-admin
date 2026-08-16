/**
 * Instance Stats Card Component
 * 
 * Displays statistics for an Xray instance including connections, traffic, and clients.
 * 
 * ## Features
 * 
 * - Active and total connections display
 * - Traffic up/down with formatted byte units (KB, MB, GB)
 * - Active and total clients count
 * - Auto-refresh toggle to update data every 30 seconds
 * - Manual refresh button
 * 
 * Validates: Requirements 4.7-4.9
 * 
 * @module components/admin/xray/instances/instance-stats-card
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Loader2, BarChart3, Users, Network, ArrowUp, ArrowDown } from 'lucide-react';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { toast } from '@/lib/hooks/use-toast';
import { formatNumber } from '@/lib/utils/format';
import type { XrayInstanceStats } from '@/types/xray';

/**
 * Format bytes to human-readable units (KB, MB, GB, TB)
 * Requirement 7.3: Format traffic numbers with byte units
 * 
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface InstanceStatsCardProps {
  /**
   * The instance ID to fetch stats data for
   */
  instanceId: string;
  
  /**
   * Initial stats data from server-side fetch
   */
  initialStats: XrayInstanceStats;
}

/**
 * Instance stats card component
 * 
 * Displays connection, traffic, and client statistics with auto-refresh capability.
 * 
 * @example
 * ```tsx
 * <InstanceStatsCard 
 *   instanceId="instance-123"
 *   initialStats={statsData}
 * />
 * ```
 */
export function InstanceStatsCard({ instanceId, initialStats }: InstanceStatsCardProps) {
  const [stats, setStats] = React.useState<XrayInstanceStats>(initialStats);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch fresh stats data from the API
   */
  const fetchStats = React.useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const response = await xrayApi.instances.getStats(instanceId);
      setStats(response.data);
      
      if (showToast) {
        toast.success('Stats refreshed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh stats';
      toast.error(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  }, [instanceId]);

  /**
   * Handle manual refresh button click
   */
  const handleRefresh = () => {
    fetchStats(true);
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
        fetchStats(false);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Statistics</CardTitle>
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
        <CardDescription>Current instance metrics and performance data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connections */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Network className="h-4 w-4" />
            <span>Connections</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold">{formatNumber(stats.connections_active)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{formatNumber(stats.connections_total)}</p>
            </div>
          </div>
        </div>

        {/* Traffic */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Traffic</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3" />
                <span>Upload</span>
              </div>
              <p className="text-lg font-semibold">{formatBytes(stats.traffic_up)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowDown className="h-3 w-3" />
                <span>Download</span>
              </div>
              <p className="text-lg font-semibold">{formatBytes(stats.traffic_down)}</p>
            </div>
          </div>
        </div>

        {/* Clients */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Clients</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold">{formatNumber(stats.clients_active)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{formatNumber(stats.clients_total)}</p>
            </div>
          </div>
        </div>

        {/* Auto-refresh Toggle */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stats-auto-refresh" className="text-sm font-medium">
                Auto-refresh
              </Label>
              <p className="text-xs text-muted-foreground">
                Update statistics every 30 seconds
              </p>
            </div>
            <Switch
              id="stats-auto-refresh"
              checked={autoRefresh}
              onCheckedChange={handleAutoRefreshToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
