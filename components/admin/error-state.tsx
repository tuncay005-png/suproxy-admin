import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Error message to display
   */
  message: string;
  /**
   * Optional detailed error description
   */
  description?: string;
  /**
   * Optional retry callback function
   */
  onRetry?: () => void;
  /**
   * Optional custom retry button text
   */
  retryText?: string;
}

/**
 * ErrorState displays consistent error UI across the admin dashboard
 * 
 * Validates: Requirements 9.1, 9.2, 10.1, 10.2
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   message="Failed to load users"
 *   description="There was a problem connecting to the server"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      message,
      description,
      onRetry,
      retryText = 'Try Again',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 text-center',
          className
        )}
        {...props}
      >
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{message}</h3>
        {description && (
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {onRetry && (
          <Button
            className="mt-6"
            onClick={onRetry}
            variant="outline"
            type="button"
          >
            {retryText}
          </Button>
        )}
      </div>
    );
  }
);
ErrorState.displayName = 'ErrorState';

export { ErrorState };
