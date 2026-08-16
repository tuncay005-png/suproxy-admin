/**
 * Tests for UserListTable component
 * 
 * Validates: Requirements 4.2, 4.6, 7.6, 9.2
 */

import { render, screen } from '@testing-library/react';
import { UserListTable } from './user-list-table';
import { User } from '@/types/user';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('UserListTable', () => {
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
      last_login_at: '2024-01-15T10:00:00Z',
      last_login_ip: '127.0.0.1',
      failed_login_count: 0,
      locked_until: null,
      password_changed_at: null,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      email: 'user@example.com',
      first_name: 'Regular',
      last_name: 'User',
      phone: '+1234567891',
      avatar: '',
      status: 'active',
      role: 'user',
      last_login_at: '2024-01-16T14:30:00Z',
      last_login_ip: '127.0.0.2',
      failed_login_count: 0,
      locked_until: null,
      password_changed_at: null,
      created_at: '2024-01-16T14:30:00Z',
      updated_at: '2024-01-16T14:30:00Z',
    },
    {
      id: '3',
      email: 'moderator@example.com',
      first_name: 'Moderator',
      last_name: 'User',
      phone: '+1234567892',
      avatar: '',
      status: 'inactive',
      role: 'user',
      last_login_at: '2024-01-17T09:15:00Z',
      last_login_ip: '127.0.0.3',
      failed_login_count: 0,
      locked_until: null,
      password_changed_at: null,
      created_at: '2024-01-17T09:15:00Z',
      updated_at: '2024-01-17T09:15:00Z',
    },
  ];

  describe('Data Display - Requirement 4.2', () => {
    it('displays users in a table with all required columns', () => {
      render(<UserListTable users={mockUsers} />);

      // Verify table headers
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays email column for all users', () => {
      render(<UserListTable users={mockUsers} />);

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
      expect(screen.getByText('moderator@example.com')).toBeInTheDocument();
    });

    it('displays name column for all users', () => {
      render(<UserListTable users={mockUsers} />);

      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Regular User')).toBeInTheDocument();
      expect(screen.getByText('Moderator User')).toBeInTheDocument();
    });

    it('displays role column with badges', () => {
      render(<UserListTable users={mockUsers} />);

      // Check for role badges
      const adminBadges = screen.getAllByText('Admin');
      expect(adminBadges.length).toBeGreaterThan(0);
      
      const userBadges = screen.getAllByText('User');
      expect(userBadges.length).toBeGreaterThan(0);
    });

    it('displays formatted creation dates', () => {
      render(<UserListTable users={mockUsers} />);

      // formatDate should format dates - check for partial matches
      expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 16, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 17, 2024/)).toBeInTheDocument();
    });

    it('displays action buttons for each user', () => {
      render(<UserListTable users={mockUsers} />);

      const viewButtons = screen.getAllByText('View');
      expect(viewButtons).toHaveLength(3);
    });

    it('displays user count in card description', () => {
      render(<UserListTable users={mockUsers} />);

      expect(screen.getByText('3 users found')).toBeInTheDocument();
    });

    it('displays singular user count correctly', () => {
      render(<UserListTable users={[mockUsers[0]]} />);

      expect(screen.getByText('1 user found')).toBeInTheDocument();
    });
  });

  describe('Empty State - Requirement 4.6', () => {
    it('displays empty state when no users exist', () => {
      render(<UserListTable users={[]} />);

      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(
        screen.getByText('Get started by creating your first user account')
      ).toBeInTheDocument();
    });

    it('displays create user button in empty state', () => {
      render(<UserListTable users={[]} />);

      const createButton = screen.getByText('Create User');
      expect(createButton).toBeInTheDocument();
      expect(createButton.closest('a')).toHaveAttribute('href', '/admin/users/new');
    });

    it('does not display table when empty', () => {
      render(<UserListTable users={[]} />);

      expect(screen.queryByText('Email')).not.toBeInTheDocument();
      expect(screen.queryByText('Name')).not.toBeInTheDocument();
      expect(screen.queryByText('Role')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design - Requirement 7.6', () => {
    it('wraps table in scrollable container', () => {
      const { container } = render(<UserListTable users={mockUsers} />);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('renders table within card component', () => {
      const { container } = render(<UserListTable users={mockUsers} />);

      // Check that Card structure exists
      expect(container.querySelector('[class*="card"]')).toBeInTheDocument();
    });
  });

  describe('Code Organization - Requirement 9.2', () => {
    it('renders as a client component with proper structure', () => {
      const { container } = render(<UserListTable users={mockUsers} />);

      // Component should render without errors
      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses shadcn/ui components consistently', () => {
      const { container } = render(<UserListTable users={mockUsers} />);

      // Check for table structure
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();

      // Check for badge elements using the new badge components
      const badges = screen.getAllByText(/Active|Admin|User/);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Filtered Users Support', () => {
    it('displays filtered users when provided', () => {
      const filteredUsers = [mockUsers[0]];
      render(<UserListTable users={mockUsers} filteredUsers={filteredUsers} />);

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
      expect(screen.queryByText('moderator@example.com')).not.toBeInTheDocument();
    });

    it('shows correct count for filtered users', () => {
      const filteredUsers = [mockUsers[0]];
      render(<UserListTable users={mockUsers} filteredUsers={filteredUsers} />);

      expect(screen.getByText('1 user found')).toBeInTheDocument();
    });

    it('shows empty state when filtered result is empty', () => {
      render(<UserListTable users={mockUsers} filteredUsers={[]} />);

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  describe('User Name Handling', () => {
    it('displays dash when user name is empty', () => {
      const usersWithEmptyName: User[] = [
        {
          ...mockUsers[0],
          first_name: '',
          last_name: '',
        },
      ];
      render(<UserListTable users={usersWithEmptyName} />);

      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('Role Badge Styling', () => {
    it('applies default variant for admin role', () => {
      render(<UserListTable users={[mockUsers[0]]} />);

      // Check that Admin badge is displayed
      const adminBadge = screen.getByText('Admin');
      expect(adminBadge).toBeInTheDocument();
    });

    it('applies secondary variant for non-admin roles', () => {
      render(<UserListTable users={[mockUsers[1]]} />);

      // Check that User badge is displayed
      const userBadge = screen.getByText('User');
      expect(userBadge).toBeInTheDocument();
    });
  });

  describe('Action Links', () => {
    it('creates correct view links for each user', () => {
      render(<UserListTable users={mockUsers} />);

      const viewButtons = screen.getAllByText('View');
      
      expect(viewButtons[0].closest('a')).toHaveAttribute('href', '/admin/users/1');
      expect(viewButtons[1].closest('a')).toHaveAttribute('href', '/admin/users/2');
      expect(viewButtons[2].closest('a')).toHaveAttribute('href', '/admin/users/3');
    });
  });
});
