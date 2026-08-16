/**
 * Server Status Badge Component
 * 
 * Displays visual status indicators for servers.
 * 
 * ## Features
 * 
 * - Color-coded status badges
 * - Online: green
 * - Offline: red
 * - Maintenance: yellow
 * 
 * Validates: Requirements 7.2, 7.6, 11.1
 * 
 * @module components/admin/servers/server-status-badge
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { Server } from '@/types/server';

export interface ServerStatusBadgeProps {
  /**
   * Server status
   */
  status: Server['status'];
}

/**
 * Status badge with color coding based on server state
 * 
 * @example
 * ```tsx
 * <ServerStatusBadge status="online" />
 * <ServerStatusBadge status="offline" />
 * <ServerStatusBadge status="maintenance" />
 * ```
 */
export function ServerStatusBadge({ status }: ServerStatusBadgeProps) {
  // Map status to badge variant and styling
  const statusConfig = {
    online: {
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
      label: 'Online',
    },
    offline: {
      variant: 'destructive' as const,
      className: '',
      label: 'Offline',
    },
    maintenance: {
      variant: 'default' as const,
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      label: 'Maintenance',
    },
  };

  const config = statusConfig[status] || statusConfig.offline;

  return (
    <Badge variant={config.variant} className={`whitespace-nowrap ${config.className}`}>
      {config.label}
    </Badge>
  );
}
