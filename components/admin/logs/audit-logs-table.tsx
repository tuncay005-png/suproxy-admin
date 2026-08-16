/**
 * Audit Logs Table Component
 * 
 * Displays audit log entries in a responsive table format with pagination.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays timestamp, actor, action, entity info, IP address, and status
 * - Relative time with full timestamp on hover
 * - Pagination controls with page size selection
 * - Empty state when no logs exist
 * 
 * Validates: Requirements 9.1, 9.2, 9.7
 * 
 * @module components/admin/logs/audit-logs-table
 */

'use client';

import * as React from 'react';
import { AuditLog } from '@/types/audit';
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
import { FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuditLogDetailDialog } from './audit-log-detail-dialog';
import { ExportLogsButton } from './export-logs-button';

export interface AuditLogsTableProps {
  /**
   * Array of audit logs to display
   */
  logs: AuditLog[];
  /**
   * Total number of logs (for pagination)
   */
  total: number;
  /**
   * Current page number (1-indexed)
   */
  currentPage: number;
  /**
   * Number of items per page
   */
  pageSize: number;
  /**
   * Total number of pages
   */
  totalPages: number;
}

/**
 * Get badge variant for log status
 */
function getStatusBadgeVariant(status: 'success' | 'failure'): 'default' | 'destructive' {
  return status === 'success' ? 'default' : 'destructive';
}

/**
 * Audit logs table component
 * 
 * Renders audit logs in a table with columns for key log information.
 * On mobile (< 768px): Shows only timestamp, actor, and action
 * On tablet (≥ 768px): Shows timestamp, actor, action, and status
 * On desktop (≥ 1024px): Shows all columns including entity type, entity ID, and IP address
 * 
 * @example
 * ```tsx
 * <AuditLogsTable 
 *   logs={logsData.logs} 
 *   total={logsData.total}
 *   currentPage={1}
 *   pageSize={25}
 *   totalPages={10}
 * />
 * ```
 */
export function AuditLogsTable({ logs, total, currentPage, pageSize, totalPages }: AuditLogsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for detail dialog
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  // Navigate to a different page
  const navigateToPage = React.useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/logs?${params.toString()}`);
  }, [router, searchParams]);

  // Change page size
  const changePageSize = React.useCallback((newSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newSize);
    params.set('page', '1'); // Reset to first page when changing page size
    router.push(`/admin/logs?${params.toString()}`);
  }, [router, searchParams]);

  // Show empty state if no logs exist
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={FileText}
            title="No audit logs found"
            description="No audit log entries match the current filters"
          />
        </CardContent>
      </Card>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              Showing {startItem}-{endItem} of {total} log entries
            </CardDescription>
          </div>
          <ExportLogsButton logs={logs} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Timestamp</TableHead>
                <TableHead className="min-w-[150px]">Actor</TableHead>
                <TableHead className="min-w-[150px]">Action</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[120px]">Entity Type</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[120px]">Entity ID</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[120px]">IP Address</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm" title={formatDateTime(log.created_at)}>
                          {formatRelativeTime(log.created_at)}
                        </span>
                        <span className="text-xs text-muted-foreground hidden xl:block">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{log.actor_email}</span>
                        <span className="text-xs text-muted-foreground">ID: {log.actor_id.substring(0, 8)}...</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.action}</code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{log.entity_type}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-mono text-xs">{log.entity_id.substring(0, 12)}...</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-mono text-xs">{log.ip_address}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={getStatusBadgeVariant(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Detail Dialog */}
        <AuditLogDetailDialog
          log={selectedLog}
          open={selectedLog !== null}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        />

        {/* Pagination Controls */}
        <div className="flex flex-col gap-4 pt-4 mt-4 border-t sm:flex-row sm:items-center sm:justify-between">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
            <Select value={pageSize.toString()} onValueChange={changePageSize}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
