/**
 * Authentication API Endpoint Module
 * Provides methods for authentication operations
 * 
 * This module implements authentication-related API calls including
 * login functionality. It uses the Next.js API routes for authentication
 * to enable server-side cookie management.
 * 
 * Validates: Requirements 1.3, 6.2
 */

import type { LoginCredentials, LoginResponse } from '@/types/auth';

/**
 * Authentication API endpoints
 * 
 * @example
 * import { authApi } from '@/lib/api/endpoints/auth';
 * 
 * const response = await authApi.login({
 *   email: 'admin@example.com',
 *   password: 'securePassword123'
 * });
 */
export const authApi = {
  /**
   * Authenticate user with email and password
   * 
   * This method calls the Next.js API route (not the backend directly)
   * to enable server-side httpOnly cookie management.
   * 
   * @param credentials User login credentials (email and password)
   * @returns Promise resolving to login response with user info
   * @throws Error when authentication fails
   * 
   * @example
   * try {
   *   const response = await authApi.login({
   *     email: 'admin@example.com',
   *     password: 'password123'
   *   });
   *   console.log('Logged in as:', response.user.name);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // Call Next.js API route instead of backend directly
    // This enables server-side httpOnly cookie management
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in request/response
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
      const errorMessage = errorData.error || 'Authentication failed';
      throw new Error(errorMessage);
    }

    const data: LoginResponse = await response.json();
    
    return data;
  },
};
