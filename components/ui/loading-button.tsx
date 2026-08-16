/**
 * Loading Button Component
 * 
 * A reusable button component that displays a loading spinner during async operations.
 * Extends the standard Button component with loading state management.
 * 
 * ## Features
 * 
 * - Shows loading spinner when isLoading is true
 * - Automatically disables button during loading state
 * - Supports custom loading text
 * - Maintains all Button component variants and sizes
 * - Accessible with proper disabled state
 * 
 * Validates: Requirements 14.3, 13.9, 16.4
 * 
 * @module components/ui/loading-button
 */

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps extends ButtonProps {
  /**
   * Whether the button is in a loading state
   */
  isLoading?: boolean
  /**
   * Custom text to display when loading (optional)
   * If not provided, shows only the spinner
   */
  loadingText?: string
}

/**
 * LoadingButton Component
 * 
 * A button that displays a loading spinner and optional text during async operations.
 * Automatically disables the button when loading.
 * 
 * @example
 * ```tsx
 * // Simple loading button
 * <LoadingButton isLoading={isSubmitting}>
 *   Submit
 * </LoadingButton>
 * 
 * // With custom loading text
 * <LoadingButton isLoading={isSubmitting} loadingText="Creating...">
 *   Create User
 * </LoadingButton>
 * 
 * // With variant and size
 * <LoadingButton 
 *   isLoading={isDeleting} 
 *   loadingText="Deleting..."
 *   variant="destructive"
 *   size="sm"
 * >
 *   Delete
 * </LoadingButton>
 * ```
 */
const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, isLoading = false, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }
