'use client';

/**
 * Delete Plan Dialog Component
 * 
 * Provides a confirmation dialog for plan deletion with subscription safety checks.
 * 
 * ## Features
 * 
 * - Displays plan name in confirmation message
 * - Shows number of active subscriptions
 * - Strong warning if plan has active subscriptions
 * - Requires typing plan name for confirmation if active_subscriptions > 0
 * - Clear confirmation flow with Cancel and Delete buttons
 * - Loading state during deletion
 * - Success feedback with list refresh
 * - Error handling with user-friendly messages
 * 
 * Validates: Requirements 8.7-8.8, 16.1-16.2, 16.5
 * 
 * @module components/admin/plans/delete-plan-dialog
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';
import { plansApi } from '@/lib/api/endpoints/plans';
import type { Plan } from '@/types/plan';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface DeletePlanDialogProps {
  /**
   * The plan to delete
   */
  plan: Plan;
  
  /**
   * Callback after successful deletion
   */
  onSuccess?: () => void;
}

/**
 * Delete Plan Dialog Component
 * 
 * Displays a confirmation dialog before deleting a plan.
 * If plan has active subscriptions, requires typing the plan name to confirm.
 * 
 * @example
 * ```tsx
 * <DeletePlanDialog 
 *   plan={plan}
 *   onSuccess={() => router.refresh()}
 * />
 * ```
 */
export function DeletePlanDialog({ 
  plan,
  onSuccess 
}: DeletePlanDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmationText, setConfirmationText] = useState('');
  
  // Check if plan has active subscriptions
  const hasActiveSubscriptions = plan.active_subscriptions > 0;
  
  // For plans with active subscriptions, require typing the plan name
  const isConfirmationValid = hasActiveSubscriptions 
    ? confirmationText === plan.name 
    : true;

  /**
   * Handle plan deletion
   * Validates: Requirements 8.7-8.8, 13.11, 16.8-16.9
   */
  const handleDelete = async () => {
    // Don't proceed if confirmation is not valid
    if (!isConfirmationValid) {
      return;
    }

    startTransition(async () => {
      try {
        // Requirement 8.8: Send DELETE request to remove the plan
        await plansApi.delete(plan.id);
        
        // Requirement 13.11: Show success toast notification
        toast.success(`Plan "${plan.name}" deleted successfully`);
        
        // Requirement 16.9: Close dialog after successful action
        setIsOpen(false);
        
        // Reset confirmation text
        setConfirmationText('');
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Refresh the page to update the list
        router.refresh();
      } catch (error) {
        // Requirement 16.10: Keep dialog open and display error
        // Handle specific error case where backend prevents deletion due to subscriptions
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete plan';
        toast.error(errorMessage);
      }
    });
  };

  /**
   * Reset state when dialog opens/closes
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset confirmation text when closing
      setConfirmationText('');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete plan</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Requirement 16.1: Display confirmation dialog with resource identifier */}
          <AlertDialogTitle>Delete Plan</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Display plan name in confirmation message */}
              <p>
                Are you sure you want to delete the plan{' '}
                <span className="font-semibold text-foreground">
                  {plan.name}
                </span>?
              </p>
              
              {/* Requirement 16.5: Show strong warning if plan has active subscriptions */}
              {hasActiveSubscriptions && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="space-y-1">
                    <p className="font-semibold">
                      This plan has {plan.active_subscriptions} active{' '}
                      {plan.active_subscriptions === 1 ? 'subscription' : 'subscriptions'}.
                    </p>
                    <p>
                      Users will lose access to their subscriptions if you delete this plan.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Show standard message if no active subscriptions */}
              {!hasActiveSubscriptions && (
                <p className="text-sm text-muted-foreground">
                  This plan has no active subscriptions.
                </p>
              )}
              
              <p className="text-sm">
                This action cannot be undone. This will permanently delete the plan
                and all its configuration from the system.
              </p>
              
              {/* Requirement 16.5: Require typing plan name for confirmation if active_subscriptions > 0 */}
              {hasActiveSubscriptions && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="confirmation" className="text-sm font-medium">
                    Type <span className="font-semibold">{plan.name}</span> to confirm:
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Enter plan name"
                    disabled={isPending}
                    className="font-mono"
                  />
                </div>
              )}
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
            disabled={isPending || !isConfirmationValid}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Plan'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
