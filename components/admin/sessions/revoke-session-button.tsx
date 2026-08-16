/**
 * Revoke Session Button Component
 * 
 * Provides a button to revoke a specific user session with confirmation dialog.
 * 
 * ## Features
 * 
 * - Confirmation dialog before revoking
 * - Warning when attempting to revoke own session
 * - Loading state during revocation
 * - Success/error feedback via toast
 * - Automatic page refresh after successful revocation
 * 
 * Validates: Requirements 2.3, 2.4, 2.8, 16.1-16.3
 * 
 * @module components/admin/sessions/revoke-session-button
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { Loader2, X } from 'lucide-react';
import { sessionsApi } from '@/lib/api/endpoints/sessions';
import { useToast } from '@/lib/hooks/use-toast';

export interface RevokeSessionButtonProps {
  /**
   * Session ID to revoke
   */
  sessionId: string;
  /**
   * Username for display in confirmation message
   */
  username: string;
  /**
   * Whether this is the current user's session
   */
  isCurrentSession?: boolean;
}

/**
 * Revoke session button with confirmation
 * 
 * Shows a confirmation dialog before revoking the session.
 * If attempting to revoke own session, shows a warning message.
 * 
 * @example
 * ```tsx
 * <RevokeSessionButton 
 *   sessionId="session-123" 
 *   username="john.doe"
 *   isCurrentSession={false}
 * />
 * ```
 */
export function RevokeSessionButton({ 
  sessionId, 
  username,
  isCurrentSession = false 
}: RevokeSessionButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);
    
    try {
      await sessionsApi.revoke(sessionId);
      
      toast.success(`Session for ${username} has been terminated.`);
      
      // Close dialog
      setIsOpen(false);
      
      // Refresh the page to update the sessions list
      router.refresh();
    } catch (error: any) {
      console.error('Failed to revoke session:', error);
      
      toast.error(error?.message || 'An error occurred while revoking the session.');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4 mr-1" />
          Revoke
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isCurrentSession ? 'Revoke Your Session?' : 'Revoke Session?'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {isCurrentSession ? (
                <>
                  <div className="font-semibold text-orange-600 dark:text-orange-400">
                    ⚠️ Warning: This is your current session!
                  </div>
                  <div>
                    Revoking your own session will log you out immediately. You will need to log in again to continue.
                  </div>
                </>
              ) : (
                <div>
                  This will immediately terminate the session for <span className="font-semibold">{username}</span>. 
                  The user will be logged out and will need to log in again.
                </div>
              )}
              <div className="text-sm">
                This action cannot be undone.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRevoking}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRevoke();
            }}
            disabled={isRevoking}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Revoke Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
