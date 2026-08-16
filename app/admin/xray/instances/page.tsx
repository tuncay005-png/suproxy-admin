/**
 * Xray Instances List Page
 * 
 * Server Component that fetches and displays the list of Xray proxy instances.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Automatic loading and error states
 * - Responsive instance table display
 * - Status indicators with visual styling
 * - Uptime and server location information
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches instances data via xrayApi.instances.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 4.1, 4.2, 7.1
 * 
 * @module app/admin/xray/instances/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { xrayApi } from '@/lib/api/endpoints/xray';
import { PageHeader } from '@/components/admin/page-header';
import { InstancesTable } from '@/components/admin/xray/instances/instances-table';

/**
 * Xray instances list page - Server Component
 * 
 * Fetches instances data server-side and renders the Xray instance management interface.
 */
export default async function XrayInstancesPage() {
  // Fetch instances data server-side
  // Backend returns: {success: true, data: {instances: [...]}}
  const response = await xrayApi.instances.list();
  const instances = response.data.instances;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Xray Instances"
        description="Monitor and manage Xray proxy server instances"
      />

      {/* Instances table */}
      <InstancesTable instances={instances} />
    </div>
  );
}
