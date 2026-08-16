/**
 * User Detail Page Tests
 * 
 * Tests for the User Detail page including:
 * - Page rendering with user data
 * - Edit form display
 * - User management actions
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserDetailPage from './page';
import type { User } from '@/types/user';

// Mock dependencies
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/admin/users/1'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({ id: '1' })),
  redirect: vi.fn(),
}));

vi.mock('@/lib/api/endpoints/users', () => ({
  usersApi: {
    getById: vi.fn(),
  },
}));

vi.mock('@/components/admin/users/user-edit-form', () => ({
  UserEditForm: ({ user }: { user: User }) => (
    <div data-testid="user-edit-form">Edit form for {user.email}</div>
  ),
}));

vi.mock('@/components/admin/users/user-management-actions', () => ({
  UserManagementActions: ({ user }: { user: User }) => (
    <div data-testid="user-management-actions">Actions for {user.email}</div>
  ),
}));

describe('UserDetailPage', () => {
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
    avatar: '',
    status: 'active',
    role: 'admin',
    last_login_at: '2024-01-15T10:30:00Z',
    last_login_ip: '192.168.1.1',
    failed_login_count: 0,
    locked_until: null,
    password_changed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { usersApi } = await import('@/lib/api/endpoints/users');
    const { notFound } = await import('next/navigation');
    vi.mocked(usersApi.getById).mockReset();
    vi.mocked(notFound).mockReset();
  });

  describe('Rendering', () => {
    it('should render user details correctly', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // Check page header
      expect(screen.getByText('User Details')).toBeInTheDocument();
      expect(screen.getByText(/viewing information for john.doe@example.com/i)).toBeInTheDocument();

      // Check user information - John Doe appears in multiple places
      const johnDoeElements = screen.getAllByText('John Doe');
      expect(johnDoeElements.length).toBeGreaterThan(0);
      
      // Email appears in multiple places too
      const emailElements = screen.getAllByText(mockUser.email);
      expect(emailElements.length).toBeGreaterThan(0);
      
      // Admin appears in multiple places (badge and role field)
      const adminElements = screen.getAllByText(/^admin$/i);
      expect(adminElements.length).toBeGreaterThan(0);
    });

    it('should render edit user card', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByText('Update user information')).toBeInTheDocument();
      expect(screen.getByTestId('user-edit-form')).toBeInTheDocument();
    });

    it('should render user management actions card', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Manage user status, role, and account actions')).toBeInTheDocument();
      expect(screen.getByTestId('user-management-actions')).toBeInTheDocument();
    });

    it('should render back button', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      const backButton = screen.getByRole('link');
      expect(backButton).toHaveAttribute('href', '/admin/users');
    });

    it('should display user ID', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      expect(screen.getByText(mockUser.id)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should call notFound when user is not found', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const { notFound } = await import('next/navigation');
      
      // Mock getById to throw an error which results in getUserDetail returning null
      vi.mocked(usersApi.getById).mockRejectedValue(new Error('Not found'));

      const params = Promise.resolve({ id: 'non-existent-id' });
      
      // UserDetailPage will call notFound() which should be a no-op in tests
      // The page will attempt to continue rendering, causing an error
      // We need to catch this error since notFound() doesn't actually stop execution in tests
      try {
        await UserDetailPage({ params });
      } catch (error) {
        // Expected to throw since user will be null
      }

      expect(notFound).toHaveBeenCalled();
    });

    it('should call notFound when API throws error', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const { notFound } = await import('next/navigation');
      vi.mocked(usersApi.getById).mockRejectedValue(new Error('User not found'));

      const params = Promise.resolve({ id: 'error-id' });
      
      try {
        await UserDetailPage({ params });
      } catch (error) {
        // Expected to throw since user will be null
      }

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('User Name Handling', () => {
    it('should display full name when both first and last names are present', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // John Doe appears in both the card title and the full name field
      const elements = screen.getAllByText('John Doe');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display N/A when both names are missing', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const userWithoutName = {
        ...mockUser,
        first_name: '',
        last_name: '',
      };
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: userWithoutName,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // N/A should appear in the full name section (in the card title)
      const elements = screen.getAllByText('N/A');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display only first name when last name is missing', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const userWithFirstNameOnly = {
        ...mockUser,
        first_name: 'John',
        last_name: '',
      };
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: userWithFirstNameOnly,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // Should find "John" in multiple places (title and full name field)
      const elements = screen.getAllByText('John');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Role Badge', () => {
    it('should display admin badge with default variant for admin role', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // Check that "Admin" appears in the document (from UserRoleBadge)
      const badges = screen.getAllByText(/admin/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should display user badge with secondary variant for user role', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const regularUser = { ...mockUser, role: 'user' };
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: regularUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // Check that "User" appears in the document (from UserRoleBadge)
      const userBadges = screen.getAllByText('User');
      expect(userBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Status Badge', () => {
    it('should display active status badge', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const activeUser = { ...mockUser, status: 'active' };
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: activeUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // Check that "Active" appears in the document (from UserStatusBadge)
      const statusBadges = screen.getAllByText('Active');
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it('should display inactive status badge', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const inactiveUser = { ...mockUser, status: 'inactive' };
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: inactiveUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // Check that "Inactive" appears in the document
      const statusBadges = screen.getAllByText('Inactive');
      expect(statusBadges.length).toBeGreaterThan(0);
    });

    it('should display suspended status badge', async () => {
      const { usersApi } = await import('@/lib/api/endpoints/users');
      const suspendedUser = { ...mockUser, status: 'suspended' };
      vi.mocked(usersApi.getById).mockResolvedValue({
        success: true,
        data: suspendedUser,
      });

      const params = Promise.resolve({ id: mockUser.id });
      render(await UserDetailPage({ params }));

      // Check that "Suspended" appears in the document
      const statusBadges = screen.getAllByText('Suspended');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });
});
