'use client';

/**
 * Delete User Dialog Component
 * 
 * Provides a confirmation dialog for user deletion with safety checks.
 * 
 * ## Features
 * 
 * - Displays user's email in confirmation message
 * - Prevents self-deletion (current admin cannot delete themselves)
 * - Clear confirmation flow with Cancel and Delete buttons
 * - Loading state during deletion
 * - Success feedback with redirect to users list
 * - Error handling with user-friendly messages
 * 
 * Validates: Requirements 1.7, 1.8, 1.10, 16.1-16.3, 16.6-16.9
 * 
 * @module components/admin/users/delete-user-dialog
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';
import { usersApi } from '@/lib/api/endpoints/users';
import type { User } from '@/types/user';
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

export interface DeleteUserDialogProps {
  /**
   * The user to delete
   */
  user: User;
  
  /**
   * Current logged-in user's ID (for self-deletion check)
   * Optional - if not provided, self-deletion check will be skipped
   */
  currentUserId?: string;
  
  /**
   * Callback after successful deletion
   */
  onSuccess?: () => void;
}

/**
 * Delete User Dialog Component
 * 
 * Displays a confirmation dialog before deleting a user.
 * Prevents self-deletion with error message.
 * 
 * @example
 * ```tsx
 * <DeleteUserDialog 
 *   user={user} 
 *   currentUserId={currentUser.id}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Without current user check
 * <DeleteUserDialog user={user} />
 * ```
 */
export function DeleteUserDialog({ 
  user, 
  currentUserId,
  onSuccess 
}: DeleteUserDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Requirement 1.10: Check if attempting self-deletion
  const isSelfDeletion = currentUserId && currentUserId === user.id;

  /**
   * Handle user deletion
   * Validates: Requirements 1.8, 13.11, 16.8-16.9
   */
  const handleDelete = async () => {
    // Requirement 1.10: Prevent self-deletion
    if (isSelfDeletion) {
      toast.error('You cannot delete your own account');
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        // Requirement 1.8: Send DELETE request to remove the user
        await usersApi.delete(user.id);
        
        // Requirement 13.11: Show success toast notification
        toast.success(`User ${user.email} deleted successfully`);
        
        // Requirement 16.9: Close dialog after successful action
        setIsOpen(false);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to users list
        router.push('/admin/users');
        router.refresh();
      } catch (error) {
        // Requirement 16.10: Keep dialog open and display error
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete user';
        toast.error(errorMessage);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Requirement 16.1: Display confirmation dialog with resource identifier */}
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {/* Requirement 1.7: Display user's email in confirmation message */}
              <p>
                Are you sure you want to delete the user{' '}
                <span className="font-semibold text-foreground">{user.email}</span>?
              </p>
              <p>
                This action cannot be undone. This will permanently delete the user
                account and remove all associated data from the system.
              </p>
              
              {/* Requirement 1.10: Show error if attempting self-deletion */}
              {isSelfDeletion && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You cannot delete your own account. Please ask another administrator
                    to delete your account if needed.
                  </AlertDescription>
                </Alert>
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
            disabled={isPending || !!isSelfDeletion}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
