/**
 * Export Logs Button Component
 * 
 * Provides dropdown menu to export audit logs as CSV or JSON format.
 * 
 * ## Features
 * 
 * - Export current filtered logs as CSV format
 * - Export current filtered logs as JSON format
 * - Uses browser download API to trigger file download
 * - Shows loading state during export conversion
 * - Automatic filename with timestamp
 * 
 * Validates: Requirements 9.8
 * 
 * @module components/admin/logs/export-logs-button
 */

'use client';

import * as React from 'react';
import { Download, FileText, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuditLog } from '@/types/audit';
import { toast } from 'sonner';

export interface ExportLogsButtonProps {
  /**
   * Array of audit logs to export
   */
  logs: AuditLog[];
  /**
   * Optional filename prefix (defaults to 'audit-logs')
   */
  filenamePrefix?: string;
}

/**
 * Convert audit logs to CSV format
 */
function convertToCSV(logs: AuditLog[]): string {
  if (logs.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Timestamp',
    'Actor Email',
    'Actor ID',
    'Action',
    'Entity Type',
    'Entity ID',
    'IP Address',
    'User Agent',
    'Status',
    'Metadata',
  ];

  // Create CSV rows
  const rows = logs.map((log) => [
    log.id,
    log.created_at,
    log.actor_email,
    log.actor_id,
    log.action,
    log.entity_type,
    log.entity_id,
    log.ip_address,
    log.user_agent,
    log.status,
    JSON.stringify(log.metadata),
  ]);

  // Escape CSV fields (handle commas and quotes)
  const escapeCSVField = (field: string): string => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  // Build CSV content
  const csvLines = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((row) => row.map(String).map(escapeCSVField).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Convert audit logs to JSON format
 */
function convertToJSON(logs: AuditLog[]): string {
  return JSON.stringify(logs, null, 2);
}

/**
 * Trigger browser download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Export Logs Button Component
 * 
 * Displays a dropdown button with options to export logs as CSV or JSON.
 * The export converts the current filtered logs array and triggers a download.
 * 
 * @example
 * ```tsx
 * <ExportLogsButton logs={auditLogs} />
 * ```
 */
export function ExportLogsButton({ logs, filenamePrefix = 'audit-logs' }: ExportLogsButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<'csv' | 'json' | null>(null);

  /**
   * Handle CSV export
   */
  const handleExportCSV = React.useCallback(async () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    setIsExporting(true);
    setExportFormat('csv');

    try {
      // Convert to CSV (async to show loading state)
      await new Promise((resolve) => setTimeout(resolve, 100));
      const csvContent = convertToCSV(logs);
      
      if (!csvContent) {
        toast.error('Failed to convert logs to CSV');
        return;
      }

      // Download file
      const filename = generateFilename(filenamePrefix, 'csv');
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      
      toast.success(`Exported ${logs.length} logs as CSV`);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export logs as CSV');
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  }, [logs, filenamePrefix]);

  /**
   * Handle JSON export
   */
  const handleExportJSON = React.useCallback(async () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    setIsExporting(true);
    setExportFormat('json');

    try {
      // Convert to JSON (async to show loading state)
      await new Promise((resolve) => setTimeout(resolve, 100));
      const jsonContent = convertToJSON(logs);

      // Download file
      const filename = generateFilename(filenamePrefix, 'json');
      downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
      
      toast.success(`Exported ${logs.length} logs as JSON`);
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('Failed to export logs as JSON');
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  }, [logs, filenamePrefix]);

  const showLoading = isExporting;
  const loadingText = exportFormat === 'csv' ? 'Exporting CSV...' : 'Exporting JSON...';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || logs.length === 0}
          aria-label="Export logs"
        >
          <Download className="h-4 w-4 mr-2" />
          {showLoading ? loadingText : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON} disabled={isExporting}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
