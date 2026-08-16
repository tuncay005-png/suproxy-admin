/**
 * Users List Page
 * 
 * Server Component that fetches and displays the list of users.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Automatic loading and error states
 * - Responsive user table display
 * - Search and refresh capabilities
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches users data via usersApi.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 4.1, 4.5, 4.7, 4.8, 11.1, 11.2
 * 
 * @module app/admin/users/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { usersApi } from '@/lib/api/endpoints/users';
import { PageHeader } from '@/components/admin/page-header';
import { UserListTableWithSearch } from '@/components/admin/users/user-list-table-with-search';
import { RefreshButton } from '@/components/admin/users/refresh-button';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

/**
 * Users list page - Server Component
 * 
 * Fetches users data server-side and renders the user management interface.
 */
export default async function UsersPage() {
  // Fetch users data server-side
  // Backend returns: {success: true, data: {users: [...], total, offset, limit}}
  const response = await usersApi.list();
  const users = response.data.users;

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

      {/* User list table with integrated search */}
      <UserListTableWithSearch users={users} />
    </div>
  );
}
