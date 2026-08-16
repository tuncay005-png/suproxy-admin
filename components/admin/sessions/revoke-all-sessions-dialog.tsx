/**
 * Revoke All Sessions Dialog Component
 * 
 * Provides a dialog to revoke all sessions for a specific user with confirmation.
 * 
 * ## Features
 * 
 * - Displays count of sessions to be revoked
 * - Confirmation dialog before revoking all sessions
 * - Loading state during revocation
 * - Success/error feedback via toast
 * - Automatic refresh after successful revocation
 * 
 * Validates: Requirements 2.5-2.6
 * 
 * @module components/admin/sessions/revoke-all-sessions-dialog
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
import { Loader2, XCircle } from 'lucide-react';
import { sessionsApi } from '@/lib/api/endpoints/sessions';
import { useToast } from '@/lib/hooks/use-toast';

export interface RevokeAllSessionsDialogProps {
  /**
   * User ID whose sessions should be revoked
   */
  userId: string;
  /**
   * User email for display in confirmation message
   */
  userEmail: string;
  /**
   * Optional: Pre-fetched session count for this user
   * If not provided, will be fetched on dialog open
   */
  sessionCount?: number;
  /**
   * Optional: Custom trigger button
   */
  trigger?: React.ReactNode;
}

/**
 * Revoke all sessions dialog
 * 
 * Shows a confirmation dialog before revoking all sessions for a user.
 * Displays the count of sessions that will be revoked.
 * 
 * @example
 * ```tsx
 * <RevokeAllSessionsDialog 
 *   userId="user-123" 
 *   userEmail="john.doe@example.com"
 *   sessionCount={3}
 * />
 * ```
 */
export function RevokeAllSessionsDialog({ 
  userId, 
  userEmail,
  sessionCount: providedCount,
  trigger
}: RevokeAllSessionsDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [sessionCount, setSessionCount] = React.useState<number | null>(providedCount ?? null);
  const [isFetchingSessions, setIsFetchingSessions] = React.useState(false);

  // Fetch session count when dialog opens if not provided
  React.useEffect(() => {
    if (isOpen && sessionCount === null && !isFetchingSessions) {
      fetchSessionCount();
    }
  }, [isOpen]);

  const fetchSessionCount = async () => {
    setIsFetchingSessions(true);
    try {
      const response = await sessionsApi.list();
      const userSessions = response.data.sessions.filter(
        (session) => session.user_id === userId
      );
      setSessionCount(userSessions.length);
    } catch (error: any) {
      console.error('Failed to fetch session count:', error);
      // Default to unknown count
      setSessionCount(0);
    } finally {
      setIsFetchingSessions(false);
    }
  };

  const handleRevokeAll = async () => {
    setIsRevoking(true);
    
    try {
      await sessionsApi.revokeAll(userId);
      
      toast.success(`All sessions for ${userEmail} have been terminated.`);
      
      // Close dialog
      setIsOpen(false);
      
      // Refresh the page to update the sessions list
      router.refresh();
    } catch (error: any) {
      console.error('Failed to revoke all sessions:', error);
      
      toast.error(error?.message || 'An error occurred while revoking all sessions.');
    } finally {
      setIsRevoking(false);
    }
  };

  const displayCount = sessionCount ?? 0;
  const hasMultipleSessions = displayCount > 1;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button 
            variant="destructive" 
            size="sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Revoke All Sessions
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke All Sessions?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {isFetchingSessions ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking active sessions...</span>
              </div>
            ) : (
              <>
                <p>
                  This will immediately terminate <span className="font-semibold text-foreground">
                    {displayCount === 0 ? 'all' : displayCount} session{hasMultipleSessions ? 's' : ''}
                  </span> for <span className="font-semibold text-foreground">{userEmail}</span>.
                </p>
                
                {displayCount === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active sessions found for this user.
                  </p>
                ) : (
                  <p>
                    The user will be logged out from all devices and will need to log in again.
                  </p>
                )}
                
                <p className="text-sm font-medium text-destructive">
                  This action cannot be undone.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRevoking || isFetchingSessions}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRevokeAll();
            }}
            disabled={isRevoking || isFetchingSessions || displayCount === 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRevoking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Revoke All Sessions
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
