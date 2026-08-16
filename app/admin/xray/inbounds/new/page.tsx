/**
 * Create Xray Inbound Page
 * 
 * Server Component that renders the inbound creation form.
 * 
 * ## Features
 * 
 * - Protocol selection (vless, vmess, trojan, shadowsocks)
 * - Port configuration with validation
 * - Tag naming with alphanumeric validation
 * - Instance selection dropdown
 * - Protocol-specific settings fields
 * 
 * ## Data Flow
 * 
 * 1. Server Component renders page with basic layout
 * 2. Client Component handles form interactions
 * 3. Form submission creates inbound via API
 * 4. Success redirects to inbounds list
 * 
 * Validates: Requirements 5.3, 5.4, 5.9, 5.10, 9.2
 * 
 * @module app/admin/xray/inbounds/new/page
 */

import { PageHeader } from '@/components/admin/page-header';
import { InboundForm } from '@/components/admin/xray/inbounds/inbound-form';

/**
 * Create inbound page - Server Component
 * 
 * Renders the page layout and inbound creation form.
 */
export default function NewInboundPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Create Xray Inbound"
        description="Configure a new inbound proxy connection"
      />

      {/* Inbound creation form with modular sub-components */}
      <InboundForm mode="create" />
    </div>
  );
}
