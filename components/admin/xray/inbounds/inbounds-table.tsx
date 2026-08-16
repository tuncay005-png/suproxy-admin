/**
 * Inbounds Table Component
 * 
 * Displays Xray inbounds in a responsive table format.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays protocol, port, tag, enabled status, and associated instance
 * - Status indicators with appropriate visual styling
 * - Delete action button with confirmation dialog
 * - Empty state when no inbounds exist
 * 
 * Validates: Requirements 5.1, 5.2, 5.8, 9.1, 14.1, 16.1-16.2, 16.4
 * 
 * @module components/admin/xray/inbounds/inbounds-table
 */

'use client';

import * as React from 'react';
import type { XrayInbound } from '@/types/xray';
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
import { Activity } from 'lucide-react';
import { InboundStatusBadge } from './inbound-status-badge';
import { Badge } from '@/components/ui/badge';
import { DeleteInboundDialog } from './delete-inbound-dialog';

export interface InboundsTableProps {
  /**
   * Array of inbounds to display
   */
  inbounds: XrayInbound[];
}

/**
 * Inbounds table component
 * 
 * Renders inbounds in a table with columns for key inbound information.
 * On mobile (< 768px): Shows only protocol and port
 * On tablet (≥ 768px): Shows protocol, port, and tag
 * On desktop (≥ 1024px): Shows all columns including enabled status and instance
 * 
 * @example
 * ```tsx
 * <InboundsTable inbounds={inboundsData} />
 * ```
 */
export function InboundsTable({ inbounds }: InboundsTableProps) {
  // Show empty state if no inbounds exist
  if (inbounds.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Activity}
            title="No Xray inbounds found"
            description="There are no Xray inbound configurations yet"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xray Inbounds</CardTitle>
        <CardDescription>
          {inbounds.length} inbound{inbounds.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Protocol</TableHead>
                <TableHead className="min-w-[80px]">Port</TableHead>
                <TableHead className="hidden md:table-cell min-w-[150px]">Tag</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Status</TableHead>
                <TableHead className="hidden xl:table-cell min-w-[150px]">Instance</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inbounds.map((inbound) => {
                return (
                  <TableRow key={inbound.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="uppercase">
                        {inbound.protocol}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {inbound.port}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {inbound.tag}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <InboundStatusBadge enabled={inbound.enabled} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {inbound.instance_id ? (
                        <span className="text-sm">{inbound.instance_id.substring(0, 8)}...</span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <DeleteInboundDialog inbound={inbound} />
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
