/**
 * Inbounds Page Client Component
 * 
 * Client-side wrapper for the Inbounds page that provides i18n support
 * and manages the page layout with header and table.
 * 
 * Validates: Requirements 7.1, 7.5, 7.10, 3.23
 * 
 * @module components/admin/xray/inbounds-page-client
 */

'use client';

import { useTranslations } from '@/lib/i18n/context';
import { InboundsTable } from '@/components/admin/xray/inbounds-table';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { XrayInbound } from '@/types/xray';

export interface InboundsPageClientProps {
  /** Initial inbounds data from server */
  initialData: XrayInbound[];
  /** Error message if data fetch failed */
  error: string | null;
}

/**
 * InboundsPageClient Component
 * 
 * Renders the Inbounds page with i18n support for heading, description,
 * and button labels. Displays error state or table based on data availability.
 */
export function InboundsPageClient({ initialData, error }: InboundsPageClientProps) {
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        heading={t('xray.inbounds.title')}
        description={t('xray.inbounds.description')}
      >
        <Link href="/admin/xray/inbounds/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('xray.inbounds.add_inbound')}
          </Button>
        </Link>
      </PageHeader>

      {/* Error State */}
      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : (
        /* Inbounds Table */
        <InboundsTable initialData={initialData} />
      )}
    </div>
  );
}
