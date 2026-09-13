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
 * - Client operation actions (regenerate UUID, reprovision, delete)
 * - Empty state when no clients exist
 * - Bilingual support (English/Russian) via i18n
 * 
 * Validates: Requirements 6.1, 6.2, 6.6, 6.7, 7.2, 7.6, 7.10, 10.1, 10.4, 14.1, 15.1-15.3
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
import { useTranslations } from '@/lib/i18n/context';
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
 * - Delete: Removes client configuration
 * 
 * @example
 * ```tsx
 * <ClientsTable clients={clientsData} />
 * ```
 */
export function ClientsTable({ clients }: ClientsTableProps) {
  const { t } = useTranslations();

  // Show empty state if no clients exist
  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Users}
            title={t('xray.clients.empty.title')}
            description={t('xray.clients.empty.description')}
          />
        </CardContent>
      </Card>
    );
  }

  // Determine plural/singular form for client count
  const clientCountLabel = clients.length === 1 
    ? t('xray.clients.count.client') 
    : t('xray.clients.count.clients');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('xray.clients.title')}</CardTitle>
        <CardDescription>
          {clients.length} {clientCountLabel} {t('xray.clients.count.configured')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">{t('xray.clients.table.email')}</TableHead>
                <TableHead className="min-w-[100px]">{t('xray.clients.table.status')}</TableHead>
                <TableHead className="hidden md:table-cell min-w-[180px]">{t('xray.clients.table.uuid')}</TableHead>
                <TableHead className="hidden md:table-cell min-w-[120px]">{t('xray.clients.table.inbound')}</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">{t('xray.clients.table.upload')}</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">{t('xray.clients.table.download')}</TableHead>
                <TableHead className="min-w-[240px] text-right">{t('xray.clients.table.actions')}</TableHead>
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
