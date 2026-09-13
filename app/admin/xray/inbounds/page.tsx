/**
 * Xray Inbounds Management Page
 * 
 * Server component that fetches inbound configurations from the backend API
 * and passes the data to the client-side InboundsTable component for display
 * and interaction.
 * 
 * This page displays all Xray inbound proxy configurations with:
 * - Name, protocol, port, and status columns
 * - Search functionality
 * - View, edit, and delete actions
 * - Bilingual support (English/Russian)
 * 
 * Validates: Requirements 7.1, 7.5, 7.10
 * 
 * @module app/admin/xray/inbounds/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { xrayApi } from '@/lib/api/endpoints/xray';
import { InboundsTable } from '@/components/admin/xray/inbounds-table';

/**
 * Metadata for the Inbounds page
 */
export const metadata = {
  title: 'Xray Inbounds | Suproxy Admin',
  description: 'Manage Xray inbound proxy configurations',
};

/**
 * Xray Inbounds Page Component
 * 
 * Fetches inbound configurations server-side and renders the InboundsTable
 * with the fetched data. The table component handles client-side interactions
 * like search, sorting, and CRUD actions.
 */
export default async function InboundsPage() {
  // Fetch inbounds data server-side
  // Backend returns: {success: true, data: {inbounds: [...]}}
  const response = await xrayApi.inbounds.list();
  const inbounds = response.data.inbounds;

  return (
    <div className="space-y-4 md:space-y-6">
      <InboundsTable initialData={inbounds} />
    </div>
  );
}
