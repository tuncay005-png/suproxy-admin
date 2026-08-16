/**
 * Xray Management API Endpoint Module
 * Provides methods for Xray instance, inbound, and client management operations
 * 
 * This module implements comprehensive Xray management including:
 * - Instance control (start, stop, restart, reload)
 * - Inbound configuration management
 * - Client provisioning and management
 * 
 * Validates: Requirements 4.1-4.10, 5.1-5.10, 6.1-6.10, 11.1-11.3
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';
import type {
  XrayInstance,
  XrayInstanceHealth,
  XrayInstanceStats,
  XrayInbound,
  CreateInboundInput,
  XrayClient,
  CreateClientInput,
  XrayClientConfig,
} from '@/types/xray';

/**
 * Xray management API endpoints
 * Organized into three main sections: instances, inbounds, and clients
 * 
 * @example
 * import { xrayApi } from '@/lib/api/endpoints/xray';
 * 
 * // List all instances
 * const instances = await xrayApi.instances.list();
 * 
 * // Start an instance
 * await xrayApi.instances.start('instance-id');
 * 
 * // Create an inbound
 * const inbound = await xrayApi.inbounds.create({
 *   instance_id: 'inst-123',
 *   protocol: 'vless',
 *   port: 443,
 *   tag: 'main-inbound',
 *   settings: {}
 * });
 */
export const xrayApi = {
  /**
   * Xray Instance Management
   * Control and monitor Xray proxy server instances
   */
  instances: {
    /**
     * List all Xray instances
     * 
     * @returns Promise resolving to list of instances with status and server info
     * @throws ApiError when the request fails
     */
    list: (): Promise<ApiResponse<{ instances: XrayInstance[] }>> =>
      apiClient.get<ApiResponse<{ instances: XrayInstance[] }>>('/api/admin/xray/instances'),

    /**
     * Get details for a specific Xray instance
     * 
     * @param id Instance UUID
     * @returns Promise resolving to instance details
     * @throws ApiError when instance not found or request fails
     */
    getById: (id: string): Promise<ApiResponse<XrayInstance>> =>
      apiClient.get<ApiResponse<XrayInstance>>(`/api/admin/xray/instances/${id}`),

    /**
     * Start a stopped Xray instance
     * 
     * @param id Instance UUID
     * @returns Promise resolving to success message
     * @throws ApiError when start operation fails
     */
    start: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post<ApiResponse<{ message: string }>>(`/api/admin/xray/instances/${id}/start`, {}),

    /**
     * Stop a running Xray instance
     * 
     * @param id Instance UUID
     * @returns Promise resolving to success message
     * @throws ApiError when stop operation fails
     */
    stop: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post<ApiResponse<{ message: string }>>(`/api/admin/xray/instances/${id}/stop`, {}),

    /**
     * Restart a running Xray instance
     * 
     * @param id Instance UUID
     * @returns Promise resolving to success message
     * @throws ApiError when restart operation fails
     */
    restart: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post<ApiResponse<{ message: string }>>(`/api/admin/xray/instances/${id}/restart`, {}),

    /**
     * Reload configuration for a running Xray instance
     * 
     * @param id Instance UUID
     * @returns Promise resolving to success message
     * @throws ApiError when reload operation fails
     */
    reload: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post<ApiResponse<{ message: string }>>(`/api/admin/xray/instances/${id}/reload`, {}),

    /**
     * Get health status for an instance
     * 
     * @param id Instance UUID
     * @returns Promise resolving to health status with uptime and error info
     * @throws ApiError when health check fails
     */
    getHealth: (id: string): Promise<ApiResponse<XrayInstanceHealth>> =>
      apiClient.get<ApiResponse<XrayInstanceHealth>>(`/api/admin/xray/instances/${id}/health`),

    /**
     * Get statistics for an instance
     * 
     * @param id Instance UUID
     * @returns Promise resolving to instance statistics (connections, traffic, clients)
     * @throws ApiError when stats retrieval fails
     */
    getStats: (id: string): Promise<ApiResponse<XrayInstanceStats>> =>
      apiClient.get<ApiResponse<XrayInstanceStats>>(`/api/admin/xray/instances/${id}/stats`),
  },

  /**
   * Xray Inbound Configuration Management
   * Create and manage inbound proxy configurations
   */
  inbounds: {
    /**
     * List all Xray inbounds
     * 
     * @returns Promise resolving to list of inbound configurations
     * @throws ApiError when the request fails
     */
    list: (): Promise<ApiResponse<{ inbounds: XrayInbound[] }>> =>
      apiClient.get<ApiResponse<{ inbounds: XrayInbound[] }>>('/api/admin/xray/inbounds'),

    /**
     * Get details for a specific inbound
     * 
     * @param id Inbound UUID
     * @returns Promise resolving to inbound configuration
     * @throws ApiError when inbound not found or request fails
     */
    getById: (id: string): Promise<ApiResponse<XrayInbound>> =>
      apiClient.get<ApiResponse<XrayInbound>>(`/api/admin/xray/inbounds/${id}`),

    /**
     * Create a new inbound configuration
     * 
     * @param data Inbound configuration (instance_id, protocol, port, tag, settings)
     * @returns Promise resolving to created inbound
     * @throws ApiError when creation fails (e.g., port conflict, validation errors)
     */
    create: (data: CreateInboundInput): Promise<ApiResponse<XrayInbound>> =>
      apiClient.post<ApiResponse<XrayInbound>>('/api/admin/xray/inbounds', data),

    /**
     * Update an existing inbound configuration
     * 
     * @param id Inbound UUID
     * @param data Partial inbound configuration to update
     * @returns Promise resolving to updated inbound
     * @throws ApiError when update fails
     */
    update: (id: string, data: Partial<CreateInboundInput>): Promise<ApiResponse<XrayInbound>> =>
      apiClient.put<ApiResponse<XrayInbound>>(`/api/admin/xray/inbounds/${id}`, data),

    /**
     * Delete an inbound configuration
     * 
     * @param id Inbound UUID
     * @returns Promise resolving to success message
     * @throws ApiError when deletion fails or inbound has active clients
     */
    delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/admin/xray/inbounds/${id}`),

    /**
     * Enable an inbound configuration
     * 
     * @param id Inbound UUID
     * @returns Promise resolving to updated inbound
     * @throws ApiError when enable operation fails
     */
    enable: (id: string): Promise<ApiResponse<XrayInbound>> =>
      apiClient.put<ApiResponse<XrayInbound>>(`/api/admin/xray/inbounds/${id}/enable`, {}),

    /**
     * Disable an inbound configuration
     * 
     * @param id Inbound UUID
     * @returns Promise resolving to updated inbound
     * @throws ApiError when disable operation fails
     */
    disable: (id: string): Promise<ApiResponse<XrayInbound>> =>
      apiClient.put<ApiResponse<XrayInbound>>(`/api/admin/xray/inbounds/${id}/disable`, {}),
  },

  /**
   * Xray Client Management
   * Provision and manage individual client access configurations
   */
  clients: {
    /**
     * List all Xray clients
     * 
     * @returns Promise resolving to list of clients with traffic stats
     * @throws ApiError when the request fails
     */
    list: (): Promise<ApiResponse<{ clients: XrayClient[] }>> =>
      apiClient.get<ApiResponse<{ clients: XrayClient[] }>>('/api/admin/xray/clients'),

    /**
     * Get details for a specific client
     * 
     * @param id Client UUID
     * @returns Promise resolving to client configuration
     * @throws ApiError when client not found or request fails
     */
    getById: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.get<ApiResponse<XrayClient>>(`/api/admin/xray/clients/${id}`),

    /**
     * Create a new client configuration
     * Returns the client object along with connection configuration
     * 
     * @param data Client creation data (email, inbound_id, optional settings)
     * @returns Promise resolving to created client with config (URL and QR code)
     * @throws ApiError when creation fails (e.g., duplicate email, validation errors)
     */
    create: (data: CreateClientInput): Promise<ApiResponse<XrayClient & { config: XrayClientConfig }>> =>
      apiClient.post<ApiResponse<XrayClient & { config: XrayClientConfig }>>('/api/admin/xray/clients', data),

    /**
     * Delete a client configuration
     * 
     * @param id Client UUID
     * @returns Promise resolving to success message
     * @throws ApiError when deletion fails
     */
    delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/admin/xray/clients/${id}`),

    /**
     * Enable a client configuration
     * 
     * @param id Client UUID
     * @returns Promise resolving to updated client
     * @throws ApiError when enable operation fails
     */
    enable: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.put<ApiResponse<XrayClient>>(`/api/admin/xray/clients/${id}/enable`, {}),

    /**
     * Disable a client configuration
     * 
     * @param id Client UUID
     * @returns Promise resolving to updated client
     * @throws ApiError when disable operation fails
     */
    disable: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.put<ApiResponse<XrayClient>>(`/api/admin/xray/clients/${id}/disable`, {}),

    /**
     * Regenerate UUID for a client
     * This will invalidate existing client configurations
     * 
     * @param id Client UUID
     * @returns Promise resolving to updated client with new UUID
     * @throws ApiError when regeneration fails
     */
    regenerateUuid: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.post<ApiResponse<XrayClient>>(`/api/admin/xray/clients/${id}/regenerate-uuid`, {}),

    /**
     * Reprovision a client (regenerate configuration)
     * 
     * @param id Client UUID
     * @returns Promise resolving to updated client
     * @throws ApiError when reprovisioning fails
     */
    reprovision: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.post<ApiResponse<XrayClient>>(`/api/admin/xray/clients/${id}/reprovision`, {}),
  },
};
