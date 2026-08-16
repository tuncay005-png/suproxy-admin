/**
 * Client Status Badge Component
 * 
 * Displays visual status indicators for Xray clients (enabled/disabled).
 * 
 * ## Features
 * 
 * - Color-coded status badges
 * - Enabled: green
 * - Disabled: gray/secondary
 * 
 * Validates: Requirements 6.2, 10.1
 * 
 * @module components/admin/xray/clients/client-status-badge
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export interface ClientStatusBadgeProps {
  /**
   * Whether the client is enabled
   */
  enabled: boolean;
}

/**
 * Status badge with color coding based on client enabled state
 * 
 * @example
 * ```tsx
 * <ClientStatusBadge enabled={true} />
 * <ClientStatusBadge enabled={false} />
 * ```
 */
export function ClientStatusBadge({ enabled }: ClientStatusBadgeProps) {
  if (enabled) {
    return (
      <Badge
        variant="default"
        className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap"
      >
        Enabled
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="whitespace-nowrap">
      Disabled
    </Badge>
  );
}
