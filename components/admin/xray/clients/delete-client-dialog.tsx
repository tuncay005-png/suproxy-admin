'use client';

/**
 * Delete Client Dialog Component
 * 
 * Provides a confirmation dialog for Xray client deletion.
 * 
 * ## Features
 * 
 * - Displays client email in confirmation message
 * - Clear confirmation flow with Cancel and Delete buttons
 * - Loading state during deletion
 * - Success feedback with list refresh
 * - Error handling with user-friendly messages
 * 
 * Validates: Requirements 6.8, 16.1-16.2
 * 
 * @module components/admin/xray/clients/delete-client-dialog
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
import { Trash2, Loader2 } from 'lucide-react';

export interface DeleteClientDialogProps {
  /**
   * The client to delete
   */
  client: XrayClient;
  
  /**
   * Callback after successful deletion
   */
  onSuccess?: () => void;
}

/**
 * Delete Client Dialog Component
 * 
 * Displays a confirmation dialog before deleting a client.
 * 
 * @example
 * ```tsx
 * <DeleteClientDialog 
 *   client={client}
 *   onSuccess={() => router.refresh()}
 * />
 * ```
 */
export function DeleteClientDialog({ 
  client,
  onSuccess 
}: DeleteClientDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  /**
   * Handle client deletion
   * Validates: Requirements 6.8, 13.11, 16.8-16.9
   */
  const handleDelete = async () => {
    startTransition(async () => {
      try {
        // Requirement 6.8: Send DELETE request to remove the client
        await xrayApi.clients.delete(client.id);
        
        // Requirement 13.11: Show success toast notification
        toast.success(`Client ${client.email} deleted successfully`);
        
        // Requirement 16.9: Close dialog after successful action
        setIsOpen(false);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Refresh the page to update the list
        router.refresh();
      } catch (error) {
        // Requirement 16.10: Keep dialog open and display error
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete client';
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete client</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Requirement 16.1: Display confirmation dialog with resource identifier */}
          <AlertDialogTitle>Delete Client</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Display client email in confirmation message */}
              <p>
                Are you sure you want to delete the client{' '}
                <span className="font-semibold text-foreground">
                  {client.email}
                </span>?
              </p>
              
              <p>
                This action cannot be undone. This will permanently delete the client
                configuration and revoke access for this user. The client will no longer
                be able to connect using their existing configuration.
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
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Client'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
