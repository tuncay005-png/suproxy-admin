/**
 * InboundsTable Component
 * 
 * Client-side component for displaying and managing Xray inbound configurations
 * in a responsive data table with search, sorting, and CRUD actions.
 * 
 * ## Features
 * 
 * - Displays inbound configurations with name, protocol, port, and status
 * - Search functionality across all fields
 * - View, edit, and delete actions
 * - Responsive mobile/desktop layouts
 * - Bilingual support (English/Russian)
 * - Real-time status indicators (enabled/disabled)
 * 
 * ## Usage
 * 
 * ```tsx
 * <InboundsTable initialData={inbounds} />
 * ```
 * 
 * Validates: Requirements 7.1, 7.5, 7.10
 * 
 * @module components/admin/xray/inbounds-table
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, DataTableColumn } from '@/components/admin/common/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/context';
import { xrayApi } from '@/lib/api/endpoints/xray';
import type { XrayInbound } from '@/types/xray';
import { useToast } from '@/lib/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Props for InboundsTable component
 */
interface InboundsTableProps {
  /** Initial inbound data fetched from server */
  initialData: XrayInbound[];
}

/**
 * InboundsTable Component
 * 
 * Displays Xray inbound configurations in a responsive data table.
 * Handles client-side interactions including search, sorting, and CRUD operations.
 * 
 * @param initialData - Initial inbound configurations from server
 */
export function InboundsTable({ initialData }: InboundsTableProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [inbounds, setInbounds] = useState<XrayInbound[]>(initialData);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inboundToDelete, setInboundToDelete] = useState<XrayInbound | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle view inbound action
   * Navigates to the inbound detail page
   */
  const handleView = (inbound: XrayInbound) => {
    router.push(`/admin/xray/inbounds/${inbound.id}`);
  };

  /**
   * Handle edit inbound action
   * Navigates to the inbound edit page
   */
  const handleEdit = (inbound: XrayInbound) => {
    router.push(`/admin/xray/inbounds/${inbound.id}/edit`);
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = (inbound: XrayInbound) => {
    setInboundToDelete(inbound);
    setDeleteDialogOpen(true);
  };

  /**
   * Handle delete inbound action
   * Calls the API to delete the inbound and updates the local state
   */
  const handleDeleteConfirm = async () => {
    if (!inboundToDelete) return;

    setIsDeleting(true);
    try {
      await xrayApi.inbounds.delete(inboundToDelete.id);
      
      // Update local state to remove the deleted inbound
      setInbounds(prev => prev.filter(i => i.id !== inboundToDelete.id));
      
      toast.success(`${inboundToDelete.tag} ${t('xray.inbounds.delete_success_title')}`);
    } catch (error) {
      console.error('Failed to delete inbound:', error);
      toast.error(t('xray.inbounds.delete_failed_title'));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setInboundToDelete(null);
    }
  };

  /**
   * Handle add new inbound action
   * Navigates to the inbound creation page
   */
  const handleAddInbound = () => {
    router.push('/admin/xray/inbounds/new');
  };

  /**
   * Render status badge with appropriate color
   */
  const renderStatus = (enabled: boolean) => {
    return (
      <Badge variant={enabled ? 'default' : 'secondary'}>
        {enabled ? t('xray.inbounds.status.enabled') : t('xray.inbounds.status.disabled')}
      </Badge>
    );
  };

  /**
   * Define table columns with translations
   */
  const columns: DataTableColumn<XrayInbound>[] = [
    {
      key: 'tag',
      label: t('xray.inbounds.table.name'),
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'protocol',
      label: t('xray.inbounds.table.protocol'),
      sortable: true,
      render: (value) => (
        <span className="uppercase text-muted-foreground">{value}</span>
      ),
    },
    {
      key: 'port',
      label: t('xray.inbounds.table.port'),
      sortable: true,
      render: (value) => <code className="text-sm">{value}</code>,
    },
    {
      key: 'enabled',
      label: t('xray.inbounds.table.status'),
      sortable: true,
      render: (value) => renderStatus(value as boolean),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>{t('xray.inbounds.title')}</CardTitle>
            <CardDescription>{t('xray.inbounds.description')}</CardDescription>
          </div>
          <Button onClick={handleAddInbound} size="sm" className="ml-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t('xray.inbounds.add_inbound')}
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={inbounds}
            searchable={true}
            searchPlaceholder={t('xray.inbounds.search_placeholder')}
            sortable={true}
            actions={{
              view: handleView,
              edit: handleEdit,
              delete: handleDeleteClick,
            }}
            emptyMessage={t('xray.inbounds.empty.title')}
            emptyDescription={t('xray.inbounds.empty.description')}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('xray.inbounds.actions.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {inboundToDelete && 
                t('xray.inbounds.delete_confirm').replace('{name}', inboundToDelete.tag)
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('common.loading') : t('xray.inbounds.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
