/**
 * User List Table With Search Component
 * 
 * Combines search functionality with the user list table.
 * 
 * ## Features
 * 
 * - Integrated search and table display
 * - Client-side filtering by email, name, and role
 * - Debounced search for performance
 * 
 * Validates: Requirements 4.2, 4.3, 4.6
 * 
 * @module components/admin/users/user-list-table-with-search
 */

'use client';

import * as React from 'react';
import { User } from '@/lib/schemas/user';
import { UserSearch } from './user-search';
import { UserListTable } from './user-list-table';

export interface UserListTableWithSearchProps {
  /**
   * Array of users to display
   */
  users: User[];
}

/**
 * User list table with integrated search
 * 
 * Manages search state and filters users accordingly.
 * 
 * @example
 * ```tsx
 * <UserListTableWithSearch users={usersData.users} />
 * ```
 */
export function UserListTableWithSearch({ users }: UserListTableWithSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter users based on search term
  const filteredUsers = React.useMemo(() => {
    const trimmedSearchTerm = searchTerm.trim();
    
    if (!trimmedSearchTerm) {
      return users;
    }

    const lowerSearchTerm = trimmedSearchTerm.toLowerCase();
    return users.filter((user) => {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').toLowerCase();
      return (
        user.email.toLowerCase().includes(lowerSearchTerm) ||
        fullName.includes(lowerSearchTerm) ||
        user.role.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [users, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <UserSearch onSearchChange={setSearchTerm} />

      {/* Filtered user list */}
      <UserListTable users={users} filteredUsers={filteredUsers} />
    </div>
  );
}
