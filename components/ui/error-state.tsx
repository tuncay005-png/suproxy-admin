import * as React from 'react';
import { AlertCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display (defaults to AlertCircle)
   */
  icon?: LucideIcon;
  /**
   * Error heading text
   */
  title: string;
  /**
   * Descriptive text below the title
   */
  description?: string;
  /**
   * Retry callback
   */
  onRetry?: () => void;
  /**
   * Optional custom action element
   */
  action?: React.ReactNode;
}

/**
 * ErrorState displays a consistent error scenario UI across the admin dashboard
 * Shows when backend is unavailable or API calls fail during page load
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   title="Unable to load users"
 *   description="Backend service is temporarily unavailable."
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 */
const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, icon: Icon = AlertCircle, title, description, onRetry, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          className
        )}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <div className="rounded-full bg-destructive/10 p-4">
          <Icon className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {(onRetry || action) && (
          <div className="mt-6 flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                Retry
              </Button>
            )}
            {action}
          </div>
        )}
      </div>
    );
  }
);
ErrorState.displayName = 'ErrorState';

export { ErrorState };
