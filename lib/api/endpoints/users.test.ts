/**
 * Unit tests for Users API Endpoint Module
 * Tests the usersApi.list and usersApi.create methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usersApi } from './users';
import { apiClient } from '../client';
import type { User, CreateUserInput, UsersListResponse } from '@/types/user';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('usersApi', () => {
  // Helper to create mock user
  const createMockUser = (overrides?: Partial<User>): User => ({
    id: '1',
    email: 'user@example.com',
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    avatar: '',
    status: 'active',
    role: 'user',
    last_login_at: null,
    last_login_ip: '',
    failed_login_count: 0,
    locked_until: null,
    password_changed_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('list', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      const mockUsers: User[] = [
        createMockUser({ id: '1', email: 'user1@example.com', first_name: 'User', last_name: 'One' }),
        createMockUser({ id: '2', email: 'user2@example.com', first_name: 'User', last_name: 'Two', role: 'admin' }),
      ];

      const mockResponse = {
        success: true,
        data: {
          users: mockUsers,
          total: 2,
          offset: 0,
          limit: 10,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await usersApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/admin/users?offset=0&limit=20');
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.data.users).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [],
          total: 0,
          offset: 0,
          limit: 10,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await usersApi.list();

      expect(result.data.users).toEqual([]);
      expect(result.data.users).toHaveLength(0);
    });

    it('should propagate errors from apiClient', async () => {
      const mockError = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(mockError);

      await expect(usersApi.list()).rejects.toThrow('Network error');
    });
  });

  describe('create', () => {
    it('should call apiClient.post with correct endpoint and data', async () => {
      const inputData: CreateUserInput = {
        email: 'newuser@example.com',
        password: 'securePassword123',
        first_name: 'New',
        last_name: 'User',
        role: 'user',
      };

      const mockCreatedUser = createMockUser({
        id: '3',
        email: inputData.email,
        first_name: inputData.first_name,
        last_name: inputData.last_name,
        role: inputData.role,
      });

      const mockResponse = {
        success: true,
        data: mockCreatedUser,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await usersApi.create(inputData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/admin/users', inputData);
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.data.email).toBe(inputData.email);
      expect(result.data.first_name).toBe(inputData.first_name);
    });

    it('should handle admin role creation', async () => {
      const adminData: CreateUserInput = {
        email: 'admin@example.com',
        password: 'adminPassword123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      };

      const mockAdminUser = createMockUser({
        id: '4',
        email: adminData.email,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        role: 'admin',
      });

      const mockResponse = {
        success: true,
        data: mockAdminUser,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await usersApi.create(adminData);

      expect(result.data.role).toBe('admin');
    });

    it('should propagate validation errors from apiClient', async () => {
      const invalidData: CreateUserInput = {
        email: 'invalid-email',
        password: '123',
        first_name: 'U',
        last_name: 'S',
        role: 'user',
      };

      const mockError = new Error('Validation failed');
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(usersApi.create(invalidData)).rejects.toThrow('Validation failed');
    });

    it('should propagate duplicate email errors', async () => {
      const duplicateData: CreateUserInput = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Duplicate',
        last_name: 'User',
        role: 'user',
      };

      const mockError = new Error('Email already exists');
      vi.mocked(apiClient.post).mockRejectedValue(mockError);

      await expect(usersApi.create(duplicateData)).rejects.toThrow('Email already exists');
    });
  });
});
