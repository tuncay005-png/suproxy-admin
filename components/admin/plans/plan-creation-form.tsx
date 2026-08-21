'use client';

/**
 * Plan Creation Form Component
 * 
 * Client-side form component for creating new subscription plans.
 * Implements form validation with React Hook Form and Zod schema,
 * handles plan creation flow, and manages loading/error/success states.
 * 
 * Validates: Requirements 8.3-8.4, 8.9, 13.1-13.3, 13.9-13.11
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { plansApi } from '@/lib/api/endpoints/plans';
import { createPlanSchema, type CreatePlanFormData } from '@/lib/validations/plan';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * PlanCreationForm Component
 * 
 * Renders a form with fields for creating a new subscription plan.
 * Handles form validation, submission, loading states, error display, and success feedback.
 * 
 * Fields:
 * - name: Plan name (required, string)
 * - description: Plan description (required, textarea)
 * - price: Price amount (required, number)
 * - currency: Currency code (required, 3-char uppercase string)
 * - duration_days: Duration in days (required, positive integer)
 * - data_limit_gb: Data limit in GB (required, non-negative number)
 * - active: Active status (required, boolean checkbox)
 * 
 * @example
 * ```tsx
 * <PlanCreationForm />
 * ```
 */
export function PlanCreationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with React Hook Form and Zod validation
  // Validates: Requirement 8.9 (validation using schema), 13.1 (Zod schemas), 13.2 (inline errors)
  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'USD',
      duration_days: 30,
      data_limit_gb: 100,
      active: true,
    },
  });

  /**
   * Handle form submission
   * Validates: Requirements 8.3, 8.4, 13.9, 13.10, 13.11
   */
  const onSubmit = async (data: CreatePlanFormData) => {
    try {
      setIsSubmitting(true);

      // Requirement 8.4: Send data to POST /api/v1/plans
      await plansApi.create(data);

      // Requirement 13.11: Display success toast notification
      toast.success('Plan created successfully');

      // Requirement 8.4: Redirect to /admin/plans after successful creation
      router.push('/admin/plans');
      router.refresh(); // Refresh to update plan list
    } catch (err) {
      // Requirement 13.3: Display error messages on failure
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create plan';
      toast.error(errorMessage);
      
      // Preserve user input for correction
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Plan Name field */}
        {/* Requirement 8.9: Validate required fields */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g., Premium, Basic, Enterprise"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A unique, descriptive name for this subscription plan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Plan Description field */}
        {/* Requirement 8.9: Validate required fields */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this plan includes..."
                  disabled={isSubmitting}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Brief description of the plan&apos;s features and benefits
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price and Currency fields (side by side) */}
        {/* Tablet optimization: 2-column layout at md: breakpoint (768px) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Price field */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Price must be non-negative
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency field */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="USD"
                    maxLength={3}
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>
                  3-letter code (e.g., USD, EUR, GBP)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duration and Data Limit fields (side by side) */}
        {/* Tablet optimization: 2-column layout at md: breakpoint (768px) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Duration field */}
          <FormField
            control={form.control}
            name="duration_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="30"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Subscription duration in days
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data Limit field */}
          <FormField
            control={form.control}
            name="data_limit_gb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Limit (GB)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="100"
                    disabled={isSubmitting}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Data allowance in GB
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active status checkbox */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Active Plan
                </FormLabel>
                <FormDescription>
                  Make this plan available for new subscriptions
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Submit and Cancel buttons */}
        {/* Requirement 13.9: Display loading spinners during async operations */}
        {/* Requirement 13.10: Disable submit buttons during form submission */}
        {/* Requirement 14.3: Loading indicator on buttons during async operations */}
        {/* Requirement 16.4: Add loading indicators to buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
          <LoadingButton 
            type="submit" 
            isLoading={isSubmitting}
            loadingText="Creating..."
            className="w-full sm:w-auto"
          >
            Create Plan
          </LoadingButton>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push('/admin/plans')}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
