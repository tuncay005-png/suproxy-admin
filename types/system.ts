/**
 * System monitoring TypeScript type definitions
 * These types define system health and monitoring data structures
 */

/**
 * Overall system health status
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected';
  timestamp: string;
}

/**
 * Database connection and performance status
 */
export interface DatabaseStatus {
  status: 'connected' | 'disconnected';
  response_time_ms: number;
  active_connections: number;
  max_connections: number;
}

/**
 * Xray system-wide status information
 */
export interface XraySystemStatus {
  instances_total: number;
  instances_running: number;
  instances_stopped: number;
  clients_total: number;
  clients_active: number;
}

/**
 * Application version information
 */
export interface VersionInfo {
  version: string;
  build_date: string;
  git_commit: string;
}
