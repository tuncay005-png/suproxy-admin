/**
 * Servers List Page
 * 
 * Server Component that fetches and displays the list of servers.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Automatic loading and error states
 * - Responsive server table display
 * - Server name, country, city, IP address, status, and node count display
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches servers data via serversApi.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 7.1, 7.2, 11.1
 * 
 * @module app/admin/servers/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { serversApi } from '@/lib/api/endpoints/servers';
import { PageHeader } from '@/components/admin/page-header';
import { ServersTable } from '@/components/admin/servers/servers-table';

/**
 * Servers list page - Server Component
 * 
 * Fetches servers data server-side and renders the server management interface.
 */
export default async function ServersPage() {
  // Fetch servers data server-side
  // Backend returns: {success: true, data: {servers: [...], total: number}}
  const response = await serversApi.list();
  const servers = response.data.servers;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Servers"
        description="View and monitor server infrastructure"
      />

      {/* Servers table */}
      <ServersTable servers={servers} />
    </div>
  );
}
