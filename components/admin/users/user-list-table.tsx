/**
 * User List Table Component
 * 
 * Displays users in a responsive table format.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays email, name, role, created date, and actions
 * - Empty state when no users exist
 * - Badge styling for user roles
 * 
 * Validates: Requirements 4.2, 4.6, 7.6, 9.2, 3.5
 * 
 * @module components/admin/users/user-list-table
 */

'use client';

import * as React from 'react';
import { User } from '@/lib/schemas/user';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface UserListTableProps {
  /**
   * Array of users to display
   */
  users: User[];
  /**
   * Optional filtered users (for search functionality)
   */
  filteredUsers?: User[];
}

/**
 * User list table component
 * 
 * Renders users in a table with columns for key user information.
 * On mobile (< 768px): Shows only email and role
 * On tablet (≥ 768px): Shows email, name, and role
 * On desktop (≥ 1024px): Shows all columns including created date
 * 
 * @example
 * ```tsx
 * <UserListTable users={usersData.users} />
 * ```
 */
export function UserListTable({ users, filteredUsers }: UserListTableProps) {
  // Use filtered users if provided, otherwise use all users
  const displayUsers = filteredUsers ?? users;

  // Show empty state if no users exist
  if (displayUsers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={Users}
            title="No users found"
            description="Get started by creating your first user account"
            action={
              <Button asChild>
                <Link href="/admin/users/new">Create User</Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          {displayUsers.length} user{displayUsers.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="hidden md:table-cell">Name</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Role</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user) => {
                const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || '—';
                return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium break-all">{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{fullName}</TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status as 'active' | 'inactive' | 'suspended'} />
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge role={user.role as 'user' | 'admin'} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/users/${user.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
