'use client';

/**
 * Login Form Component
 * 
 * Client-side form component for user authentication.
 * Implements form validation with React Hook Form and Zod schema,
 * handles authentication flow, and manages loading/error states.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 8.3, 8.4, 8.5, 8.6
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api/endpoints/auth';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';

/**
 * LoginForm Component
 * 
 * Renders a form with email and password fields for user authentication.
 * Handles form validation, submission, loading states, and error display.
 * 
 * @example
 * ```tsx
 * <LoginForm />
 * ```
 */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with React Hook Form and Zod validation
  // Validates: Requirement 1.2 (validation using schema)
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle form submission
   * Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Requirement 1.3: Send credentials to POST /api/auth/login (Next.js API route)
      // The Next.js API route forwards to backend and sets httpOnly cookie
      const response = await authApi.login(data);

      // Requirement 1.4: Session token stored in httpOnly cookie by Next.js API route
      // The cookie is set server-side and is not accessible to JavaScript

      // Requirement 1.5: Redirect to /admin on success
      router.push('/admin');
      router.refresh(); // Refresh to update middleware auth check
      
      // Keep loading state true during redirect to prevent form resubmission
      // The component will unmount when navigation completes
    } catch (err) {
      // Only log errors that are NOT expected auth failures (401)
      if (err instanceof Error && !err.message.includes('Authentication failed') && !err.message.includes('Invalid credentials')) {
        console.error('[LOGIN-FORM] Unexpected error:', err);
      }
      // Requirement 1.6: Display error message on failure
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Requirement 1.6: Display error messages */}
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Requirement 1.1: Email input field */}
        {/* Requirement 8.3, 8.4: Form validation with email format check */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirement 1.1: Password input field */}
        {/* Requirement 8.5, 8.6: Form validation with password required check */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirement 1.7: Display loading state during authentication */}
        {/* Requirement 14.3: Loading indicator on buttons during async operations */}
        {/* Requirement 16.4: Add loading indicators to buttons */}
        <LoadingButton 
          type="submit" 
          className="w-full" 
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </LoadingButton>
      </form>
    </Form>
  );
}
