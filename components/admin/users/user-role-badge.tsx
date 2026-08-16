'use client';

/**
 * User Role Badge Component
 * 
 * Displays visual indicators for user roles with appropriate styling.
 * Provides clear visual differentiation between user and admin roles.
 * 
 * Validates: Requirements 1.6
 */

import { Badge } from '@/components/ui/badge';
import { Shield, User } from 'lucide-react';

type UserRole = 'user' | 'admin';

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

/**
 * UserRoleBadge Component
 * 
 * Renders a color-coded badge with an icon for user role.
 * - Admin: Primary badge with shield icon (blue/purple)
 * - User: Secondary badge with user icon (gray)
 * 
 * @param role - The user role ('user' | 'admin')
 * @param className - Optional additional CSS classes
 * 
 * @example
 * ```tsx
 * <UserRoleBadge role="admin" />
 * <UserRoleBadge role="user" className="ml-2" />
 * ```
 */
export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const roleConfig = {
    admin: {
      label: 'Admin',
      variant: 'default' as const,
      icon: Shield,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    user: {
      label: 'User',
      variant: 'secondary' as const,
      icon: User,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    },
  };

  const config = roleConfig[role] || roleConfig.user;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`inline-flex items-center gap-1.5 ${config.className} ${className || ''}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium capitalize">{config.label}</span>
    </Badge>
  );
}
