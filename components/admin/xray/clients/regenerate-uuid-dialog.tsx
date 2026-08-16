'use client';

/**
 * Regenerate UUID Dialog Component
 * 
 * Provides a confirmation dialog for client UUID regeneration with warnings.
 * 
 * ## Features
 * 
 * - Displays client email in confirmation message
 * - Clear warning that regenerating UUID will invalidate existing configurations
 * - Explains the impact of UUID regeneration to prevent accidental use
 * - Loading state during operation
 * - Success feedback with data refresh
 * - Error handling with user-friendly messages
 * 
 * Validates: Requirements 6.6, 16.1-16.2
 * 
 * @module components/admin/xray/clients/regenerate-uuid-dialog
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
import { RefreshCw, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export interface RegenerateUuidDialogProps {
  /**
   * The client whose UUID will be regenerated
   */
  client: XrayClient;
  
  /**
   * Callback after successful UUID regeneration
   */
  onSuccess?: () => void;
}

/**
 * Regenerate UUID Dialog Component
 * 
 * Displays a confirmation dialog before regenerating a client's UUID.
 * Shows clear warnings about the impact of this operation.
 * 
 * @example
 * ```tsx
 * <RegenerateUuidDialog 
 *   client={client}
 *   onSuccess={() => router.refresh()}
 * />
 * ```
 */
export function RegenerateUuidDialog({ 
  client,
  onSuccess 
}: RegenerateUuidDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  /**
   * Handle UUID regeneration
   * Validates: Requirements 6.6, 13.11, 16.8-16.9
   */
  const handleRegenerateUuid = async () => {
    startTransition(async () => {
      try {
        // Requirement 6.6: Send POST request to regenerate UUID
        await xrayApi.clients.regenerateUuid(client.id);
        
        // Requirement 13.11: Show success toast notification
        toast.success(`UUID regenerated for client ${client.email}`);
        
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
          error instanceof Error ? error.message : 'Failed to regenerate UUID';
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
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate UUID
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Requirement 16.1: Display confirmation dialog with resource identifier */}
          <AlertDialogTitle>Regenerate UUID</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Display client email in confirmation message */}
              <p>
                Are you sure you want to regenerate the UUID for client{' '}
                <span className="font-semibold text-foreground">{client.email}</span>?
              </p>
              
              {/* Requirement 16.2: Show warning about invalidating existing configurations */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Regenerating the UUID will immediately
                  invalidate all existing client configurations. Users will need to
                  reconfigure their clients with the new connection details.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground">
                This operation will:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Generate a new UUID for this client</li>
                <li>Break all existing client connections</li>
                <li>Require users to update their client configurations</li>
                <li>Generate new connection URLs and QR codes</li>
              </ul>
              
              <p className="text-sm text-muted-foreground">
                This cannot be undone. Use this only when necessary (e.g., security
                concerns, leaked credentials).
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
              handleRegenerateUuid();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              'Regenerate UUID'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
