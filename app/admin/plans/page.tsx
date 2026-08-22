/**
 * Plans List Page with Server-Side Pagination
 */
export const dynamic = 'force-dynamic';

import { plansApi } from '@/lib/api/endpoints/plans';
import type { Plan } from '@/types/plan';
import { PageHeader } from '@/components/admin/page-header';
import { PlansTable } from '@/components/admin/plans/plans-table';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';

interface SearchParams {
  page?: string;
  limit?: string;
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parsedPage = parseInt(params.page || '1', 10);
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const parsedLimit = parseInt(params.limit || '20', 10);
  const limit = Math.min(Math.max(20, isNaN(parsedLimit) ? 20 : parsedLimit), 100);

  let plans: Plan[] = [];
  let total = 0;
  let error: Error | null = null;

  try {
    const response = await plansApi.list({ page, limit });
    plans = response.data.plans;
    total = response.data.total;
  } catch (err) {
    console.error('[PLANS-PAGE] Failed to fetch plans:', err);
    error = err as Error;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Subscription Plans"
        description="Manage subscription plans and pricing tiers"
      />

      {error ? (
        <ErrorState
          title="Unable to load plans"
          description="Backend service is temporarily unavailable. Please try again later."
          onRetry={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      ) : (
        <>
          <PlansTable plans={plans} />
          
          {total > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={limit}
              baseUrl="/admin/plans"
            />
          )}
        </>
      )}
    </div>
  );
}
