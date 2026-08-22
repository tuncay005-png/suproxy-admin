/**
 * Users List Page with Server-Side Pagination
 * 
 * Server Component that fetches and displays paginated users.
 * Uses URL searchParams for pagination state (back/forward compatible).
 * 
 * ## Features
 * 
 * - Server-side pagination via searchParams
 * - Configurable page size (20/50/100)
 * - Previous/Next navigation
 * - Total count display
 * - Graceful error handling
 * 
 * Validates: Requirements 4.1, 4.5, 4.7, 4.8, 11.1, 11.2
 * 
 * @module app/admin/users/page
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { usersApi } from '@/lib/api/endpoints/users';
import type { User } from '@/types/user';
import { PageHeader } from '@/components/admin/page-header';
import { UserListTableWithSearch } from '@/components/admin/users/user-list-table-with-search';
import { RefreshButton } from '@/components/admin/users/refresh-button';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface SearchParams {
  page?: string;
  limit?: string;
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams as per Next.js requirements
  const params = await searchParams;
  
  // Parse pagination params with NaN handling
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '20', 10);
  
  // Handle NaN from invalid input
  const safePage = isNaN(page) ? 1 : page;
  const safeLimit = isNaN(limit) ? 20 : limit;

  // Validate and clamp values
  const validPage = Math.max(1, safePage);
  const validLimit = Math.min(Math.max(20, safeLimit), 100);

  let users: User[] = [];
  let total = 0;
  let error: Error | null = null;

  try {
    const response = await usersApi.list({ page: validPage, limit: validLimit });
    users = response.data.users;
    total = response.data.total;
  } catch (err) {
    console.error('[USERS-PAGE] Failed to fetch users:', err);
    error = err as Error;
  }

  const totalPages = Math.ceil(total / validLimit);

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Users"
        description="Manage user accounts and permissions"
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <RefreshButton />
            <Button asChild className="w-full sm:w-auto">
              <Link href="/admin/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Link>
            </Button>
          </div>
        }
      />

      {error ? (
        <ErrorState
          title="Unable to load users"
          description="Backend service is temporarily unavailable. Please try again later."
          onRetry={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      ) : (
        <>
          <UserListTableWithSearch users={users} />
          
          {total > 0 && (
            <Pagination
              currentPage={validPage}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={validLimit}
              baseUrl="/admin/users"
            />
          )}
        </>
      )}
    </div>
  );
}
