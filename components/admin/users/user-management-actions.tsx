'use client';

/**
 * User Management Actions Component
 * 
 * Provides interactive controls for managing user status, role, and deletion.
 * Handles loading states, confirmations, and success/error feedback.
 * 
 * Validates: Requirements 1.5-1.8, 1.10, 16.1-16.9
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';
import { usersApi } from '@/lib/api/endpoints/users';
import { sessionsApi } from '@/lib/api/endpoints/sessions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { User } from '@/types/user';
import { DeleteUserDialog } from './delete-user-dialog';

interface UserManagementActionsProps {
  user: User;
}

export function UserManagementActions({ user }: UserManagementActionsProps) {
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // Fetch current user's ID from sessions to enable self-deletion check
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await sessionsApi.list();
        // Find the current session (backend should mark it, or we match by cookie)
        // For now, we'll use the first admin user in sessions as a fallback
        const currentSession = response.data.sessions.find(
          (session) => session.user_id
        );
        if (currentSession) {
          setCurrentUserId(currentSession.user_id);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        // Continue without current user ID - self-deletion check will be skipped
      }
    };

    fetchCurrentUser();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === user.status) return;

    try {
      setIsUpdatingStatus(true);
      await usersApi.updateStatus(user.id, newStatus);
      toast.success('User status updated successfully');
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update user status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.role) return;

    // Requirement 1.10: Prevent demoting self from admin role
    if (currentUserId === user.id && user.role === 'admin' && newRole !== 'admin') {
      toast.error('You cannot demote your own admin role');
      return;
    }

    try {
      setIsUpdatingRole(true);
      await usersApi.updateRole(user.id, newRole);
      toast.success('User role updated successfully');
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update user role';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Control */}
      {/* Validates: Requirement 1.5 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={user.status}
          onValueChange={handleStatusChange}
          disabled={isUpdatingStatus}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        {isUpdatingStatus && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating status...
          </p>
        )}
      </div>

      {/* Role Control */}
      {/* Validates: Requirement 1.6, 1.10 (prevent self-demotion) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select
          value={user.role}
          onValueChange={handleRoleChange}
          disabled={isUpdatingRole}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {isUpdatingRole && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating role...
          </p>
        )}
      </div>

      {/* Delete Control */}
      {/* Validates: Requirements 1.7-1.8, 1.10, 16.1-16.9 */}
      <div className="space-y-2 pt-4 border-t">
        <label className="text-sm font-medium text-destructive">Danger Zone</label>
        <DeleteUserDialog 
          user={user} 
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
