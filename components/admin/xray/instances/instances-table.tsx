/**
 * Instances Table Component
 * 
 * Displays Xray instances in a responsive table format with control operations.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays instance ID, status, uptime, and server location
 * - Status indicators with appropriate visual styling
 * - Control buttons for start, stop, restart, and reload operations
 * - Empty state when no instances exist
 * - Basic table layout for displaying instances
 * 
 * Validates: Requirements 4.1, 4.2, 4.3-4.6, 4.10, 7.1, 7.6, 9.2, 3.5
 * 
 * @module components/admin/xray/instances/instances-table
 */

'use client';

import * as React from 'react';
import type { XrayInstance } from '@/types/xray';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Radio } from 'lucide-react';
import { formatUptime } from '@/lib/utils/format';
import { InstanceStatusBadge } from './instance-status-badge';
import { InstanceControlButtons } from './instance-control-buttons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface InstancesTableProps {
  /**
   * Array of instances to display
   */
  instances: XrayInstance[];
}

/**
 * Instances table component
 * 
 * Renders instances in a table with columns for key instance information.
 * On mobile (< 768px): Shows only name and status
 * On tablet (≥ 768px): Shows name, status, and server
 * On desktop (≥ 1024px): Shows all columns including uptime
 * 
 * @example
 * ```tsx
 * <InstancesTable instances={instancesData} />
 * ```
 */
export function InstancesTable({ instances }: InstancesTableProps) {
  // Show empty state if no instances exist
  if (instances.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Radio}
            title="No Xray instances found"
            description="There are no Xray proxy instances configured yet"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xray Instances</CardTitle>
        <CardDescription>
          {instances.length} instance{instances.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="hidden md:table-cell min-w-[150px]">Server</TableHead>
                <TableHead className="hidden lg:table-cell">Uptime</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => {
                return (
                  <TableRow key={instance.id}>
                    <TableCell className="font-medium">{instance.name}</TableCell>
                    <TableCell>
                      <InstanceStatusBadge status={instance.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {instance.server_name || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                      {formatUptime(instance.uptime)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <InstanceControlButtons instance={instance} />
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/xray/instances/${instance.id}`}>View</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
