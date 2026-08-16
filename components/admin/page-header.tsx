import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The main heading text for the page
   */
  heading: string;
  /**
   * Optional description text below the heading
   */
  description?: string;
  /**
   * Optional action elements (buttons, etc.) displayed on the right
   */
  actions?: React.ReactNode;
}

/**
 * PageHeader provides consistent page headers across the admin dashboard
 * 
 * Responsive behavior:
 * - Mobile: Stacked layout with full-width actions
 * - Desktop: Side-by-side layout with actions on the right
 * 
 * Validates: Requirements 9.1, 9.2, 3.5, 7.6
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   heading="Users"
 *   description="Manage user accounts and permissions"
 *   actions={<Button>Create User</Button>}
 * />
 * ```
 */
const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, heading, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-4 pb-4 md:pb-6 md:flex-row md:items-start md:justify-between',
          className
        )}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{heading}</h1>
          {description && (
            <p className="text-sm text-muted-foreground md:text-base">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">{actions}</div>
        )}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

export { PageHeader };
