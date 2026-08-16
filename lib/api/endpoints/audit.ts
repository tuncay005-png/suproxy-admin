/**
 * Audit Logs API Endpoint Module
 * Provides methods for viewing and filtering audit log entries
 * 
 * This module implements audit log-related API calls including
 * retrieving logs with filters and statistics.
 * 
 * Validates: Requirements 9.1-9.10, 11.6
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';
import type { AuditLog, AuditLogsListResponse, AuditLogsFilter, AuditStats } from '@/types/audit';

/**
 * Audit logs API endpoints
 * 
 * @example
 * import { auditApi } from '@/lib/api/endpoints/audit';
 * 
 * // Get recent audit logs
 * const response = await auditApi.getLogs({ limit: 10 });
 * console.log(`Found ${response.data.logs.length} log entries`);
 * 
 * // Get logs with filters
 * const filtered = await auditApi.getLogs({
 *   action: 'user.create',
 *   entity_type: 'user',
 *   start_date: '2024-01-01',
 *   end_date: '2024-01-31'
 * });
 * 
 * // Get statistics
 * const stats = await auditApi.getStats();
 * console.log(`Total actions: ${stats.data.total_actions}`);
 */
export const auditApi = {
  /**
   * Get audit logs with optional filtering and pagination
   * 
   * @param filters Optional filters (page, limit, action, entity_type, actor_id, date range)
   * @returns Promise resolving to paginated list of audit logs
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await auditApi.getLogs({
   *     page: 1,
   *     limit: 25,
   *     action: 'user.create',
   *     entity_type: 'user',
   *     start_date: '2024-01-01T00:00:00Z',
   *     end_date: '2024-01-31T23:59:59Z'
   *   });
   *   
   *   console.log(`Page ${response.data.offset / response.data.limit + 1}`);
   *   console.log(`Total logs: ${response.data.total}`);
   *   
   *   response.data.logs.forEach(log => {
   *     console.log(`[${log.created_at}] ${log.actor_email} - ${log.action}`);
   *     console.log(`  Entity: ${log.entity_type}/${log.entity_id}`);
   *     console.log(`  Status: ${log.status}`);
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch audit logs:', error.message);
   *   }
   * }
   */
  getLogs: (filters?: AuditLogsFilter): Promise<ApiResponse<AuditLogsListResponse>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.set('page', filters.page.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      if (filters.action) params.set('action', filters.action);
      if (filters.entity_type) params.set('entity_type', filters.entity_type);
      if (filters.actor_id) params.set('actor_id', filters.actor_id);
      if (filters.start_date) params.set('start_date', filters.start_date);
      if (filters.end_date) params.set('end_date', filters.end_date);
    }

    const queryString = params.toString();
    const endpoint = `/api/admin/audit/logs${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ApiResponse<AuditLogsListResponse>>(endpoint);
  },

  /**
   * Get audit log statistics and action counts
   * 
   * @returns Promise resolving to audit statistics
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await auditApi.getStats();
   *   const stats = response.data;
   *   
   *   console.log('Total actions:', stats.total_actions);
   *   console.log('Recent activity:', stats.recent_activity_count);
   *   console.log('\nActions by type:');
   *   
   *   Object.entries(stats.actions_by_type).forEach(([action, count]) => {
   *     console.log(`  ${action}: ${count}`);
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch audit stats:', error.message);
   *   }
   * }
   */
  getStats: (): Promise<ApiResponse<AuditStats>> =>
    apiClient.get<ApiResponse<AuditStats>>('/api/admin/audit/stats'),
};
