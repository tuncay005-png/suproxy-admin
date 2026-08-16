/**
 * Dashboard API Endpoints
 * 
 * Provides methods for fetching dashboard statistics and system health data.
 * These endpoints call the Next.js API routes which proxy to the backend Go API.
 * 
 * @module lib/api/endpoints/dashboard
 */

import { apiClient } from '../client';
import type {
  SystemStatsResponse,
  SystemHealthResponse,
  AuditLogsResponse,
  ServersListResponse,
  PlansListResponse,
} from '@/types/dashboard';

/**
 * Dashboard API methods
 */
export const dashboardApi = {
  /**
   * Get system statistics including user, xray, and audit stats
   * Endpoint: GET /api/admin/system/stats
   */
  getSystemStats: () =>
    apiClient.get<SystemStatsResponse>('/api/admin/system/stats'),

  /**
   * Get system health status
   * Endpoint: GET /api/admin/system/health
   */
  getSystemHealth: () =>
    apiClient.get<SystemHealthResponse>('/api/admin/system/health'),

  /**
   * Get audit logs with optional filters
   * Endpoint: GET /api/admin/audit/logs
   */
  getAuditLogs: (params?: {
    offset?: number;
    limit?: number;
    action?: string;
    entity_type?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/admin/audit/logs${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AuditLogsResponse>(endpoint);
  },

  /**
   * Get list of servers
   * Endpoint: GET /api/servers (proxied to backend /api/v1/servers)
   */
  getServers: (params?: { offset?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.offset !== undefined) {
        queryParams.append('offset', String(params.offset));
      }
      if (params.limit !== undefined) {
        queryParams.append('limit', String(params.limit));
      }
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/servers${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ServersListResponse>(endpoint);
  },

  /**
   * Get list of plans
   * Endpoint: GET /api/plans (proxied to backend /api/v1/plans)
   */
  getPlans: () => apiClient.get<PlansListResponse>('/api/plans'),
};
