/**
 * Node Management API Endpoint Module
 * Provides methods for node infrastructure operations
 * 
 * This module implements node-related API calls for viewing
 * node information, status, and health metrics.
 * 
 * Validates: Requirements 7.4, 7.5, 11.4
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';
import type { NodesListResponse } from '@/types/server';

/**
 * Node management API endpoints
 * 
 * @example
 * import { nodesApi } from '@/lib/api/endpoints/nodes';
 * 
 * // List all nodes
 * const response = await nodesApi.list();
 * console.log(`Found ${response.data.nodes.length} nodes`);
 * 
 * // List nodes for a specific server
 * const serverNodes = await nodesApi.listByServer('server-id-123');
 * console.log(`Server has ${serverNodes.data.nodes.length} nodes`);
 */
export const nodesApi = {
  /**
   * List all nodes across all servers
   * 
   * @returns Promise resolving to list of nodes with type, status, and health metrics
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await nodesApi.list();
   *   const nodes = response.data.nodes;
   *   console.log(`Found ${nodes.length} nodes`);
   *   nodes.forEach(node => {
   *     console.log(`${node.name} (${node.type}) - ${node.status}`);
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch nodes:', error.message);
   *   }
   * }
   */
  list: (): Promise<ApiResponse<NodesListResponse>> =>
    apiClient.get<ApiResponse<NodesListResponse>>('/api/nodes'),

  /**
   * List nodes for a specific server
   * 
   * @param serverId Server UUID to filter nodes by
   * @returns Promise resolving to list of nodes for the specified server
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await nodesApi.listByServer('123e4567-e89b-12d3-a456-426614174000');
   *   const nodes = response.data.nodes;
   *   console.log(`Server has ${nodes.length} nodes`);
   *   nodes.forEach(node => {
   *     console.log(`${node.name}: ${node.status}`);
   *     if (node.health_metrics.cpu_usage) {
   *       console.log(`  CPU: ${node.health_metrics.cpu_usage}%`);
   *     }
   *     if (node.health_metrics.memory_usage) {
   *       console.log(`  Memory: ${node.health_metrics.memory_usage}%`);
   *     }
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch server nodes:', error.message);
   *   }
   * }
   */
  listByServer: (serverId: string): Promise<ApiResponse<NodesListResponse>> =>
    apiClient.get<ApiResponse<NodesListResponse>>(`/api/nodes?server_id=${serverId}`),
};
