/**
 * Users List Page Tests
 * 
 * Tests for the users list page server component.
 * 
 * Validates: Requirements 4.1, 4.5, 4.7, 4.8, 11.1, 11.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from '@/lib/api/endpoints/users';
import type { User } from '@/types/user';

// Mock the API
vi.mock('@/lib/api/endpoints/users', () => ({
  usersApi: {
    list: vi.fn(),
  },
}));

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('UsersPage', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'user1@example.com',
      first_name: 'User',
      last_name: 'One',
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
      email: 'user2@example.com',
      first_name: 'User',
      last_name: 'Two',
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch users from API', async () => {
    // Arrange
    vi.mocked(usersApi.list).mockResolvedValue({
      success: true,
      data: {
        users: mockUsers,
        total: mockUsers.length,
        offset: 0,
        limit: 10,
      },
    });

    // Act
    const { default: UsersPage } = await import('./page');
    const result = await UsersPage({ searchParams: Promise.resolve({}) });

    // Assert
    expect(usersApi.list).toHaveBeenCalledOnce();
    expect(result).toBeTruthy();
  });

  it('should handle empty user list', async () => {
    // Arrange
    vi.mocked(usersApi.list).mockResolvedValue({
      success: true,
      data: {
        users: [],
        total: 0,
        offset: 0,
        limit: 10,
      },
    });

    // Act
    const { default: UsersPage } = await import('./page');
    const result = await UsersPage({ searchParams: Promise.resolve({}) });

    // Assert
    expect(usersApi.list).toHaveBeenCalledOnce();
    expect(result).toBeTruthy();
  });

  it('should handle API errors gracefully', async () => {
    // Arrange
    const error = new Error('API Error');
    vi.mocked(usersApi.list).mockRejectedValue(error);

    // Act
    const { default: UsersPage } = await import('./page');
    const result = await UsersPage({ searchParams: Promise.resolve({}) });

    // Assert - page renders with error state instead of throwing
    expect(usersApi.list).toHaveBeenCalledOnce();
    expect(result).toBeTruthy();
  });
});