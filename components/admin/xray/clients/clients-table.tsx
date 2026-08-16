/**
 * Clients Table Component
 * 
 * Displays Xray clients in a responsive table format with traffic statistics,
 * status indicators, and client operation controls.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays email, UUID, inbound tag, enabled status, and traffic stats
 * - Status indicators with appropriate visual styling
 * - Traffic formatted as human-readable byte units (KB, MB, GB)
 * - Client operation actions (regenerate UUID, reprovision)
 * - Empty state when no clients exist
 * 
 * Validates: Requirements 6.1, 6.2, 6.6, 6.7, 10.1, 10.4, 14.1, 15.1-15.3
 * 
 * @module components/admin/xray/clients/clients-table
 */

'use client';

import * as React from 'react';
import type { XrayClient } from '@/types/xray';
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
import { Users } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import { ClientStatusBadge } from './client-status-badge';
import { RegenerateUuidDialog } from './regenerate-uuid-dialog';
import { ReprovisionClientDialog } from './reprovision-client-dialog';
import { DeleteClientDialog } from './delete-client-dialog';

export interface ClientsTableProps {
  /**
   * Array of clients to display
   */
  clients: XrayClient[];
}

/**
 * Clients table component
 * 
 * Renders clients in a table with columns for key client information
 * and action buttons for client operations.
 * 
 * Responsive behavior:
 * - Mobile (< 768px): Shows email, status, and actions
 * - Tablet (≥ 768px): Adds UUID and inbound
 * - Desktop (≥ 1024px): Shows all columns including traffic stats
 * 
 * Actions:
 * - Regenerate UUID: Creates new UUID (invalidates existing configs)
 * - Reprovision: Regenerates configuration with current inbound settings
 * 
 * @example
 * ```tsx
 * <ClientsTable clients={clientsData} />
 * ```
 */
export function ClientsTable({ clients }: ClientsTableProps) {
  // Show empty state if no clients exist
  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Users}
            title="No Xray clients found"
            description="There are no client access configurations yet"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xray Clients</CardTitle>
        <CardDescription>
          {clients.length} client{clients.length !== 1 ? 's' : ''} configured
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="hidden md:table-cell min-w-[180px]">UUID</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">Inbound</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Upload</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Download</TableHead>
                <TableHead className="min-w-[240px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                return (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.email}</TableCell>
                    <TableCell>
                      <ClientStatusBadge enabled={client.enabled} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">
                      {client.uuid}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {client.inbound_tag || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                      {formatBytes(client.traffic_up)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                      {formatBytes(client.traffic_down)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <RegenerateUuidDialog client={client} />
                        <ReprovisionClientDialog client={client} />
                        <DeleteClientDialog client={client} />
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
