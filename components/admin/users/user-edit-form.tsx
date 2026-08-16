'use client';

/**
 * User Edit Form Component
 * 
 * Client-side form component for editing existing users.
 * Implements form validation with React Hook Form and Zod schema,
 * handles user update flow, and manages loading/error/success states.
 * 
 * Validates: Requirements 1.3, 1.4, 13.1-13.3, 13.9-13.11
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { usersApi } from '@/lib/api/endpoints/users';
import { updateUserSchema, type UpdateUserFormData } from '@/lib/schemas/user';
import type { User } from '@/types/user';
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

interface UserEditFormProps {
  user: User;
  onSuccess?: () => void;
}

/**
 * UserEditForm Component
 * 
 * Renders a form with fields for editing an existing user (email, name, phone).
 * Pre-populates form with current user data.
 * Handles form validation, submission, loading states, error display, and success feedback.
 * 
 * @param user - The user object to edit
 * @param onSuccess - Optional callback to run after successful update
 * 
 * @example
 * ```tsx
 * <UserEditForm user={user} />
 * ```
 */
export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with React Hook Form and Zod validation
  // Pre-populate with current user data
  // Validates: Requirement 1.3 (pre-populated with current data), 13.1 (Zod validation)
  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
    },
  });

  /**
   * Handle form submission
   * Validates: Requirements 1.4, 13.2-13.3, 13.9-13.11
   */
  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      setIsSubmitting(true);

      // Requirement 1.4: Send PUT request to update user
      await usersApi.update(user.id, data);

      // Show success toast and refresh data
      toast.success('User updated successfully');

      // Refresh the page data to show updated information
      router.refresh();

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Requirement 13.3: Display error messages on failure
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      // Re-enable form even if error occurs
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4 md:space-y-6">
        {/* Requirement 1.3: Email input field (pre-populated) */}
        {/* Requirement 13.2: Inline validation errors */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirement 1.3: First Name and Last Name input fields (pre-populated) */}
        {/* Tablet optimization: Display name fields side-by-side */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="John"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Doe"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Requirement 1.3: Phone input field (pre-populated, optional) */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  autoComplete="tel"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirement 13.10: Disable submit button during submission */}
        {/* Requirement 13.9: Display loading spinner during async operations */}
        {/* Requirement 14.3: Loading indicator on buttons during async operations */}
        {/* Requirement 16.4: Add loading indicators to buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
          <LoadingButton 
            type="submit" 
            isLoading={isSubmitting}
            loadingText="Updating..."
            className="w-full sm:w-auto"
          >
            Update User
          </LoadingButton>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
