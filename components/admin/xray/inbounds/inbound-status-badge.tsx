/**
 * Inbound Status Badge Component
 * 
 * Displays visual status indicators for Xray inbounds (enabled/disabled).
 * 
 * ## Features
 * 
 * - Color-coded status badges
 * - Enabled: green
 * - Disabled: gray
 * 
 * Validates: Requirements 5.2, 9.1
 * 
 * @module components/admin/xray/inbounds/inbound-status-badge
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export interface InboundStatusBadgeProps {
  /**
   * Inbound enabled status
   */
  enabled: boolean;
}

/**
 * Status badge with color coding based on enabled/disabled state
 * 
 * @example
 * ```tsx
 * <InboundStatusBadge enabled={true} />
 * <InboundStatusBadge enabled={false} />
 * ```
 */
export function InboundStatusBadge({ enabled }: InboundStatusBadgeProps) {
  if (enabled) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap">
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
