/**
 * Servers Table Component
 * 
 * Displays servers in a responsive table format.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays server name, country, city, IP address, status, and node count
 * - Status indicators with appropriate visual styling
 * - Empty state when no servers exist
 * 
 * Validates: Requirements 7.1, 7.2, 7.6, 7.8, 11.1
 * 
 * @module components/admin/servers/servers-table
 */

'use client';

import * as React from 'react';
import type { Server } from '@/types/server';
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
import { Server as ServerIcon } from 'lucide-react';
import { ServerStatusBadge } from './server-status-badge';
import { Badge } from '@/components/ui/badge';

export interface ServersTableProps {
  /**
   * Array of servers to display
   */
  servers: Server[];
}

/**
 * Servers table component
 * 
 * Renders servers in a table with columns for key server information.
 * On mobile (< 768px): Shows only name and status
 * On tablet (≥ 768px): Shows name, location, and status
 * On desktop (≥ 1024px): Shows all columns including IP address and node count
 * 
 * @example
 * ```tsx
 * <ServersTable servers={serversData} />
 * ```
 */
export function ServersTable({ servers }: ServersTableProps) {
  // Show empty state if no servers exist
  if (servers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={ServerIcon}
            title="No servers found"
            description="No servers configured yet"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servers</CardTitle>
        <CardDescription>
          {servers.length} server{servers.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Country</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">City</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[120px]">IP Address</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="hidden xl:table-cell min-w-[80px]">Nodes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => {
                return (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">
                      {server.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {server.country}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {server.city}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                      {server.ip_address}
                    </TableCell>
                    <TableCell>
                      <ServerStatusBadge status={server.status} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant="outline">
                        {server.node_count}
                      </Badge>
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
