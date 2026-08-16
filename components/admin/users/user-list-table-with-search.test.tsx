/**
 * User List Table With Search Integration Tests
 * 
 * Tests the integration between search and table components.
 * 
 * Validates: Requirements 4.2, 4.3, 4.6
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UserListTableWithSearch } from './user-list-table-with-search';
import type { User } from '@/types/user';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('UserListTableWithSearch', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      phone: '+1234567890',
      avatar: '',
      status: 'active',
      role: 'admin',
      last_login_at: null,
      last_login_ip: '',
      failed_login_count: 0,
      locked_until: null,
      password_changed_at: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567891',
      avatar: '',
      status: 'active',
      role: 'user',
      last_login_at: null,
      last_login_ip: '',
      failed_login_count: 0,
      locked_until: null,
      password_changed_at: null,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      phone: '+1234567892',
      avatar: '',
      status: 'inactive',
      role: 'moderator',
      last_login_at: null,
      last_login_ip: '',
      failed_login_count: 0,
      locked_until: null,
      password_changed_at: null,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
  ];

  it('renders all users initially', () => {
    render(<UserListTableWithSearch users={mockUsers} />);

    // All users should be visible
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    
    // User count should show all users
    expect(screen.getByText('3 users found')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('filters users by email', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search for 'john'
    await user.type(searchInput, 'john');

    // Wait for debounce and filtering - check user count changes
    await waitFor(() => {
      expect(screen.getByText('1 user found')).toBeInTheDocument();
    });

    // Verify john is visible
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    
    // Wait a bit more to ensure DOM updates
    await waitFor(() => {
      expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
    });
    
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
  });

  it('filters users by name', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search for 'Jane Smith'
    await user.type(searchInput, 'Jane');

    // Wait for debounce and filtering - check user count changes
    await waitFor(() => {
      expect(screen.getByText('1 user found')).toBeInTheDocument();
    });

    // Verify Jane is visible
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    
    // Wait for DOM to update and verify other users are not visible
    await waitFor(() => {
      expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters users by role', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search for 'moderator' role
    await user.type(searchInput, 'moderator');

    // Wait for debounce and filtering - check user count changes
    await waitFor(() => {
      expect(screen.getByText('1 user found')).toBeInTheDocument();
    });

    // Verify jane is visible
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    
    // Wait for DOM to update and verify other users are not visible
    await waitFor(() => {
      expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
    });
    
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });

  it('is case-insensitive', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search with uppercase
    await user.type(searchInput, 'ADMIN');

    // Wait for debounce and filtering
    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    // Should find the admin user despite case difference
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('shows empty state when no users match search', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search for non-existent user
    await user.type(searchInput, 'nonexistent');

    // Wait for debounce and filtering
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    // No user emails should be visible
    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument();
  });

  it('returns to full list when search is cleared', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search for specific user
    await user.type(searchInput, 'john');
    
    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    // Clear search
    await user.clear(searchInput);

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('3 users found')).toBeInTheDocument();
    });

    // All users should be visible again
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('handles empty user list', () => {
    render(<UserListTableWithSearch users={[]} />);

    // Should show empty state
    expect(screen.getByText('No users found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first user account')).toBeInTheDocument();
  });

  it('searches across multiple fields', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search for 'admin' which appears in both email and role
    await user.type(searchInput, 'admin');

    // Wait for debounce and filtering
    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });

    // Should find the user with 'admin' in email
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('trims whitespace from search term', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Search with leading/trailing spaces
    await user.type(searchInput, '  john  ');

    // Wait for debounce and filtering - check user count changes
    await waitFor(() => {
      expect(screen.getByText('1 user found')).toBeInTheDocument();
    });

    // Verify john is visible
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    
    // Wait for DOM to update and verify other users are not visible
    await waitFor(() => {
      expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument();
    });
  });

  it('debounces search input', async () => {
    const user = userEvent.setup();
    render(<UserListTableWithSearch users={mockUsers} />);

    const searchInput = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Type rapidly
    await user.type(searchInput, 'joh');

    // Immediately check - should still show all users (debounce hasn't fired)
    expect(screen.getByText('3 users found')).toBeInTheDocument();

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('1 user found')).toBeInTheDocument();
    });
  });
});
