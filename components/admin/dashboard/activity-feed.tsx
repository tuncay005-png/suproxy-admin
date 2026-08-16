/**
 * ActivityFeed Component
 * 
 * Displays recent administrative actions and system events from audit logs.
 * 
 * ## Features
 * 
 * - Chronological list of recent activities from backend audit logs
 * - Visual indicators for different activity types
 * - Relative timestamps
 * - Accessible semantic HTML
 * - Graceful handling of empty or unavailable data
 * - Clickable items to view log details
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 3.2, 9.10, 12.3
 * - 3.2: Dashboard displays a recent activity section
 * - 9.10: Activity feed updates with recent logs
 * - 12.3: Activity feed items clickable to view log detail
 * 
 * @module components/admin/dashboard/activity-feed
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { 
  User, 
  UserPlus, 
  Server, 
  Shield, 
  Activity,
  Settings,
  type LucideIcon 
} from 'lucide-react';
import type { AuditLog } from '@/types/audit';
import { AuditLogDetailDialog } from '@/components/admin/logs/audit-log-detail-dialog';

/**
 * Props for the ActivityFeed component
 */
export interface ActivityFeedProps {
  /**
   * Array of audit log entries to display
   */
  auditLogs: AuditLog[];
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Map entity types to their corresponding icons
 */
const ENTITY_ICONS: Record<string, LucideIcon> = {
  user: User,
  xray_instance: Server,
  inbound: Settings,
  client: UserPlus,
  server: Server,
  plan: Shield,
  default: Activity,
};

/**
 * Map actions to their icon colors
 */
const ACTION_COLORS: Record<string, string> = {
  create: 'text-green-500',
  update: 'text-blue-500',
  delete: 'text-red-500',
  start: 'text-green-500',
  stop: 'text-orange-500',
  restart: 'text-yellow-500',
  enable: 'text-green-500',
  disable: 'text-gray-500',
  default: 'text-gray-500',
};

/**
 * Format relative time from ISO timestamp
 */
function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  } catch (error) {
    return isoString;
  }
}

/**
 * Format action description from audit log entry
 */
function formatActivityDescription(log: AuditLog): string {
  const action = log.action.toLowerCase();
  const entityType = log.entity_type.replace(/_/g, ' ');

  // Capitalize first letter
  return `${action.charAt(0).toUpperCase()}${action.slice(1)} ${entityType}`;
}

/**
 * ActivityFeed Component
 * 
 * Displays a chronological list of recent administrative actions and system events
 * from the backend audit logs. Items are clickable to view full log details.
 */
export function ActivityFeed({ auditLogs, className }: ActivityFeedProps) {
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8', className)}>
        <Activity className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {auditLogs.map((log) => {
          const Icon = ENTITY_ICONS[log.entity_type] || ENTITY_ICONS.default;
          const iconColor = ACTION_COLORS[log.action.toLowerCase()] || ACTION_COLORS.default;

          return (
            <button
              key={log.id}
              className="flex items-start gap-4 w-full text-left hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
              onClick={() => setSelectedLog(log)}
              type="button"
            >
              {/* Activity Icon */}
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted', iconColor)}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Activity Details */}
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-sm font-medium leading-none">
                  {formatActivityDescription(log)}
                </p>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  {log.ip_address && (
                    <p className="text-xs text-muted-foreground">
                      from {log.ip_address}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {log.ip_address && <span className="hidden sm:inline">• </span>}
                    {formatRelativeTime(log.created_at)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Log Detail Dialog */}
      <AuditLogDetailDialog
        log={selectedLog}
        open={selectedLog !== null}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </>
  );
}
