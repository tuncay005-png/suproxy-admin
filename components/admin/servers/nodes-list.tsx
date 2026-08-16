/**
 * Nodes List Component
 * 
 * Displays a list of nodes associated with a server, including node type,
 * name, status, and health metrics.
 * 
 * ## Features
 * 
 * - Display node type, name, status, and health metrics
 * - Health status indicator with colored dots
 * - CPU, memory, and disk usage metrics displayed as percentages
 * - Responsive table layout
 * - Empty state when no nodes exist
 * 
 * Validates: Requirements 7.4, 7.5, 11.2
 * 
 * @module components/admin/servers/nodes-list
 */

'use client';

import * as React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { NodeHealthIndicator } from './node-health-indicator';
import type { Node } from '@/types/server';

export interface NodesListProps {
  /**
   * Array of nodes to display
   */
  nodes: Node[];
}

/**
 * Format percentage value for display
 * Returns the value with 1 decimal place and % sign
 */
function formatPercentage(value: number | undefined): string {
  if (value === undefined || value === null) {
    return '—';
  }
  return `${value.toFixed(1)}%`;
}

/**
 * Get badge variant for node type
 */
function getNodeTypeBadgeVariant(type: Node['type']): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'xray':
      return 'default';
    case 'database':
      return 'secondary';
    case 'service':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Nodes list table with health indicators and metrics
 * 
 * @example
 * ```tsx
 * <NodesList nodes={serverNodes} />
 * ```
 */
export function NodesList({ nodes }: NodesListProps) {
  // Empty state
  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No nodes found for this server
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Node Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>CPU Usage</TableHead>
            <TableHead>Memory Usage</TableHead>
            <TableHead>Disk Usage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nodes.map((node) => (
            <TableRow key={node.id}>
              {/* Node Name */}
              <TableCell className="font-medium">
                {node.name}
              </TableCell>

              {/* Node Type */}
              <TableCell>
                <Badge variant={getNodeTypeBadgeVariant(node.type)}>
                  {node.type}
                </Badge>
              </TableCell>

              {/* Status with Health Indicator */}
              <TableCell>
                <NodeHealthIndicator status={node.status} showLabel />
              </TableCell>

              {/* CPU Usage */}
              <TableCell>
                {formatPercentage(node.health_metrics.cpu_usage)}
              </TableCell>

              {/* Memory Usage */}
              <TableCell>
                {formatPercentage(node.health_metrics.memory_usage)}
              </TableCell>

              {/* Disk Usage */}
              <TableCell>
                {formatPercentage(node.health_metrics.disk_usage)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
