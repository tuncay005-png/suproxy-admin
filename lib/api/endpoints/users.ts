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
 * User management API endpoints
 * 
 * @example
 * import { usersApi } from '@/lib/api/endpoints/users';
 * 
 * // List all users
 * const response = await usersApi.list();
 * console.log(`Found ${response.data.users.length} users`);
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
   * Fetch list of all users
   * 
   * @returns Promise resolving to the wrapped response with users array
   * @throws ApiError when the request fails
   * 
   * Backend returns: {success: true, data: {users: [...], total, offset, limit}}
   * 
   * @example
   * try {
   *   const response = await usersApi.list();
   *   const users = response.data.users;
   *   console.log(`Found ${users.length} users`);
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch users:', error.message);
   *   }
   * }
   */
  list: (): Promise<{ success: boolean; data: UsersListResponse }> =>
    apiClient.get<{ success: boolean; data: UsersListResponse }>('/api/admin/users'),

  /**
   * Create a new user
   * 
   * @param data User creation data (email, password, name, role)
   * @returns Promise resolving to the created User object wrapped in response
   * @throws ApiError when creation fails (e.g., validation errors, duplicate email)
   * 
   * @example
   * try {
   *   const response = await usersApi.create({
   *     email: 'newuser@example.com',
   *     password: 'securePassword123',
   *     first_name: 'Jane',
   *     last_name: 'Smith',
   *     role: 'admin'
   *   });
   *   console.log('User created:', response.data.id);
   * } catch (error) {
   *   if (error instanceof ApiError && error.isValidationError) {
   *     console.error('Validation error:', error.details);
   *   }
   * }
   */
  create: (data: CreateUserInput): Promise<{ success: boolean; data: User }> =>
    apiClient.post<{ success: boolean; data: User }>('/api/admin/users', data),

  /**
   * Get user details by ID
   * 
   * @param id User UUID
   * @returns Promise resolving to the User object wrapped in response
   * @throws ApiError when user is not found or request fails
   * 
   * @example
   * try {
   *   const response = await usersApi.getById('123e4567-e89b-12d3-a456-426614174000');
   *   console.log('User:', response.data);
   * } catch (error) {
   *   if (error instanceof ApiError && error.status === 404) {
   *     console.error('User not found');
   *   }
   * }
   */
  getById: (id: string): Promise<{ success: boolean; data: User }> =>
    apiClient.get<{ success: boolean; data: User }>(`/api/admin/users/${id}`),

  /**
   * Update user details
   * 
   * @param id User UUID
   * @param data Partial user data to update (first_name, last_name, phone, email)
   * @returns Promise resolving to the updated User object wrapped in response
   * @throws ApiError when update fails (e.g., validation errors, duplicate email)
   * 
   * @example
   * try {
   *   const response = await usersApi.update('123e4567-e89b-12d3-a456-426614174000', {
   *     first_name: 'Jane',
   *     last_name: 'Doe',
   *     phone: '+1234567890'
   *   });
   *   console.log('User updated:', response.data);
   * } catch (error) {
   *   if (error instanceof ApiError && error.isValidationError) {
   *     console.error('Validation error:', error.details);
   *   }
   * }
   */
  update: (id: string, data: UpdateUserInput): Promise<{ success: boolean; data: User }> =>
    apiClient.put<{ success: boolean; data: User }>(`/api/admin/users/${id}`, data),

  /**
   * Update user status
   * 
   * @param id User UUID
   * @param status New status (active, inactive, suspended)
   * @returns Promise resolving to updated user
   * @throws ApiError when update fails
   */
  updateStatus: (id: string, status: string): Promise<{ success: boolean; data: User }> =>
    apiClient.put<{ success: boolean; data: User }>(`/api/admin/users/${id}/status`, { status }),

  /**
   * Update user role
   * 
   * @param id User UUID
   * @param role New role (user, admin)
   * @returns Promise resolving to updated user
   * @throws ApiError when update fails
   */
  updateRole: (id: string, role: string): Promise<{ success: boolean; data: User }> =>
    apiClient.put<{ success: boolean; data: User }>(`/api/admin/users/${id}/role`, { role }),

  /**
   * Delete user
   * 
   * @param id User UUID
   * @returns Promise resolving to success message
   * @throws ApiError when deletion fails
   */
  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/admin/users/${id}`),
};
