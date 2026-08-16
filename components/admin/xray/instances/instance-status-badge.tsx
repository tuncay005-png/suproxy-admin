/**
 * Instance Status Badge Component
 * 
 * Displays visual status indicators for Xray instances.
 * 
 * ## Features
 * 
 * - Color-coded status badges
 * - Running: green
 * - Stopped: gray
 * - Error: red
 * - Starting/Stopping: yellow
 * 
 * Validates: Requirements 4.2, 7.1
 * 
 * @module components/admin/xray/instances/instance-status-badge
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { XrayInstance } from '@/types/xray';

export interface InstanceStatusBadgeProps {
  /**
   * Instance status
   */
  status: XrayInstance['status'];
}

/**
 * Status badge with color coding based on instance state
 * 
 * @example
 * ```tsx
 * <InstanceStatusBadge status="running" />
 * <InstanceStatusBadge status="stopped" />
 * ```
 */
export function InstanceStatusBadge({ status }: InstanceStatusBadgeProps) {
  // Map status to badge variant and styling
  const statusConfig = {
    running: {
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
      label: 'Running',
    },
    stopped: {
      variant: 'secondary' as const,
      className: '',
      label: 'Stopped',
    },
    error: {
      variant: 'destructive' as const,
      className: '',
      label: 'Error',
    },
    starting: {
      variant: 'default' as const,
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      label: 'Starting',
    },
    stopping: {
      variant: 'default' as const,
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      label: 'Stopping',
    },
  };

  const config = statusConfig[status] || statusConfig.stopped;

  return (
    <Badge variant={config.variant} className={`whitespace-nowrap ${config.className}`}>
      {config.label}
    </Badge>
  );
}
