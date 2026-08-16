/**
 * Edit Xray Inbound Page
 * 
 * Server Component that renders the inbound edit form with pre-populated data.
 * 
 * ## Features
 * 
 * - Fetches existing inbound configuration by ID
 * - Pre-populates form with current data
 * - Protocol selection (vless, vmess, trojan, shadowsocks)
 * - Port configuration with validation
 * - Tag naming with alphanumeric validation
 * - Instance selection dropdown
 * - Protocol-specific settings fields
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches inbound data by ID
 * 2. Pre-populates form with existing configuration
 * 3. Client Component handles form interactions
 * 4. Form submission updates inbound via API
 * 5. Success shows toast and redirects to inbounds list
 * 
 * Validates: Requirements 5.5-5.6
 * 

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

 * @module app/admin/xray/inbounds/[id]/page
 */

import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { InboundForm } from '@/components/admin/xray/inbounds/inbound-form';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditInboundPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch inbound data by ID
 * 
 * @param id - Inbound UUID
 * @returns Inbound data or null if not found
 */
async function getInboundById(id: string) {
  try {
    const response = await xrayApi.inbounds.getById(id);
    return response.data;
  } catch (error) {
    console.error('[EDIT-INBOUND-PAGE] Failed to fetch inbound:', error);
    return null;
  }
}

/**
 * Edit inbound page - Server Component
 * 
 * Fetches inbound data and renders the edit form with pre-populated values.
 * 
 * Validates: Requirements 5.5-5.6
 */
export default async function EditInboundPage({ params }: EditInboundPageProps) {
  const { id } = await params;
  const inbound = await getInboundById(id);

  // Requirement 5.5: Show 404 if inbound not found
  if (!inbound) {
    notFound();
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/xray/inbounds">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          heading="Edit Xray Inbound"
          description={`Modify configuration for inbound: ${inbound.tag}`}
        />
      </div>

      {/* Requirement 5.5-5.6: Reuse inbound-form.tsx with pre-populated data */}
      <InboundForm 
        mode="edit" 
        inboundId={id}
        initialValues={{
          instance_id: inbound.instance_id,
          protocol: inbound.protocol,
          port: inbound.port,
          tag: inbound.tag,
          settings: inbound.settings,
        }}
      />
    </div>
  );
}
