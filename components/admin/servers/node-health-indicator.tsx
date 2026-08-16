/**
 * Node Health Indicator Component
 * 
 * Displays a visual health status indicator for nodes with a colored dot.
 * 
 * ## Features
 * 
 * - Color-coded health status indicators
 * - Healthy: green dot
 * - Unhealthy: red dot
 * - Unknown: gray dot
 * - Accessible labels for screen readers
 * 
 * Validates: Requirements 7.5, 11.2
 * 
 * @module components/admin/servers/node-health-indicator
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { Node } from '@/types/server';

export interface NodeHealthIndicatorProps {
  /**
   * Node health status
   */
  status: Node['status'];
  /**
   * Optional CSS classes
   */
  className?: string;
  /**
   * Show status label alongside the dot
   */
  showLabel?: boolean;
}

/**
 * Health indicator with colored dot based on node status
 * 
 * @example
 * ```tsx
 * <NodeHealthIndicator status="healthy" />
 * <NodeHealthIndicator status="unhealthy" showLabel />
 * <NodeHealthIndicator status="unknown" />
 * ```
 */
export function NodeHealthIndicator({ 
  status, 
  className,
  showLabel = false 
}: NodeHealthIndicatorProps) {
  // Map status to color and label
  const statusConfig = {
    healthy: {
      color: 'bg-green-500',
      label: 'Healthy',
    },
    unhealthy: {
      color: 'bg-red-500',
      label: 'Unhealthy',
    },
    unknown: {
      color: 'bg-gray-400',
      label: 'Unknown',
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Colored status dot */}
      <div 
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          config.color
        )}
        aria-label={`Status: ${config.label}`}
        role="status"
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {config.label}
        </span>
      )}
    </div>
  );
}
