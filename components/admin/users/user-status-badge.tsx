'use client';

/**
 * User Status Badge Component
 * 
 * Displays visual indicators for user account status with color-coded badges.
 * Provides clear visual feedback for active, inactive, and suspended states.
 * 
 * Validates: Requirements 1.5
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Ban } from 'lucide-react';

type UserStatus = 'active' | 'inactive' | 'suspended';

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

/**
 * UserStatusBadge Component
 * 
 * Renders a color-coded badge with an icon for user account status.
 * - Active: Green badge with check icon
 * - Inactive: Gray badge with X icon
 * - Suspended: Red badge with ban icon
 * 
 * @param status - The user account status ('active' | 'inactive' | 'suspended')
 * @param className - Optional additional CSS classes
 * 
 * @example
 * ```tsx
 * <UserStatusBadge status="active" />
 * <UserStatusBadge status="inactive" className="ml-2" />
 * <UserStatusBadge status="suspended" />
 * ```
 */
export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Active',
      variant: 'default' as const,
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    },
    inactive: {
      label: 'Inactive',
      variant: 'secondary' as const,
      icon: XCircle,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    },
    suspended: {
      label: 'Suspended',
      variant: 'destructive' as const,
      icon: Ban,
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`inline-flex items-center gap-1.5 ${config.className} ${className || ''}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
}
