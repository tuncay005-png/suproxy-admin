/**
 * Audit Logs Page
 * 
 * Server Component that fetches and displays audit logs with filtering.
 * 
 * ## Features
 * 
 * - Server-side data fetching with URL-based filters
 * - Pagination with configurable page sizes
 * - Filtering by action, entity type, and date range
 * - Displays audit trail of administrative actions
 * 
 * ## Data Flow
 * 
 * 1. Server Component reads filters from searchParams
 * 2. Fetches logs via auditApi.getLogs() with filters
 * 3. Data is passed to client components for rendering
 * 4. Error boundary handles fetch failures
 * 5. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 9.1-9.5, 9.7, 9.9
 * 
 * @module app/admin/logs/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { auditApi } from '@/lib/api/endpoints/audit';
import { PageHeader } from '@/components/admin/page-header';
import { AuditLogsTable } from '@/components/admin/logs/audit-logs-table';
import { AuditFilters } from '@/components/admin/logs/audit-filters';
import { AuditStatsCards } from '@/components/admin/logs/audit-stats-cards';
import type { AuditLogsFilter } from '@/types/audit';

export interface AuditLogsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    action?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
  };
}

/**
 * Audit Logs page - Server Component
 * 
 * Fetches audit logs server-side with filters from URL search params
 * and renders the audit log management interface.
 */
export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  // Parse search params into filter object
  const filters: AuditLogsFilter = {
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit, 10) : 25,
    action: searchParams.action || undefined,
    entity_type: searchParams.entity_type || undefined,
    start_date: searchParams.start_date || undefined,
    end_date: searchParams.end_date || undefined,
  };

  // Fetch audit logs with filters
  const response = await auditApi.getLogs(filters);
  const { logs, total, offset, limit } = response.data;

  // Calculate pagination info
  const currentPage = filters.page || 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Audit Logs"
        description="Track and monitor administrative actions"
      />

      {/* Stats cards */}
      <AuditStatsCards />

      {/* Filter controls */}
      <AuditFilters
        currentFilters={{
          action: filters.action,
          entity_type: filters.entity_type,
          start_date: filters.start_date,
          end_date: filters.end_date,
        }}
      />

      {/* Audit logs table with pagination */}
      <AuditLogsTable
        logs={logs}
        total={total}
        currentPage={currentPage}
        pageSize={limit}
        totalPages={totalPages}
      />
    </div>
  );
}
