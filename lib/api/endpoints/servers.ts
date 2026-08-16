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
 * Server management API endpoints
 * 
 * @example
 * import { serversApi } from '@/lib/api/endpoints/servers';
 * 
 * // List all servers
 * const response = await serversApi.list();
 * console.log(`Found ${response.data.servers.length} servers`);
 * 
 * // Get server details
 * const server = await serversApi.getById('server-id-123');
 * console.log(`Server ${server.data.name} is ${server.data.status}`);
 */
export const serversApi = {
  /**
   * List all servers
   * 
   * @returns Promise resolving to list of servers with location and status
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await serversApi.list();
   *   const servers = response.data.servers;
   *   console.log(`Found ${servers.length} servers`);
   *   servers.forEach(server => {
   *     console.log(`${server.name} (${server.country}) - ${server.status}`);
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch servers:', error.message);
   *   }
   * }
   */
  list: (): Promise<ApiResponse<ServersListResponse>> =>
    apiClient.get<ApiResponse<ServersListResponse>>('/api/servers'),

  /**
   * Get details for a specific server
   * 
   * @param id Server UUID
   * @returns Promise resolving to server details
   * @throws ApiError when server not found or request fails
   * 
   * @example
   * try {
   *   const response = await serversApi.getById('123e4567-e89b-12d3-a456-426614174000');
   *   console.log('Server:', response.data.name);
   *   console.log('Location:', response.data.city, response.data.country);
   *   console.log('Status:', response.data.status);
   *   console.log('Nodes:', response.data.node_count);
   * } catch (error) {
   *   if (error instanceof ApiError && error.status === 404) {
   *     console.error('Server not found');
   *   }
   * }
   */
  getById: (id: string): Promise<ApiResponse<Server>> =>
    apiClient.get<ApiResponse<Server>>(`/api/servers/${id}`),
};
