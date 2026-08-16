/**
 * Sessions API Endpoint Module
 * Provides methods for session management operations
 * 
 * This module implements session-related API calls including listing active
 * sessions, revoking individual sessions, and revoking all sessions for a user.
 * 
 * Validates: Requirements 2.1, 2.4, 2.5, 11.8
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';
import type { SessionsListResponse } from '@/types/session';

/**
 * Session management API endpoints
 * 
 * @example
 * import { sessionsApi } from '@/lib/api/endpoints/sessions';
 * 
 * // List all active sessions
 * const response = await sessionsApi.list();
 * console.log(`Found ${response.data.sessions.length} active sessions`);
 * 
 * // Revoke a single session
 * await sessionsApi.revoke('session-id-123');
 * 
 * // Revoke all sessions for a user
 * await sessionsApi.revokeAll('user-id-456');
 */
export const sessionsApi = {
  /**
   * List all active user sessions
   * 
   * @returns Promise resolving to sessions list with user info, IP, and timestamps
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await sessionsApi.list();
   *   const sessions = response.data.sessions;
   *   console.log(`Found ${sessions.length} active sessions`);
   *   sessions.forEach(session => {
   *     console.log(`${session.email} from ${session.ip_address}`);
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch sessions:', error.message);
   *   }
   * }
   */
  list: (): Promise<ApiResponse<SessionsListResponse>> =>
    apiClient.get<ApiResponse<SessionsListResponse>>('/api/auth/sessions'),

  /**
   * Revoke a single session by ID
   * 
   * @param id Session UUID to revoke
   * @returns Promise resolving to success message
   * @throws ApiError when revocation fails or session not found
   * 
   * @example
   * try {
   *   await sessionsApi.revoke('123e4567-e89b-12d3-a456-426614174000');
   *   console.log('Session revoked successfully');
   * } catch (error) {
   *   if (error instanceof ApiError && error.status === 404) {
   *     console.error('Session not found');
   *   }
   * }
   */
  revoke: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/auth/sessions/${id}`),

  /**
   * Revoke all sessions for a specific user
   * 
   * @param userId User UUID whose sessions should be revoked
   * @returns Promise resolving to success message with count of revoked sessions
   * @throws ApiError when revocation fails or user not found
   * 
   * @example
   * try {
   *   await sessionsApi.revokeAll('123e4567-e89b-12d3-a456-426614174000');
   *   console.log('All user sessions revoked');
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to revoke sessions:', error.message);
   *   }
   * }
   */
  revokeAll: (userId: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post<ApiResponse<{ message: string }>>('/api/auth/logout-all', { user_id: userId }),
};
