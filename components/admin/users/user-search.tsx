/**
 * User Search Component
 * 
 * Client-side search functionality for filtering users.
 * 
 * ## Features
 * 
 * - Debounced search input for performance
 * - Real-time client-side filtering
 * - Searches across email, name, and role fields
 * - Responsive input field
 * 
 * Validates: Requirements 4.3
 * 
 * @module components/admin/users/user-search
 */

'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface UserSearchProps {
  /**
   * Callback when search value changes
   */
  onSearchChange?: (value: string) => void;
  /**
   * Optional className for the container
   */
  className?: string;
}

/**
 * User search component
 * 
 * Provides a debounced search input for filtering users.
 * 
 * @example
 * ```tsx
 * <UserSearch onSearchChange={(value) => setSearchTerm(value)} />
 * ```
 */
export function UserSearch({ onSearchChange, className }: UserSearchProps) {
  const [searchValue, setSearchValue] = React.useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearchChange]);

  return (
    <div className={cn('relative max-w-sm', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search users by email, name, or role..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
