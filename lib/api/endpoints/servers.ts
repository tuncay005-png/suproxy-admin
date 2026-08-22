/**
 * Server Management API Endpoint Module
 * Provides methods for server and infrastructure operations
 * 
 * This module implements server-related API calls for viewing
 * server information and status.
 * 
 * Validates: Requirements 7.1-7.10, 11.4
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';
import type { Server, ServersListResponse } from '@/types/server';

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Server management API endpoints
 * 
 * @example
 * import { serversApi } from '@/lib/api/endpoints/servers';
 * 
 * // List servers with pagination
 * const response = await serversApi.list({ page: 1, limit: 20 });
 * console.log(`Found ${response.data.servers.length} servers out of ${response.data.total}`);
 * 
 * // Get server details
 * const server = await serversApi.getById('server-id-123');
 * console.log(`Server ${server.data.name} is ${server.data.status}`);
 */
export const serversApi = {
  /**
   * List servers with pagination
   * 
   * @param params Pagination parameters (page, limit)
   * @returns Promise resolving to list of servers with location and status
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await serversApi.list({ page: 1, limit: 20 });
   *   const servers = response.data.servers;
   *   console.log(`Found ${servers.length} servers out of ${response.data.total} total`);
   *   servers.forEach(server => {
   *     console.log(`${server.name} (${server.country}): ${server.status}`);
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch servers:', error);
   * }
   */
  list: (params?: PaginationParams): Promise<ApiResponse<ServersListResponse>> => {
    const page = params?.page ?? 1;
    const limit = Math.min(params?.limit ?? 20, 100); // Max 100
    const offset = (page - 1) * limit;
    
    return apiClient.get<ApiResponse<ServersListResponse>>(
      `/api/servers?offset=${offset}&limit=${limit}`
    );
  },

  /**
   * Get server details by ID
   * 
   * @param id Server UUID
   * @returns Promise resolving to the server object
   * @throws ApiError when server not found or request fails
   */
  getById: (id: string): Promise<ApiResponse<Server>> =>
    apiClient.get<ApiResponse<Server>>(`/api/servers/${id}`),
};
