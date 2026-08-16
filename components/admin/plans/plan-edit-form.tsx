'use client';

/**
 * Plan Edit Form Component
 * 
 * Client-side form component for editing existing subscription plans.
 * Implements form validation with React Hook Form and Zod schema,
 * handles plan update flow, and manages loading/error/success states.
 * 
 * Validates: Requirements 8.5-8.6, 13.1-13.3, 13.9-13.11
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { plansApi } from '@/lib/api/endpoints/plans';
import { createPlanSchema, type CreatePlanFormData } from '@/lib/validations/plan';
import type { Plan } from '@/types/plan';
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

interface PlanEditFormProps {
  plan: Plan;
  onSuccess?: () => void;
}

/**
 * PlanEditForm Component
 * 
 * Renders a form with fields for editing an existing subscription plan.
 * Pre-populates form with current plan data.
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
 * @param plan - The plan object to edit
 * @param onSuccess - Optional callback to run after successful update
 * 
 * @example
 * ```tsx
 * <PlanEditForm plan={plan} />
 * ```
 */
export function PlanEditForm({ plan, onSuccess }: PlanEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with React Hook Form and Zod validation
  // Pre-populate with current plan data
  // Validates: Requirement 8.5 (pre-populated with current data), 13.1 (Zod validation)
  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || 0,
      currency: plan.currency || 'USD',
      duration_days: plan.duration_days || 30,
      data_limit_gb: plan.data_limit_gb || 100,
      active: plan.active ?? true,
    },
  });

  /**
   * Handle form submission
   * Validates: Requirements 8.6, 13.2-13.3, 13.9-13.11
   */
  const onSubmit = async (data: CreatePlanFormData) => {
    try {
      setIsSubmitting(true);

      // Requirement 8.6: Send PUT request to update plan
      await plansApi.update(plan.id, data);

      // Requirement 13.11: Display success toast notification
      toast.success('Plan updated successfully');

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Requirement 8.6: Redirect to plans list after successful update
      router.push('/admin/plans');
      router.refresh(); // Refresh to update plan list
    } catch (err) {
      // Requirement 13.3: Display error messages on failure
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update plan';
      toast.error(errorMessage);
      
      // Preserve user input for correction
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Plan Name field */}
        {/* Requirement 13.2: Inline validation errors */}
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
        <div className="grid gap-4 sm:grid-cols-2">
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
        <div className="grid gap-4 sm:grid-cols-2">
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
            Update Plan
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
