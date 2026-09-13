/**
 * Xray Clients List Page
 * 
 * Server Component that fetches and displays all Xray clients with their
 * access configurations and traffic statistics.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Displays email, UUID, inbound, enabled status, and traffic stats
 * - Automatic loading and error states
 * - Responsive table display
 * - Bilingual support (English/Russian) via i18n
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches clients data via xrayApi.clients.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 6.1, 6.2, 7.2, 7.6, 7.10, 10.1
 * 
 * @module app/admin/xray/clients/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { xrayApi } from '@/lib/api/endpoints/xray';
import { ClientsTable } from '@/components/admin/xray/clients/clients-table';
import { ClientsPageHeader } from '@/components/admin/xray/clients/clients-page-header';

/**
 * Xray clients list page - Server Component
 * 
 * Fetches clients data server-side and renders the Xray client management interface.
 */
export default async function XrayClientsPage() {
  // Fetch clients data server-side
  // Backend returns: {success: true, data: {clients: [...]}}
  const response = await xrayApi.clients.list();
  const clients = response.data.clients;

  return (
    <div className="space-y-4 md:space-y-6">
      <ClientsPageHeader />

      {/* Clients table */}
      <ClientsTable clients={clients} />
    </div>
  );
}
