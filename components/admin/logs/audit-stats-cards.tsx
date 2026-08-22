/**
 * Audit Stats Cards Component
 * 
 * Client Component that fetches and displays audit log statistics.
 * Shows total actions, recent activity count, and actions breakdown by type.
 * 
 * ## Features
 * 
 * - Fetches audit statistics from auditApi.getStats()
 * - Displays total_actions count as primary stat
 * - Displays recent_activity_count
 * - Shows actions_by_type as small stat cards
 * - Loading state during data fetch
 * - Error handling with retry capability
 * - Responsive grid layout
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirement 9.9
 * - 9.9: Display audit statistics showing action counts by type
 * 
 * @module components/admin/logs/audit-stats-cards
 */

'use client';

import * as React from 'react';
import { Activity, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { auditApi } from '@/lib/api/endpoints/audit';
import type { AuditStats } from '@/types/audit';

/**
 * Audit Stats Cards component
 * 
 * Displays audit log statistics including total actions,
 * recent activity, and breakdown by action type.
 * 
 * @example
 * ```tsx
 * <AuditStatsCards />
 * ```
 */
export function AuditStatsCards() {
  const [stats, setStats] = React.useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Fetch audit statistics from the API
   */
  const fetchStats = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await auditApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('[AUDIT_STATS] Failed to fetch audit stats:', err);
      setError('Failed to load audit statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stats on mount
  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Loading state
  if (isLoading) {
    return (
      <section 
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4" 
        aria-label="Audit Statistics"
        aria-busy="true"
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[120px] animate-pulse rounded-lg border bg-card"
            aria-hidden="true"
          />
        ))}
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No data state
  if (!stats) {
    return null;
  }

  // Get top 3 action types by count - defensive against missing data
  const topActions = Object.entries(stats.actions_by_type || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <section 
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4" 
      aria-label="Audit Statistics"
    >
      {/* Total Actions */}
      <StatCard
        title="Total Actions"
        value={stats.total_actions.toLocaleString()}
        description="All recorded actions"
        icon={FileText}
      />

      {/* Recent Activity */}
      <StatCard
        title="Recent Activity"
        value={stats.recent_activity_count.toLocaleString()}
        description="Actions in last 24h"
        icon={Activity}
      />

      {/* Top action types (up to 2 cards) */}
      {topActions.slice(0, 2).map(([action, count]) => {
        // Format action name: "user.create" -> "User Create"
        const formattedAction = action
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        return (
          <StatCard
            key={action}
            title={formattedAction}
            value={count.toLocaleString()}
            description={`${((count / stats.total_actions) * 100).toFixed(1)}% of total`}
            icon={TrendingUp}
          />
        );
      })}

      {/* If we have less than 2 top actions, show a placeholder */}
      {topActions.length < 2 && (
        <StatCard
          title="Action Types"
          value={Object.keys(stats.actions_by_type).length.toString()}
          description="Unique action types"
          icon={TrendingUp}
        />
      )}
    </section>
  );
}
