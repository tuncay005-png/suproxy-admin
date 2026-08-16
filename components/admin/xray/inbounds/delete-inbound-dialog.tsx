'use client';

/**
 * Delete Inbound Dialog Component
 * 
 * Provides a confirmation dialog for inbound deletion with client safety checks.
 * 
 * ## Features
 * 
 * - Displays inbound tag and port in confirmation message
 * - Fetches and displays count of affected clients
 * - Shows warning if inbound has active clients
 * - Clear confirmation flow with Cancel and Delete buttons
 * - Loading state during deletion
 * - Success feedback with list refresh
 * - Error handling with user-friendly messages
 * 
 * Validates: Requirements 5.8, 16.1-16.2, 16.4
 * 
 * @module components/admin/xray/inbounds/delete-inbound-dialog
 */

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';
import { xrayApi } from '@/lib/api/endpoints/xray';
import type { XrayInbound } from '@/types/xray';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface DeleteInboundDialogProps {
  /**
   * The inbound to delete
   */
  inbound: XrayInbound;
  
  /**
   * Callback after successful deletion
   */
  onSuccess?: () => void;
}

/**
 * Delete Inbound Dialog Component
 * 
 * Displays a confirmation dialog before deleting an inbound.
 * Fetches client count and warns if clients will be affected.
 * 
 * @example
 * ```tsx
 * <DeleteInboundDialog 
 *   inbound={inbound}
 *   onSuccess={() => router.refresh()}
 * />
 * ```
 */
export function DeleteInboundDialog({ 
  inbound,
  onSuccess 
}: DeleteInboundDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [isFetchingClients, setIsFetchingClients] = useState(false);

  /**
   * Fetch client count when dialog opens
   * Validates: Requirement 16.4
   */
  useEffect(() => {
    if (isOpen && clientCount === null) {
      fetchClientCount();
    }
  }, [isOpen]);

  /**
   * Fetch the number of clients associated with this inbound
   */
  const fetchClientCount = async () => {
    setIsFetchingClients(true);
    try {
      const response = await xrayApi.clients.list();
      // Filter clients by inbound_id to get the count
      const affectedClients = response.data.clients.filter(
        (client) => client.inbound_id === inbound.id
      );
      setClientCount(affectedClients.length);
    } catch (error) {
      console.error('Failed to fetch client count:', error);
      // If we can't fetch the count, set to 0 to allow deletion
      setClientCount(0);
    } finally {
      setIsFetchingClients(false);
    }
  };

  /**
   * Handle inbound deletion
   * Validates: Requirements 5.8, 13.11, 16.8-16.9
   */
  const handleDelete = async () => {
    startTransition(async () => {
      try {
        // Requirement 5.8: Send DELETE request to remove the inbound
        await xrayApi.inbounds.delete(inbound.id);
        
        // Requirement 13.11: Show success toast notification
        toast.success(`Inbound ${inbound.tag} deleted successfully`);
        
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
          error instanceof Error ? error.message : 'Failed to delete inbound';
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
          <span className="sr-only">Delete inbound</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Requirement 16.1: Display confirmation dialog with resource identifier */}
          <AlertDialogTitle>Delete Inbound</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Display inbound tag and port in confirmation message */}
              <p>
                Are you sure you want to delete the inbound{' '}
                <span className="font-semibold text-foreground">
                  {inbound.tag}
                </span>{' '}
                (port {inbound.port})?
              </p>
              
              {/* Show loading state while fetching client count */}
              {isFetchingClients && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking for active clients...
                </div>
              )}
              
              {/* Requirement 16.4: Display number of affected clients */}
              {!isFetchingClients && clientCount !== null && clientCount > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This inbound has <strong>{clientCount}</strong> active{' '}
                    {clientCount === 1 ? 'client' : 'clients'}. Deleting this inbound
                    will affect {clientCount === 1 ? 'this client' : 'these clients'}.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Show standard message if no clients */}
              {!isFetchingClients && clientCount !== null && clientCount === 0 && (
                <p className="text-sm text-muted-foreground">
                  This inbound has no active clients.
                </p>
              )}
              
              <p>
                This action cannot be undone. This will permanently delete the inbound
                configuration from the system.
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
            disabled={isPending || isFetchingClients}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Inbound'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
