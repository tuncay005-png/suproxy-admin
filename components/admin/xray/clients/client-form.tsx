'use client';

/**
 * Client Form Component
 * 
 * Client-side form component for creating new Xray client configurations.
 * Implements form validation with React Hook Form and Zod schema,
 * handles client creation flow, and displays generated configuration.
 * 
 * ## Features
 * 
 * - Email validation for client identification
 * - Inbound selector dropdown populated from available inbounds
 * - Form validation with inline error messages
 * - Loading states during submission
 * - Success/error feedback with toast notifications
 * - Displays generated client configuration after creation
 * 
 * Validates: Requirements 6.3-6.4, 6.9, 13.1-13.3
 * 
 * @module components/admin/xray/clients/client-form
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/lib/hooks/use-toast';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { createClientSchema, type CreateClientFormData } from '@/lib/validations/xray';
import type { XrayInbound, XrayClient, XrayClientConfig } from '@/types/xray';
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
import { ClientConfigDisplay } from './client-config-display';

/**
 * Props for ClientForm component
 */
interface ClientFormProps {
  /** Callback when form is successfully submitted */
  onSuccess?: (client: XrayClient, config: XrayClientConfig) => void;
}

/**
 * ClientForm Component
 * 
 * Renders a form with fields for creating an Xray client configuration.
 * Handles form validation, submission, loading states, error display, and success feedback.
 * Displays generated client configuration after successful creation.
 * 
 * @example
 * ```tsx
 * <ClientForm />
 * ```
 */
export function ClientForm({ onSuccess }: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inbounds, setInbounds] = useState<XrayInbound[]>([]);
  const [isLoadingInbounds, setIsLoadingInbounds] = useState(true);
  const [inboundsError, setInboundsError] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<{ client: XrayClient; config: XrayClientConfig } | null>(null);

  // Initialize form with React Hook Form and Zod validation
  // Validates: Requirement 13.1 (Zod validation), 13.2 (inline errors)
  const form = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      email: '',
      inbound_id: '',
      settings: {},
    },
  });

  // Fetch available Xray inbounds for the dropdown
  // Validates: Requirement 6.3 (inbound selector dropdown)
  useEffect(() => {
    async function fetchInbounds() {
      try {
        setIsLoadingInbounds(true);
        const response = await xrayApi.inbounds.list();
        // Only show enabled inbounds
        const enabledInbounds = response.data.inbounds.filter(inbound => inbound.enabled);
        setInbounds(enabledInbounds);
        setInboundsError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load inbounds';
        setInboundsError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingInbounds(false);
      }
    }

    fetchInbounds();
  }, []);

  /**
   * Handle form submission
   * Validates: Requirements 6.3, 6.4, 6.9
   */
  const onSubmit = async (data: CreateClientFormData) => {
    try {
      setIsSubmitting(true);

      // Requirement 6.4: Call xrayApi.clients.create on submit
      const response = await xrayApi.clients.create(data);

      // Extract client and config from response
      // Backend returns: {success: true, data: {...client, config: {...}}}
      const { config, ...clientData } = response.data as XrayClient & { config: XrayClientConfig };

      // Requirement 6.9: Display generated client configuration after successful creation
      setCreatedClient({ client: clientData, config });

      // Requirement 13.11: Display success toast notification
      toast.success('Client created successfully');

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(clientData, config);
      }
    } catch (err) {
      // Requirement 13.3: Display error messages on failure
      const errorMessage = err instanceof Error ? err.message : 'Failed to create client';
      toast.error(errorMessage);

      // Keep form open for user to correct errors
      setIsSubmitting(false);
    }
  };

  // If client was created successfully, show configuration
  // Validates: Requirement 6.9
  if (createdClient) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Client Created Successfully</h3>
          <p className="text-sm text-muted-foreground">
            Client configuration has been generated. Save the connection details below.
          </p>
        </div>

        <ClientConfigDisplay
          config={createdClient.config}
          clientEmail={createdClient.client.email}
          title="Your Client Configuration"
          description="Use the connection URL or scan the QR code to configure your Xray client"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={() => {
              router.push('/admin/xray/clients');
              router.refresh();
            }}
            className="w-full sm:w-auto"
          >
            View All Clients
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCreatedClient(null);
              setIsSubmitting(false);
              form.reset();
            }}
            className="w-full sm:w-auto"
          >
            Create Another Client
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Requirement 13.2: Display validation errors inline */}
        {inboundsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {inboundsError}. Please refresh the page or contact support.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            {/* Requirement 6.3: Email field */}
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
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Client identifier (must be a valid email address)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirement 6.3: Inbound selector dropdown */}
            <FormField
              control={form.control}
              name="inbound_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inbound</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || isLoadingInbounds}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingInbounds
                              ? 'Loading inbounds...'
                              : inbounds.length === 0
                              ? 'No enabled inbounds available'
                              : 'Select an inbound'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inbounds.map((inbound) => (
                        <SelectItem key={inbound.id} value={inbound.id}>
                          {inbound.tag} ({inbound.protocol}:{inbound.port})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The inbound configuration this client will use
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit and Cancel buttons */}
            {/* Requirement 13.9, 13.10, 14.3: Display loading indicators during submission */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4">
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating..."
                disabled={isLoadingInbounds || inbounds.length === 0}
                className="w-full sm:w-auto"
              >
                Create Client
              </LoadingButton>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push('/admin/xray/clients')}
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
