/**
 * Clients Page Header Component
 * 
 * Displays the page title and description for the Xray Clients page
 * with i18n support for English and Russian languages.
 * 
 * ## Features
 * 
 * - Bilingual support (English/Russian)
 * - Integrates with i18n context
 * - Uses PageHeader component for consistent styling
 * 
 * Validates: Requirements 7.2, 7.10
 * 
 * @module components/admin/xray/clients/clients-page-header
 */

'use client';

import { PageHeader } from '@/components/admin/page-header';
import { useTranslations } from '@/lib/i18n/context';

/**
 * Clients page header with i18n support
 * 
 * Displays translated title and description for the Xray clients page.
 */
export function ClientsPageHeader() {
  const { t } = useTranslations();

  return (
    <PageHeader
      heading={t('xray.clients.title')}
      description={t('xray.clients.description')}
    />
  );
}
