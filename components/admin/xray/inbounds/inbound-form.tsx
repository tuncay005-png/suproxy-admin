'use client';

/**
 * Inbound Form Component
 * 
 * Reusable form component for creating and editing Xray inbound configurations.
 * This component uses sub-components for protocol selection and settings fields,
 * providing a modular and maintainable form structure.
 * 
 * ## Features
 * 
 * - Modular design with protocol selector and settings fields sub-components
 * - Protocol selection dropdown (vless, vmess, trojan, shadowsocks)
 * - Port number validation (1-65535)
 * - Tag validation (alphanumeric with hyphens/underscores)
 * - Instance selection from available Xray instances
 * - Protocol-specific dynamic settings configuration
 * - Form validation with inline error messages
 * - Loading states during submission
 * - Success/error feedback with toast notifications
 * 
 * Validates: Requirements 5.3, 5.4, 5.9, 5.10, 9.2, 13.1-13.3
 * 
 * @module components/admin/xray/inbounds/inbound-form
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
import { InboundProtocolSelector } from './inbound-protocol-selector';
import { InboundSettingsFields } from './inbound-settings-fields';

/**
 * Props for InboundForm component
 */
interface InboundFormProps {
  /** Initial values for the form (used for editing) */
  initialValues?: Partial<CreateInboundFormData>;
  /** Callback when form is successfully submitted */
  onSuccess?: () => void;
  /** Mode: 'create' or 'edit' */
  mode?: 'create' | 'edit';
  /** Inbound ID (required for edit mode) */
  inboundId?: string;
}

/**
 * InboundForm Component
 * 
 * Renders a form with fields for creating or editing an Xray inbound configuration.
 * Uses sub-components for protocol selection and settings fields.
 * Handles form validation, submission, loading states, error display, and success feedback.
 * 
 * @example
 * ```tsx
 * // Create mode
 * <InboundForm mode="create" />
 * 
 * // Edit mode
 * <InboundForm 
 *   mode="edit" 
 *   initialValues={existingInbound}
 *   onSuccess={() => router.push('/admin/xray/inbounds')}
 * />
 * ```
 */
export function InboundForm({ 
  initialValues, 
  onSuccess,
  mode = 'create',
  inboundId 
}: InboundFormProps) {
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
      instance_id: initialValues?.instance_id || '',
      protocol: initialValues?.protocol || 'vless',
      port: initialValues?.port || 443,
      tag: initialValues?.tag || '',
      settings: initialValues?.settings || {},
    },
  });

  // Watch protocol value to update settings fields dynamically
  const selectedProtocol = form.watch('protocol');

  // Fetch available Xray instances for the dropdown
  // Validates: Requirement 9.2 (fetch instances from xrayApi.instances.list)
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
   * Validates: Requirements 5.3, 5.4, 5.6, 9.2, 9.3
   */
  const onSubmit = async (data: CreateInboundFormData) => {
    try {
      setIsSubmitting(true);

      // Ensure settings is defined (default to empty object if undefined)
      const inboundData = {
        ...data,
        settings: data.settings ?? {},
      };

      // Requirement 5.6, 9.3: Call xrayApi.inbounds.update on submit in edit mode
      if (mode === 'edit' && inboundId) {
        await xrayApi.inbounds.update(inboundId, inboundData);
        // Requirement 5.6, 13.11, 9.3: Display success toast notification
        toast.success('Inbound updated successfully');
      } else {
        // Requirement 5.4, 9.2: Call xrayApi.inbounds.create on submit in create mode
        await xrayApi.inbounds.create(inboundData);
        // Requirement 5.4, 13.11, 9.2: Display success toast notification
        toast.success('Inbound created successfully');
      }

      // Requirement 5.6, 9.2, 9.3: Redirect to inbounds list or call onSuccess callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/xray/inbounds');
        router.refresh(); // Refresh to update inbound list
      }
    } catch (err) {
      // Requirement 13.3, 9.2, 9.3: Display validation errors inline
      const errorMessage = err instanceof Error ? err.message : mode === 'edit' ? 'Failed to update inbound' : 'Failed to create inbound';
      toast.error(errorMessage);

      // Keep form open for user to correct errors
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Requirement 9.2: Display validation errors inline */}
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
            {/* Requirement 5.9, 9.2: Instance selector dropdown (fetch from xrayApi.instances.list) */}
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

            {/* Requirement 5.3, 5.10, 9.2: Protocol selection using InboundProtocolSelector */}
            <FormField
              control={form.control}
              name="protocol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protocol</FormLabel>
                  <FormControl>
                    <InboundProtocolSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
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

            {/* Requirement 5.10, 9.2: Protocol-specific dynamic fields using InboundSettingsFields */}
            <InboundSettingsFields
              protocol={selectedProtocol}
              form={form}
              disabled={isSubmitting}
            />

            {/* Requirement 13.9, 13.10, 14.3: Display loading state during submission */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
              <LoadingButton 
                type="submit" 
                isLoading={isSubmitting}
                loadingText={mode === 'edit' ? 'Updating...' : 'Creating...'}
                disabled={isLoadingInstances || instances.length === 0} 
                className="w-full sm:w-auto"
              >
                {mode === 'edit' ? 'Update Inbound' : 'Create Inbound'}
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
