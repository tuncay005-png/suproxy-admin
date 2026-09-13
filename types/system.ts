/**
 * System monitoring TypeScript type definitions
 * These types define system health and monitoring data structures
 */

/**
 * Overall system health status with resource usage metrics
 * 
 * This interface defines comprehensive system health information including
 * CPU, RAM, Disk, Swap usage, system uptime, and database connectivity.
 * 
 * Used by the dashboard circular progress charts and system monitoring.
 * 
 * @property status - Overall health status of the system
 * @property cpu_usage - CPU usage percentage (0-100)
 * @property ram_used - RAM used in megabytes
 * @property ram_total - Total RAM available in megabytes
 * @property disk_used - Disk space used in gigabytes
 * @property disk_total - Total disk space in gigabytes
 * @property swap_used - Swap memory used in megabytes
 * @property swap_total - Total swap memory in megabytes
 * @property uptime - System uptime in seconds
 * @property database - Database connection status
 * @property timestamp - ISO timestamp of health check
 */
export interface SystemHealth {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** CPU usage percentage (0-100) */
  cpu_usage: number;
  /** RAM used in MB */
  ram_used: number;
  /** Total RAM in MB */
  ram_total: number;
  /** Disk used in GB */
  disk_used: number;
  /** Total disk space in GB */
  disk_total: number;
  /** Swap memory used in MB */
  swap_used: number;
  /** Total swap memory in MB */
  swap_total: number;
  /** System uptime in seconds */
  uptime: number;
  /** Database connection status */
  database: 'connected' | 'disconnected' | 'slow';
  /** Timestamp of health check */
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

/**
 * Xray operational status
 * Used for real-time monitoring of Xray service status, traffic, and uptime
 */
export interface XrayStatus {
  /** Xray service status */
  status: 'running' | 'stopped' | 'restarting' | 'error';
  /** Xray version string */
  version: string;
  /** Current network throughput in bytes/second */
  traffic_speed: number;
  /** Total accumulated traffic in bytes */
  traffic_total: number;
  /** Number of active connections */
  active_connections: number;
  /** Xray uptime in seconds */
  uptime: number;
  /** Last restart timestamp */
  last_restart: string | null;
}
