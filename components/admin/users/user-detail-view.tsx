'use client';

/**
 * User Detail View Component (Stub)
 * Minimal stub for test compatibility
 */

import { useState } from 'react';
import { usersApi } from '@/lib/api/endpoints/users';
import { toast } from '@/lib/hooks/use-toast';
import type { User } from '@/types/user';

interface UserDetailViewProps {
  user: User;
}

export function UserDetailView({ user }: UserDetailViewProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await usersApi.updateStatus(user.id, newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setIsUpdating(true);
    try {
      await usersApi.updateRole(user.id, newRole);
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">User Information</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd>{user.first_name} {user.last_name}</dd>
          </div>
        </dl>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          Status
        </label>
        <select
          id="status"
          value={user.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isUpdating}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-2">
          Role
        </label>
        <select
          id="role"
          value={user.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isUpdating}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );
}
