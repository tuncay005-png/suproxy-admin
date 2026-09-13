/**
 * Nodes Table Component
 * 
 * Client component displaying server nodes in a responsive data table.
 * Provides search, sorting, and management actions (view, edit, delete).
 * 
 * Features:
 * - Real-time search across name, type, status, server
 * - Column sorting by name, type, status
 * - Action menu for view, edit, delete operations
 * - Status badges with color coding (healthy/unhealthy/unknown)
 * - Type badges for node classification (xray/database/service)
 * - Health metrics display (CPU, Memory, Disk usage)
 * - Internationalization support
 * 
 * Validates: Requirements 7.3, 7.7, 7.10, 8.1, 8.2, 8.5, 8.6
 * 
 * @module components/admin/xray/nodes-table
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type DataTableColumn } from '@/components/admin/common/data-table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';
import { useTranslations } from '@/lib/i18n/context';
import type { Node } from '@/types/server';
import { PageHeader } from '@/components/admin/page-header';

export interface NodesTableProps {
  /** Initial nodes data from server */
  initialData: Node[];
}

/**
 * NodesTable Component
 * 
 * Displays server nodes with search, sort, and actions.
 * Integrates with DataTable for consistent UI and responsive behavior.
 * Uses i18n for bilingual support (English/Russian).
 */
export function NodesTable({ initialData }: NodesTableProps) {
  const [nodes, setNodes] = useState<Node[]>(initialData);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslations();

  /**
   * Handle viewing node details
   */
  const handleView = (node: Node) => {
    router.push(`/admin/xray/nodes/${node.id}`);
  };

  /**
   * Handle editing node configuration
   */
  const handleEdit = (node: Node) => {
    router.push(`/admin/xray/nodes/${node.id}/edit`);
  };

  /**
   * Handle deleting a node
   * Shows confirmation toast before deletion
   */
  const handleDelete = async (node: Node) => {
    if (isDeleting) return;

    const confirmed = confirm(
      `Are you sure you want to delete node "${node.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      // Note: API endpoint for node deletion would need to be implemented
      // For now, we'll just show a toast that it's not implemented
      toast.error('Not implemented: Node deletion is not yet available.');
      
      // When API is ready, uncomment:
      // await nodesApi.delete(node.id);
      // setNodes(prev => prev.filter(n => n.id !== node.id));
      // toast({
      //   title: 'Node deleted',
      //   description: `Node "${node.name}" has been deleted successfully.`,
      // });
    } catch (error) {
      console.error('[NodesTable] Delete failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete node');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Render status badge with appropriate variant and translated text
   */
  const renderStatus = (status: 'healthy' | 'unhealthy' | 'unknown') => {
    const statusConfig = {
      healthy: { variant: 'default' as const, color: 'text-green-600 dark:text-green-400' },
      unhealthy: { variant: 'destructive' as const, color: 'text-red-600 dark:text-red-400' },
      unknown: { variant: 'secondary' as const, color: 'text-gray-600 dark:text-gray-400' },
    };

    const config = statusConfig[status];

    return (
      <Badge variant={config.variant}>
        {t(`xray.nodes.status.${status}`)}
      </Badge>
    );
  };

  /**
   * Render type badge with translated text
   */
  const renderType = (type: 'xray' | 'database' | 'service') => {
    return (
      <Badge variant="outline" className="font-mono">
        {t(`xray.nodes.type.${type}`)}
      </Badge>
    );
  };

  /**
   * Render health metrics (CPU, Memory, Disk usage)
   */
  const renderHealthMetrics = (value: any, node: Node) => {
    const { cpu_usage, memory_usage, disk_usage } = node.health_metrics;
    
    // If no metrics available
    if (cpu_usage === undefined && memory_usage === undefined && disk_usage === undefined) {
      return <span className="text-muted-foreground text-sm">â€”</span>;
    }

    // Format metrics display
    const metrics = [];
    if (cpu_usage !== undefined) metrics.push(`CPU: ${cpu_usage}%`);
    if (memory_usage !== undefined) metrics.push(`Mem: ${memory_usage}%`);
    if (disk_usage !== undefined) metrics.push(`Disk: ${disk_usage}%`);

    return (
      <span className="text-sm text-muted-foreground">
        {metrics.join(' â€¢ ')}
      </span>
    );
  };

  /**
   * Table column configuration
   */
  const columns: DataTableColumn<Node>[] = [
    {
      key: 'name',
      label: t('xray.nodes.table.name'),
      sortable: true,
      render: (value) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'type',
      label: t('xray.nodes.table.type'),
      sortable: true,
      render: (value) => renderType(value),
    },
    {
      key: 'status',
      label: t('xray.nodes.table.status'),
      sortable: true,
      render: (value) => renderStatus(value),
    },
    {
      key: 'health_metrics',
      label: 'Health',
      sortable: false,
      hiddenOnMobile: true,
      render: renderHealthMetrics,
    },
    {
      key: 'server_id',
      label: t('xray.nodes.table.server'),
      sortable: false,
      hiddenOnMobile: true,
      className: 'font-mono text-xs',
      render: (value) => (
        <span className="text-muted-foreground truncate max-w-[120px]">
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        heading={t('xray.nodes.title')}
        description={t('xray.nodes.description')}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={nodes}
        searchable={true}
        searchPlaceholder={`${t('common.search')}...`}
        searchKeys={['name', 'type', 'status', 'server_id']}
        sortable={true}
        actions={{
          view: handleView,
          edit: handleEdit,
          delete: handleDelete,
        }}
        emptyMessage={t('xray.nodes.empty.title')}
        emptyDescription={t('xray.nodes.empty.description')}
        getRowKey={(item) => item.id}
      />
    </div>
  );
}
