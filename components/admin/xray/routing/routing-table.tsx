/**
 * Routing Table Component
 * 
 * Displays Xray routing rules using the reusable DataTable component.
 * 
 * ## Features
 * 
 * - Uses DataTable component for consistent UI across Xray pages
 * - Displays rule name, type, action with custom rendering
 * - Status indicators with appropriate visual styling
 * - Search functionality for filtering rules
 * - Action dropdown for view, edit, delete operations
 * - Empty state when no rules exist
 * - Responsive mobile card layout
 * 
 * Validates: Requirements 7.4, 7.10, 8.1, 8.2, 8.5, 8.6
 * 
 * @module components/admin/xray/routing/routing-table
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { XrayRoutingRule } from '@/types/xray-routing';
import { DataTable, type DataTableColumn } from '@/components/admin/common/data-table';
import { useTranslations } from '@/lib/i18n/context';
import { Badge } from '@/components/ui/badge';
import { Map } from 'lucide-react';

export interface RoutingTableProps {
  /**
   * Array of routing rules to display
   */
  rules: XrayRoutingRule[];
}

/**
 * Routing table component
 * 
 * Renders routing rules using the DataTable component with proper i18n support.
 * Displays rule name, type, action with badges and status indicators.
 * 
 * @example
 * ```tsx
 * <RoutingTable rules={routingRules} />
 * ```
 */
export function RoutingTable({ rules }: RoutingTableProps) {
  const router = useRouter();
  const { t } = useTranslations();

  // Define columns configuration
  const columns: DataTableColumn<XrayRoutingRule>[] = [
    {
      key: 'name',
      label: t('xray.routing.name'),
      sortable: true,
      render: (value) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'type',
      label: t('xray.routing.type'),
      sortable: true,
      hiddenOnMobile: false,
      render: (value: XrayRoutingRule['type']) => (
        <Badge variant="outline" className="capitalize">
          {t(`xray.routing.types.${value}`)}
        </Badge>
      ),
    },
    {
      key: 'action',
      label: t('xray.routing.action'),
      sortable: true,
      hiddenOnTablet: true,
      render: (value: XrayRoutingRule['action']) => {
        const variantMap: Record<XrayRoutingRule['action'], 'default' | 'destructive' | 'secondary'> = {
          direct: 'default',
          block: 'destructive',
          proxy: 'secondary',
        };
        return (
          <Badge variant={variantMap[value]} className="capitalize">
            {t(`xray.routing.actions_types.${value}`)}
          </Badge>
        );
      },
    },
    {
      key: 'priority',
      label: t('xray.routing.priority'),
      sortable: true,
      hiddenOnTablet: true,
      className: 'text-muted-foreground font-mono',
    },
    {
      key: 'enabled',
      label: t('xray.routing.status'),
      sortable: true,
      hiddenOnMobile: true,
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? t('xray.routing.enabled') : t('xray.routing.disabled')}
        </Badge>
      ),
    },
  ];

  // Handle row actions
  const handleView = (rule: XrayRoutingRule) => {
    router.push(`/admin/xray/routing/${rule.id}`);
  };

  const handleEdit = (rule: XrayRoutingRule) => {
    router.push(`/admin/xray/routing/${rule.id}/edit`);
  };

  const handleDelete = async (rule: XrayRoutingRule) => {
    // TODO: Implement delete confirmation dialog
  };

  return (
    <DataTable
      columns={columns}
      data={rules}
      searchable={true}
      searchPlaceholder={`${t('common.search')} ${t('xray.routing.title').toLowerCase()}...`}
      searchKeys={['name', 'type', 'action']}
      actions={{
        view: handleView,
        edit: handleEdit,
        delete: handleDelete,
      }}
      emptyMessage={t('xray.routing.no_rules')}
      emptyDescription={t('xray.routing.no_rules_description')}
    />
  );
}
