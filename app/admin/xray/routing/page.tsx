/**
 * Xray Routing Rules List Page
 * 
 * Server Component that fetches and displays the list of Xray routing rules.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Automatic loading and error states
 * - Responsive routing rules table display
 * - Rule name, type, action, priority, and status display
 * - Status indicators with visual styling
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches routing rules via xrayApi.routing.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 7.4, 7.10
 * 
 * @module app/admin/xray/routing/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { PageHeader } from '@/components/admin/page-header';
import { RoutingTable } from '@/components/admin/xray/routing/routing-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * Xray routing rules list page - Server Component
 * 
 * Fetches routing rules data server-side and renders the Xray routing management interface.
 */
export default async function XrayRoutingPage() {
  // Fetch routing rules data server-side
  // Backend returns: {success: true, data: {rules: [...]}}
  const response = await xrayApi.routing.list();
  const rules = response.data.rules;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          heading="Xray Routing"
          description="Manage Xray traffic routing rules"
        />
        <Button asChild>
          <Link href="/admin/xray/routing/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Link>
        </Button>
      </div>

      {/* Routing rules table */}
      <RoutingTable rules={rules} />
    </div>
  );
}
