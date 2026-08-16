'use client';

/**
 * User Creation Form Component
 * 
 * Client-side form component for creating new users.
 * Implements form validation with React Hook Form and Zod schema,
 * handles user creation flow, and manages loading/error/success states.
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.2, 8.3, 8.4, 8.7
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { usersApi } from '@/lib/api/endpoints/users';
import { createUserSchema, type CreateUserFormData } from '@/lib/schemas/user';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * UserCreationForm Component
 * 
 * Renders a form with fields for creating a new user (email, password, name, role).
 * Handles form validation, submission, loading states, error display, and success feedback.
 * 
 * @example
 * ```tsx
 * <UserCreationForm />
 * ```
 */
export function UserCreationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with React Hook Form and Zod validation
  // Validates: Requirement 5.2 (validation using schema), 8.2 (React Hook Form), 8.7 (validate required fields)
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'user',
    },
  });

  /**
   * Handle form submission
   * Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7
   */
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setIsSubmitting(true);

      // Requirement 5.3: Send data to POST /api/v1/users
      await usersApi.create(data);

      // Requirement 5.4: Display success toast notification
      toast.success('User created successfully');

      // Requirement 5.5: Redirect to /admin/users after successful creation
      router.push('/admin/users');
      router.refresh(); // Refresh to update user list
    } catch (err) {
      // Requirement 5.6: Display error messages on failure
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create user';
      toast.error(errorMessage);
      
      // Requirement 10.5: Preserve user input for correction
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Requirement 5.1: Email input field */}
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

        {/* Requirement 5.1: First Name and Last Name input fields */}
        {/* Requirement 8.7: Validate required fields */}
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

        {/* Phone input field (optional) */}
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

        {/* Requirement 5.1: Password input field */}
        {/* Requirement 8.7: Validate password requirements */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirement 5.1: Role select field */}
        {/* Requirement 8.7: Validate role enum */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Requirement 5.7: Display loading state during creation */}
        {/* Requirement 8.5: Disable submit button when validation fails */}
        {/* Requirement 13.9: Loading spinner during async operations */}
        {/* Requirement 14.3: Loading indicator on buttons during async operations */}
        {/* Requirement 16.4: Add loading indicators to buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
          <LoadingButton 
            type="submit" 
            isLoading={isSubmitting}
            loadingText="Creating..."
            className="w-full sm:w-auto"
          >
            Create User
          </LoadingButton>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push('/admin/users')}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
