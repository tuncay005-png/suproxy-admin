/**
 * Auto-Refresh Toggle Component
 * 
 * Provides a toggle switch to enable/disable automatic refresh of monitoring data.
 * 
 * ## Features
 * 
 * - Toggle switch to enable/disable auto-refresh (default: off)
 * - When enabled, triggers refresh callback every 30 seconds
 * - Displays last updated timestamp
 * - Clears interval when component unmounts or toggle disabled
 * - Manual refresh button for immediate updates
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.7
 * - 10.7: Auto-refresh health status every 30 seconds
 * 
 * @module components/admin/monitoring/auto-refresh-toggle
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Loader2, Clock } from 'lucide-react';

export interface AutoRefreshToggleProps {
  /**
   * Callback function to trigger data refresh
   * Should return a Promise that resolves when refresh is complete
   */
  onRefresh: () => Promise<void>;
  
  /**
   * Optional: Refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refreshInterval?: number;
  
  /**
   * Optional: Whether to show as a card or inline
   * @default 'card'
   */
  variant?: 'card' | 'inline';
}

/**
 * Format timestamp for display
 * 
 * @param date - Date object to format
 * @returns Formatted timestamp string
 */
function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Auto-refresh toggle component for monitoring data
 * 
 * Provides a toggle to enable/disable periodic data refresh with a configurable interval.
 * Displays the last updated timestamp and provides a manual refresh button.
 * 
 * @example
 * ```tsx
 * <AutoRefreshToggle 
 *   onRefresh={async () => await fetchMonitoringData()} 
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Inline variant with custom interval
 * <AutoRefreshToggle 
 *   onRefresh={refreshData}
 *   refreshInterval={60000}
 *   variant="inline"
 * />
 * ```
 */
export function AutoRefreshToggle({ 
  onRefresh, 
  refreshInterval = 30000,
  variant = 'card'
}: AutoRefreshToggleProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Execute refresh callback and update timestamp
   */
  const executeRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('[AUTO-REFRESH] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  /**
   * Handle manual refresh button click
   */
  const handleManualRefresh = () => {
    executeRefresh();
  };

  /**
   * Handle auto-refresh toggle
   * 
   * When enabled:
   * - Starts interval to call onRefresh every refreshInterval milliseconds
   * - Updates last updated timestamp after each refresh
   * 
   * When disabled:
   * - Clears the interval
   */
  const handleAutoRefreshToggle = (checked: boolean) => {
    setAutoRefresh(checked);
    
    if (checked) {
      // Start auto-refresh interval
      intervalRef.current = setInterval(() => {
        executeRefresh();
      }, refreshInterval);
    } else {
      // Stop auto-refresh and clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  /**
   * Cleanup interval on unmount
   * Ensures interval is cleared when component is removed from DOM
   */
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Convert refresh interval to seconds for display
   */
  const intervalSeconds = refreshInterval / 1000;

  // Inline variant (compact layout for integration into other components)
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-4 flex-1">
          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh-inline"
              checked={autoRefresh}
              onCheckedChange={handleAutoRefreshToggle}
              disabled={isRefreshing}
            />
            <Label htmlFor="auto-refresh-inline" className="text-sm font-medium cursor-pointer">
              Auto-refresh ({intervalSeconds}s)
            </Label>
          </div>
          
          {/* Last updated timestamp */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatTimestamp(lastUpdated)}</span>
          </div>
        </div>
        
        {/* Manual refresh button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualRefresh}
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
    );
  }

  // Card variant (standalone card component)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Auto-Refresh Settings</CardTitle>
        </div>
        <CardDescription>
          Automatically refresh monitoring data at regular intervals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-refresh toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-refresh-card" className="text-sm font-medium">
              Enable auto-refresh
            </Label>
            <p className="text-xs text-muted-foreground">
              Update monitoring data every {intervalSeconds} seconds
            </p>
          </div>
          <Switch
            id="auto-refresh-card"
            checked={autoRefresh}
            onCheckedChange={handleAutoRefreshToggle}
            disabled={isRefreshing}
          />
        </div>

        {/* Last updated timestamp */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last updated:</span>
            </div>
            <span className="text-sm font-medium">
              {formatTimestamp(lastUpdated)}
            </span>
          </div>
        </div>

        {/* Manual refresh button */}
        <div className="pt-2 border-t">
          <Button
            className="w-full"
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing data...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
