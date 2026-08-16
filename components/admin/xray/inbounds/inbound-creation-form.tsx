'use client';

/**
 * Inbound Creation Form Component
 * 
 * Client-side form component for creating new Xray inbound configurations.
 * Implements form validation with React Hook Form and Zod schema,
 * handles inbound creation flow, and manages loading/error/success states.
 * 
 * ## Features
 * 
 * - Protocol selection dropdown (vless, vmess, trojan, shadowsocks)
 * - Port number validation (1-65535)
 * - Tag validation (alphanumeric with hyphens/underscores)
 * - Instance selection from available Xray instances
 * - Protocol-specific settings configuration
 * - Form validation with inline error messages
 * - Loading states during submission
 * - Success/error feedback with toast notifications
 * 
 * Validates: Requirements 5.3, 5.4, 5.9, 5.10, 9.2, 13.1-13.3
 * 
 * @module components/admin/xray/inbounds/inbound-creation-form
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { createInboundSchema, type CreateInboundFormData } from '@/lib/validations/xray';
import type { XrayInstance } from '@/types/xray';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * InboundCreationForm Component
 * 
 * Renders a form with fields for creating a new Xray inbound configuration.
 * Handles form validation, submission, loading states, error display, and success feedback.
 * 
 * @example
 * ```tsx
 * <InboundCreationForm />
 * ```
 */
export function InboundCreationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instances, setInstances] = useState<XrayInstance[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(true);
  const [instancesError, setInstancesError] = useState<string | null>(null);

  // Initialize form with React Hook Form and Zod validation
  // Validates: Requirement 5.9 (validation using schema), 13.1 (Zod validation)
  const form = useForm<CreateInboundFormData>({
    resolver: zodResolver(createInboundSchema),
    defaultValues: {
      instance_id: '',
      protocol: 'vless',
      port: 443,
      tag: '',
      settings: {},
    },
  });

  // Fetch available Xray instances for the dropdown
  useEffect(() => {
    async function fetchInstances() {
      try {
        setIsLoadingInstances(true);
        const response = await xrayApi.instances.list();
        setInstances(response.data.instances);
        setInstancesError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load instances';
        setInstancesError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingInstances(false);
      }
    }

    fetchInstances();
  }, []);

  /**
   * Handle form submission
   * Validates: Requirements 5.3, 5.4, 9.2
   */
  const onSubmit = async (data: CreateInboundFormData) => {
    try {
      setIsSubmitting(true);

      // Requirement 5.4: Send data to POST /api/v1/admin/xray/inbounds
      // Ensure settings is defined (default to empty object if undefined)
      const inboundData = {
        ...data,
        settings: data.settings ?? {},
      };
      await xrayApi.inbounds.create(inboundData);

      // Requirement 5.4, 13.11: Display success toast notification
      toast.success('Inbound created successfully');

      // Requirement 9.2: Redirect to inbounds list after successful creation
      router.push('/admin/xray/inbounds');
      router.refresh(); // Refresh to update inbound list
    } catch (err) {
      // Requirement 13.3: Display error messages on failure
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inbound';
      toast.error(errorMessage);

      // Keep form open for user to correct errors
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Show error alert if instances failed to load */}
        {instancesError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {instancesError}. Please refresh the page or contact support.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            {/* Requirement 5.9, 9.2: Instance selection dropdown */}
            <FormField
              control={form.control}
              name="instance_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xray Instance</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || isLoadingInstances}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingInstances 
                            ? 'Loading instances...' 
                            : instances.length === 0
                            ? 'No instances available'
                            : 'Select an instance'
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instances.map((instance) => (
                        <SelectItem key={instance.id} value={instance.id}>
                          {instance.name} ({instance.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The Xray instance where this inbound will be configured
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirement 5.3, 5.10, 9.2: Protocol selection dropdown */}
            <FormField
              control={form.control}
              name="protocol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protocol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a protocol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vless">VLESS</SelectItem>
                      <SelectItem value="vmess">VMess</SelectItem>
                      <SelectItem value="trojan">Trojan</SelectItem>
                      <SelectItem value="shadowsocks">Shadowsocks</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The proxy protocol to use for this inbound
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirement 5.3, 5.9, 9.2: Port input field */}
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="443"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormDescription>
                    Port number (1-65535) where the inbound will listen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirement 5.3, 5.9, 9.2: Tag input field */}
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="main-inbound"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique identifier (alphanumeric, hyphens, underscores only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirement 13.9, 13.10, 14.3: Display loading state during submission */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
              <LoadingButton 
                type="submit" 
                isLoading={isSubmitting}
                loadingText="Creating..."
                disabled={isLoadingInstances || instances.length === 0} 
                className="w-full sm:w-auto"
              >
                Create Inbound
              </LoadingButton>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push('/admin/xray/inbounds')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
