/**
 * System Monitoring API Endpoint Module
 * Provides methods for system health, statistics, and version information
 * 
 * This module implements system monitoring API calls including health checks,
 * database status, Xray system status, and version information.
 * 
 * Integrates request deduplication cache to prevent redundant API calls when
 * multiple components poll the same endpoints simultaneously.
 * 
 * Validates: Requirements 10.1-10.10, 11.7, 6.7, 12.7
 */

import { apiClient } from '../client';
import { requestCache } from '../request-cache';
import type { ApiResponse } from '@/types/api';
import type { SystemHealth, DatabaseStatus, XraySystemStatus, XrayStatus, VersionInfo } from '@/types/system';

/**
 * System monitoring API endpoints
 * 
 * @example
 * import { systemApi } from '@/lib/api/endpoints/system';
 * 
 * // Get overall system health
 * const health = await systemApi.getHealth();
 * console.log(`System status: ${health.data.status}`);
 * 
 * // Get detailed statistics
 * const stats = await systemApi.getStats();
 * console.log(`Total users: ${stats.data.total_users}`);
 * console.log(`Active Xray instances: ${stats.data.active_xray_instances}`);
 * 
 * // Get database status
 * const dbStatus = await systemApi.getDatabaseStatus();
 * console.log(`Database: ${dbStatus.data.status}`);
 * console.log(`Response time: ${dbStatus.data.response_time_ms}ms`);
 */
export const systemApi = {
  /**
   * Get overall system health status with resource usage metrics
   * 
   * Returns comprehensive system health information including CPU, RAM, Disk, 
   * Swap usage, system uptime, and database connectivity. Used by dashboard
   * circular progress charts and system monitoring components.
   * 
   * @returns Promise resolving to system health information with resource metrics
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await systemApi.getHealth();
   *   const health = response.data;
   *   
   *   console.log('System status:', health.status);
   *   console.log('CPU usage:', health.cpu_usage + '%');
   *   console.log('RAM usage:', health.ram_used, '/', health.ram_total, 'MB');
   *   console.log('Disk usage:', health.disk_used, '/', health.disk_total, 'GB');
   *   console.log('Swap usage:', health.swap_used, '/', health.swap_total, 'MB');
   *   console.log('Uptime:', health.uptime, 'seconds');
   *   console.log('Database:', health.database);
   *   console.log('Checked at:', health.timestamp);
   *   
   *   if (health.status === 'healthy') {
   *     console.log('All systems operational');
   *   } else if (health.status === 'degraded') {
   *     console.log('Some systems experiencing issues');
   *   } else {
   *     console.log('System unhealthy - immediate attention required');
   *   }
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch system health:', error.message);
   *   }
   * }
   */
  getHealth: (): Promise<ApiResponse<SystemHealth>> =>
    requestCache.fetch(
      'system:health',
      () => apiClient.get<ApiResponse<SystemHealth>>('/api/admin/system/health')
    ),

  /**
   * Get system statistics (users, Xray instances, recent audit actions)
   * 
   * @returns Promise resolving to system-wide statistics
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await systemApi.getStats();
   *   const stats = response.data;
   *   
   *   console.log('User Statistics:');
   *   console.log('  Total users:', stats.total_users);
   *   console.log('  Active users:', stats.active_users);
   *   
   *   console.log('\nXray Statistics:');
   *   console.log('  Total instances:', stats.total_xray_instances);
   *   console.log('  Active instances:', stats.active_xray_instances);
   *   
   *   console.log('\nActivity:');
   *   console.log('  Recent audit actions:', stats.recent_audit_actions);
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch system stats:', error.message);
   *   }
   * }
   */
  getStats: (): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    total_xray_instances: number;
    active_xray_instances: number;
    recent_audit_actions: number;
  }>> =>
    apiClient.get<ApiResponse<{
      total_users: number;
      active_users: number;
      total_xray_instances: number;
      active_xray_instances: number;
      recent_audit_actions: number;
    }>>('/api/admin/system/stats'),

  /**
   * Get database connection and performance status
   * 
   * @returns Promise resolving to database status information
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await systemApi.getDatabaseStatus();
   *   const dbStatus = response.data;
   *   
   *   console.log('Database Status:', dbStatus.status);
   *   console.log('Response time:', dbStatus.response_time_ms, 'ms');
   *   console.log('Active connections:', dbStatus.active_connections);
   *   console.log('Max connections:', dbStatus.max_connections);
   *   
   *   const utilization = (dbStatus.active_connections / dbStatus.max_connections * 100).toFixed(1);
   *   console.log('Connection utilization:', utilization + '%');
   *   
   *   if (dbStatus.response_time_ms > 100) {
   *     console.warn('Database response time is high');
   *   }
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch database status:', error.message);
   *   }
   * }
   */
  getDatabaseStatus: (): Promise<ApiResponse<DatabaseStatus>> =>
    apiClient.get<ApiResponse<DatabaseStatus>>('/api/admin/system/database'),

  /**
   * Get Xray system-wide status
   * 
   * @returns Promise resolving to Xray system status
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await systemApi.getXraySystemStatus();
   *   const xrayStatus = response.data;
   *   
   *   console.log('Xray System Status:');
   *   console.log('  Total instances:', xrayStatus.instances_total);
   *   console.log('  Running instances:', xrayStatus.instances_running);
   *   console.log('  Stopped instances:', xrayStatus.instances_stopped);
   *   console.log('  Total clients:', xrayStatus.clients_total);
   *   console.log('  Active clients:', xrayStatus.clients_active);
   *   
   *   const instanceUtilization = (xrayStatus.instances_running / xrayStatus.instances_total * 100).toFixed(1);
   *   console.log('  Instance utilization:', instanceUtilization + '%');
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch Xray status:', error.message);
   *   }
   * }
   */
  getXraySystemStatus: (): Promise<ApiResponse<XraySystemStatus>> =>
    requestCache.fetch(
      'system:xray',
      () => apiClient.get<ApiResponse<XraySystemStatus>>('/api/admin/system/xray')
    ),

  /**
   * Get Xray operational status with real-time metrics
   * 
   * Returns detailed Xray service status including traffic statistics,
   * uptime, and connection information for monitoring purposes.
   * 
   * @returns Promise resolving to Xray operational status
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await systemApi.getXrayStatus();
   *   const xrayStatus = response.data;
   *   
   *   console.log('Xray Status:', xrayStatus.status);
   *   console.log('Version:', xrayStatus.version);
   *   console.log('Traffic Speed:', xrayStatus.traffic_speed, 'bytes/s');
   *   console.log('Total Traffic:', xrayStatus.traffic_total, 'bytes');
   *   console.log('Active Connections:', xrayStatus.active_connections);
   *   console.log('Uptime:', xrayStatus.uptime, 'seconds');
   *   
   *   if (xrayStatus.status === 'running') {
   *     console.log('Xray is operational');
   *   } else if (xrayStatus.status === 'stopped') {
   *     console.log('Xray service is stopped');
   *   } else if (xrayStatus.status === 'error') {
   *     console.error('Xray service has errors');
   *   }
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch Xray status:', error.message);
   *   }
   * }
   * 
   * Validates: Requirements 6.2, 5.1, 5.2
   */
  getXrayStatus: (): Promise<ApiResponse<XrayStatus>> =>
    apiClient.get<ApiResponse<XrayStatus>>('/api/admin/system/xray/status'),

  /**
   * Get application version information
   * 
   * @returns Promise resolving to version information
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await systemApi.getVersion();
   *   const version = response.data;
   *   
   *   console.log('Application Version:', version.version);
   *   console.log('Build date:', version.build_date);
   *   console.log('Git commit:', version.git_commit);
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch version info:', error.message);
   *   }
   * }
   */
  getVersion: (): Promise<ApiResponse<VersionInfo>> =>
    apiClient.get<ApiResponse<VersionInfo>>('/api/admin/system/version'),
};
