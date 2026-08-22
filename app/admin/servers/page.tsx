/**
 * Servers List Page with Server-Side Pagination
 */
export const dynamic = 'force-dynamic';

import { serversApi } from '@/lib/api/endpoints/servers';
import type { Server } from '@/types/server';
import { PageHeader } from '@/components/admin/page-header';
import { ServersTable } from '@/components/admin/servers/servers-table';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';

interface SearchParams {
  page?: string;
  limit?: string;
}

export default async function ServersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parsedPage = parseInt(params.page || '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const parsedLimit = parseInt(params.limit || '20', 10);
  const limit = Math.min(Math.max(20, isNaN(parsedLimit) ? 20 : parsedLimit), 100);

  let servers: Server[] = [];
  let total = 0;
  let error: Error | null = null;

  try {
    const response = await serversApi.list({ page, limit });
    servers = response.data.servers;
    total = response.data.total;
  } catch (err) {
    console.error('[SERVERS-PAGE] Failed to fetch servers:', err);
    error = err as Error;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Servers"
        description="View and monitor server infrastructure"
      />

      {error ? (
        <ErrorState
          title="Unable to load servers"
          description="Backend service is temporarily unavailable. Please try again later."
          onRetry={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      ) : (
        <>
          <ServersTable servers={servers} />
          
          {total > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={limit}
              baseUrl="/admin/servers"
            />
          )}
        </>
      )}
    </div>
  );
}
