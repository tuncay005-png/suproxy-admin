/**
 * Toast Notification Hook
 * 
 * This hook provides a convenient interface for showing toast notifications
 * throughout the application using sonner.
 * 
 * ## Features
 * 
 * - Success notifications with auto-dismiss
 * - Error notifications with auto-dismiss
 * - Info notifications
 * - Warning notifications
 * - Custom duration support
 * 
 * ## Usage
 * 
 * ```typescript
 * import { useToast } from '@/lib/hooks/use-toast';
 * 
 * function MyComponent() {
 *   const { toast } = useToast();
 *   
 *   const handleSuccess = () => {
 *     toast.success('User created successfully');
 *   };
 *   
 *   const handleError = () => {
 *     toast.error('Failed to create user');
 *   };
 * }
 * ```
 * 
 * @module lib/hooks/use-toast
 * @see {@link Requirements} 11.3, 11.4
 */

'use client';

import { toast as sonnerToast } from 'sonner';

/**
 * Toast notification hook
 * 
 * Provides methods for displaying different types of toast notifications.
 * All toasts auto-dismiss after a default duration (configurable).
 * 
 * @returns Object with toast notification methods
 */
export function useToast() {
  return {
    toast: {
      /**
       * Display a success toast notification
       * @param message - The message to display
       * @param duration - Optional duration in milliseconds (default: 4000)
       */
      success: (message: string, duration?: number) => {
        sonnerToast.success(message, {
          duration: duration || 4000,
        });
      },

      /**
       * Display an error toast notification
       * @param message - The error message to display
       * @param duration - Optional duration in milliseconds (default: 5000)
       */
      error: (message: string, duration?: number) => {
        sonnerToast.error(message, {
          duration: duration || 5000,
        });
      },

      /**
       * Display an info toast notification
       * @param message - The message to display
       * @param duration - Optional duration in milliseconds (default: 4000)
       */
      info: (message: string, duration?: number) => {
        sonnerToast.info(message, {
          duration: duration || 4000,
        });
      },

      /**
       * Display a warning toast notification
       * @param message - The warning message to display
       * @param duration - Optional duration in milliseconds (default: 4000)
       */
      warning: (message: string, duration?: number) => {
        sonnerToast.warning(message, {
          duration: duration || 4000,
        });
      },

      /**
       * Display a default toast notification
       * @param message - The message to display
       * @param duration - Optional duration in milliseconds (default: 4000)
       */
      message: (message: string, duration?: number) => {
        sonnerToast(message, {
          duration: duration || 4000,
        });
      },
    },
  };
}

/**
 * Direct export of toast functions for non-hook usage
 * Use this when you need to show toasts outside of React components
 * 
 * @example
 * ```typescript
 * import { toast } from '@/lib/hooks/use-toast';
 * 
 * toast.success('Operation completed');
 * ```
 */
export const toast = {
  success: (message: string, duration?: number) => {
    sonnerToast.success(message, {
      duration: duration || 4000,
    });
  },
  error: (message: string, duration?: number) => {
    sonnerToast.error(message, {
      duration: duration || 5000,
    });
  },
  info: (message: string, duration?: number) => {
    sonnerToast.info(message, {
      duration: duration || 4000,
    });
  },
  warning: (message: string, duration?: number) => {
    sonnerToast.warning(message, {
      duration: duration || 4000,
    });
  },
  message: (message: string, duration?: number) => {
    sonnerToast(message, {
      duration: duration || 4000,
    });
  },
};
