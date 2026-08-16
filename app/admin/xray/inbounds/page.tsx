/**
 * Xray Inbounds List Page
 * 
 * Server Component that fetches and displays the list of Xray inbound configurations.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Automatic loading and error states
 * - Responsive inbound table display
 * - Protocol, port, tag, enabled status, and associated instance display
 * - Status indicators with visual styling
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches inbounds data via xrayApi.inbounds.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 5.1, 5.2, 9.1
 * 
 * @module app/admin/xray/inbounds/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { PageHeader } from '@/components/admin/page-header';
import { InboundsTable } from '@/components/admin/xray/inbounds/inbounds-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

/**
 * Xray inbounds list page - Server Component
 * 
 * Fetches inbounds data server-side and renders the Xray inbound management interface.
 */
export default async function XrayInboundsPage() {
  // Fetch inbounds data server-side
  // Backend returns: {success: true, data: {inbounds: [...]}}
  const response = await xrayApi.inbounds.list();
  const inbounds = response.data.inbounds;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          heading="Xray Inbounds"
          description="Manage Xray inbound proxy configurations"
        />
        <Button asChild>
          <Link href="/admin/xray/inbounds/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Inbound
          </Link>
        </Button>
      </div>

      {/* Inbounds table */}
      <InboundsTable inbounds={inbounds} />
    </div>
  );
}
