/**
 * Users API Endpoint Module
 * Provides methods for user management operations
 * 
 * This module implements user-related API calls including listing users
 * and creating new users. It uses the centralized API client for consistent
 * error handling and request management.
 * 
 * Validates: Requirements 4.1, 5.3, 6.2, 12.3
 */

import { apiClient } from '../client';
import type { User, CreateUserInput, UpdateUserInput, UsersListResponse } from '@/types/user';

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * User management API endpoints
 * 
 * @example
 * import { usersApi } from '@/lib/api/endpoints/users';
 * 
 * // List users with pagination
 * const response = await usersApi.list({ page: 1, limit: 20 });
 * console.log(`Found ${response.data.users.length} users out of ${response.data.total}`);
 * 
 * // Create a new user
 * const newUser = await usersApi.create({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   name: 'John Doe',
 *   role: 'user'
 * });
 */
export const usersApi = {
  /**
   * Fetch list of users with pagination
   * 
   * @param params Pagination parameters (page, limit)
   * @returns Promise resolving to the wrapped response with users array
   * @throws ApiError when the request fails
   * 
   * Backend returns: {success: true, data: {users: [...], total, offset, limit}}
   * 
   * @example
   * try {
   *   // Default: page=1, limit=20
   *   const response = await usersApi.list({ page: 1, limit: 20 });
   *   const users = response.data.users;
   *   console.log(`Found ${users.length} users out of ${response.data.total} total`);
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch users:', error.message);
   *   }
   * }
   */
  list: (params?: PaginationParams): Promise<{ success: boolean; data: UsersListResponse }> => {
    const page = params?.page ?? 1;
    const limit = Math.min(params?.limit ?? 20, 100); // Max 100
    const offset = (page - 1) * limit;
    
    return apiClient.get<{ success: boolean; data: UsersListResponse }>(
      `/api/admin/users?offset=${offset}&limit=${limit}`
    );
  },

  /**
   * Create a new user
   * 
   * @param data User creation data (email, password, name, role)
   * @returns Promise resolving to the created User object wrapped in response
   * @throws ApiError when the request fails
   * 
   * @example
   * const newUser = await usersApi.create({
   *   email: 'user@example.com',
   *   password: 'securePassword123',
   *   name: 'John Doe',
   *   role: 'user'
   * });
   */
  create: (data: CreateUserInput): Promise<{ success: boolean; data: User }> =>
    apiClient.post<{ success: boolean; data: User }>('/api/admin/users', data),

  /**
   * Get user details by ID
   * 
   * @param id User UUID
   * @returns Promise resolving to the user object
   * @throws ApiError when user not found or request fails
   */
  getById: (id: string): Promise<{ success: boolean; data: User }> =>
    apiClient.get<{ success: boolean; data: User }>(`/api/admin/users/${id}`),

  /**
   * Update user information
   * 
   * @param id User UUID
   * @param data Updated user data
   * @returns Promise resolving to the updated user object
   * @throws ApiError when user not found or request fails
   */
  update: (id: string, data: UpdateUserInput): Promise<{ success: boolean; data: User }> =>
    apiClient.put<{ success: boolean; data: User }>(`/api/admin/users/${id}`, data),

  /**
   * Update user status (active, suspended, banned)
   * 
   * @param id User UUID
   * @param status New status value
   * @returns Promise resolving to the updated user object
   * @throws ApiError when user not found or request fails
   */
  updateStatus: (id: string, status: string): Promise<{ success: boolean; data: User }> =>
    apiClient.put<{ success: boolean; data: User }>(`/api/admin/users/${id}/status`, { status }),

  /**
   * Update user role (user, admin)
   * 
   * @param id User UUID
   * @param role New role value
   * @returns Promise resolving to the updated user object
   * @throws ApiError when user not found or request fails
   */
  updateRole: (id: string, role: string): Promise<{ success: boolean; data: User }> =>
    apiClient.put<{ success: boolean; data: User }>(`/api/admin/users/${id}/role`, { role }),

  /**
   * Delete a user
   * 
   * @param id User UUID to delete
   * @returns Promise resolving when deletion is complete
   * @throws ApiError when user not found or request fails
   */
  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/admin/users/${id}`),
};
