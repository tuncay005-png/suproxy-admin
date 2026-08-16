import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display (from lucide-react)
   */
  icon: LucideIcon;
  /**
   * Main heading text
   */
  title: string;
  /**
   * Descriptive text below the title
   */
  description?: string;
  /**
   * Optional action element (typically a button)
   */
  action?: React.ReactNode;
}

/**
 * EmptyState displays a consistent no-data scenario UI across the admin dashboard
 * 
 * Validates: Requirements 9.1, 9.2, 10.1, 10.2
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Users}
 *   title="No users found"
 *   description="Get started by creating your first user"
 *   action={<Button>Create User</Button>}
 * />
 * ```
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          className
        )}
        {...props}
      >
        <div className="rounded-full bg-muted p-4">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
