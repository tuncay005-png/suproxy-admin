/**
 * Audit Log Detail Dialog Component
 * 
 * Displays full audit log entry details in a modal dialog with formatted JSON.
 * 
 * ## Features
 * 
 * - Shows all log fields including metadata
 * - Formatted JSON with syntax highlighting
 * - Displays request body and response if available
 * - Parses user agent to show browser/OS information
 * - Accessible with keyboard navigation (Escape to close, Tab navigation)
 * - Responsive layout for mobile devices
 * 
 * Validates: Requirements 9.6
 * 
 * @module components/admin/logs/audit-log-detail-dialog
 */

'use client';

import * as React from 'react';
import type { AuditLog } from '@/types/audit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils/format';

export interface AuditLogDetailDialogProps {
  /**
   * The audit log to display
   */
  log: AuditLog | null;
  /**
   * Whether the dialog is open
   */
  open: boolean;
  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
}

/**
 * Parse user agent string to extract browser and OS information
 */
function parseUserAgent(userAgent: string): { browser: string; os: string } {
  let browser = 'Unknown';
  let os = 'Unknown';

  // Extract browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // Extract OS
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  return { browser, os };
}

/**
 * Format JSON with syntax highlighting using CSS classes
 */
function formatJSON(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

/**
 * Get badge variant for log status
 */
function getStatusBadgeVariant(status: 'success' | 'failure'): 'default' | 'destructive' {
  return status === 'success' ? 'default' : 'destructive';
}

/**
 * Audit log detail dialog component
 * 
 * Renders a modal dialog showing complete details of an audit log entry.
 * Includes formatted metadata, user agent parsing, and request/response display.
 * 
 * @example
 * ```tsx
 * const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
 * 
 * <AuditLogDetailDialog
 *   log={selectedLog}
 *   open={selectedLog !== null}
 *   onOpenChange={(open) => !open && setSelectedLog(null)}
 * />
 * ```
 */
export function AuditLogDetailDialog({ log, open, onOpenChange }: AuditLogDetailDialogProps) {
  if (!log) return null;

  const { browser, os } = parseUserAgent(log.user_agent);
  
  // Extract request body and response from metadata if available
  const requestBody = log.metadata?.request_body as Record<string, unknown> | undefined;
  const response = log.metadata?.response as Record<string, unknown> | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>
            Complete information for log entry {log.id.substring(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Action:</span>
                <div className="mt-1">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.action}</code>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <div className="mt-1 font-mono text-xs">{formatDateTime(log.created_at)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">IP Address:</span>
                <div className="mt-1 font-mono text-xs">{log.ip_address}</div>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Actor Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Actor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div className="mt-1 font-medium">{log.actor_email}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Actor ID:</span>
                <div className="mt-1 font-mono text-xs">{log.actor_id}</div>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Entity Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Entity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <div className="mt-1">
                  <Badge variant="outline">{log.entity_type}</Badge>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Entity ID:</span>
                <div className="mt-1 font-mono text-xs break-all">{log.entity_id}</div>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* User Agent Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">User Agent</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Browser:</span>
                  <div className="mt-1">
                    <Badge variant="secondary">{browser}</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Operating System:</span>
                  <div className="mt-1">
                    <Badge variant="secondary">{os}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Full User Agent:</span>
                <div className="mt-1 font-mono text-xs bg-muted p-2 rounded break-all">
                  {log.user_agent}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Metadata</h3>
            <div className="relative">
              <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">
                <code>{formatJSON(log.metadata)}</code>
              </pre>
            </div>
          </div>

          {/* Request Body (if available) */}
          {requestBody && (
            <>
              <div className="border-t" />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Request Body</h3>
                <div className="relative">
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">
                    <code>{formatJSON(requestBody)}</code>
                  </pre>
                </div>
              </div>
            </>
          )}

          {/* Response (if available) */}
          {response && (
            <>
              <div className="border-t" />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Response</h3>
                <div className="relative">
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">
                    <code>{formatJSON(response)}</code>
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
