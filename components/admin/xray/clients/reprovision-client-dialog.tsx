'use client';

/**
 * Reprovision Client Dialog Component
 * 
 * Provides a confirmation dialog for client reprovisioning.
 * 
 * ## Features
 * 
 * - Displays client email in confirmation message
 * - Explains what reprovisioning does
 * - Clear confirmation flow with Cancel and Reprovision buttons
 * - Loading state during operation
 * - Success feedback with data refresh
 * - Error handling with user-friendly messages
 * 
 * Validates: Requirements 6.7, 16.1-16.2
 * 
 * @module components/admin/xray/clients/reprovision-client-dialog
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';
import { xrayApi } from '@/lib/api/endpoints/xray';
import type { XrayClient } from '@/types/xray';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Settings, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface ReprovisionClientDialogProps {
  /**
   * The client to reprovision
   */
  client: XrayClient;
  
  /**
   * Callback after successful reprovisioning
   */
  onSuccess?: () => void;
}

/**
 * Reprovision Client Dialog Component
 * 
 * Displays a confirmation dialog before reprovisioning a client.
 * Explains the impact and provides clear confirmation flow.
 * 
 * @example
 * ```tsx
 * <ReprovisionClientDialog 
 *   client={client}
 *   onSuccess={() => router.refresh()}
 * />
 * ```
 */
export function ReprovisionClientDialog({ 
  client,
  onSuccess 
}: ReprovisionClientDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  /**
   * Handle client reprovisioning
   * Validates: Requirements 6.7, 13.11, 16.8-16.9
   */
  const handleReprovision = async () => {
    startTransition(async () => {
      try {
        // Requirement 6.7: Send POST request to reprovision the client
        await xrayApi.clients.reprovision(client.id);
        
        // Requirement 13.11: Show success toast notification
        toast.success(`Client ${client.email} reprovisioned successfully`);
        
        // Requirement 16.9: Close dialog after successful action
        setIsOpen(false);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Refresh the page to update client data
        router.refresh();
      } catch (error) {
        // Requirement 16.10: Keep dialog open and display error
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to reprovision client';
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="h-8"
        >
          <Settings className="mr-2 h-4 w-4" />
          Reprovision
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Requirement 16.1: Display confirmation dialog with resource identifier */}
          <AlertDialogTitle>Reprovision Client</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Display client email in confirmation message */}
              <p>
                Are you sure you want to reprovision the client{' '}
                <span className="font-semibold text-foreground">{client.email}</span>?
              </p>
              
              {/* Requirement 16.2: Show information about the operation */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Reprovisioning will regenerate the client configuration and apply
                  any updated settings from the associated inbound.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground">
                This operation will:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Regenerate connection configuration</li>
                <li>Apply current inbound settings to the client</li>
                <li>Generate new connection URLs and QR codes</li>
                <li>Preserve the existing UUID (connections remain valid)</li>
              </ul>
              
              <p className="text-sm text-muted-foreground">
                Use this when inbound settings have changed and need to be applied
                to existing clients.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Requirement 16.6: Provide Cancel and Confirm buttons with distinct colors */}
          {/* Requirement 16.7: Focus Cancel button by default */}
          <AlertDialogCancel disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          
          {/* Requirement 16.8: Disable confirm button and show loading indicator */}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleReprovision();
            }}
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reprovisioning...
              </>
            ) : (
              'Reprovision Client'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
