/**
 * QuickActions Component
 * 
 * Displays action buttons for common administrative tasks on the dashboard.
 * Provides quick access to frequently used functions like user creation.
 * 
 * ## Features
 * 
 * - Action buttons with icons
 * - Links to relevant admin pages
 * - Extensible for future administrative modules
 * - Responsive layout
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 3.3
 * - 3.3: Dashboard includes placeholder widgets for future feature expansion
 * 
 * @module components/admin/dashboard/quick-actions
 */

import * as React from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional CSS classes to apply to the container
   */
  className?: string;
}

/**
 * QuickActions provides quick access buttons for common administrative tasks
 * 
 * Validates: Requirements 3.3
 * 
 * @example
 * ```tsx
 * <QuickActions />
 * ```
 */
const QuickActions = React.forwardRef<HTMLDivElement, QuickActionsProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-2', className)}
        {...props}
      >
        {/* Create User Action */}
        <Button
          asChild
          variant="outline"
          className="w-full justify-start"
        >
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Link>
        </Button>

        {/* Future actions can be added here */}
        {/* Example:
        <Button
          asChild
          variant="outline"
          className="w-full justify-start"
        >
          <Link href="/admin/servers/new">
            <ServerIcon className="mr-2 h-4 w-4" />
            Add Server
          </Link>
        </Button>
        */}
      </div>
    );
  }
);
QuickActions.displayName = 'QuickActions';

export { QuickActions };
