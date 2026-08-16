/**
 * Plan Status Badge Component
 * 
 * Displays visual status indicators for subscription plans.
 * 
 * ## Features
 * 
 * - Color-coded status badges
 * - Active: green
 * - Inactive: gray
 * 
 * Validates: Requirements 8.2, 12.1
 * 
 * @module components/admin/plans/plan-status-badge
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export interface PlanStatusBadgeProps {
  /**
   * Plan active status
   */
  active: boolean;
}

/**
 * Status badge with color coding based on plan active state
 * 
 * @example
 * ```tsx
 * <PlanStatusBadge active={true} />
 * <PlanStatusBadge active={false} />
 * ```
 */
export function PlanStatusBadge({ active }: PlanStatusBadgeProps) {
  if (active) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="whitespace-nowrap">
      Inactive
    </Badge>
  );
}
