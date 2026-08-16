/**
 * Dashboard Types
 * 
 * Type definitions for dashboard statistics and system health data
 * Matches the backend response structures from the Go API
 */

/**
 * System Health Response
 * Endpoint: GET /api/v1/admin/system/health
 */
export interface SystemHealthResponse {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: Record<string, ComponentHealth>;
  version: string;
  uptime_seconds: number;
}

export interface ComponentHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  message?: string;
  latency_ms?: number;
}

/**
 * System Statistics Response
 * Endpoint: GET /api/v1/admin/system/stats
 */
export interface SystemStatsResponse {
  users: UserStats;
  xray: XrayStats;
  audit: AuditStats;
  servers?: ServerStats;
  plans?: PlanStats;
  timestamp: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  admin_users: number;
  new_users_today: number;
  new_users_this_week: number;
}

export interface XrayStats {
  total_instances: number;
  running_instances: number;
  stopped_instances: number;
  total_inbounds: number;
  enabled_inbounds: number;
  total_clients: number;
  enabled_clients: number;
}

export interface ServerStats {
  total_servers: number;
  online_servers: number;
  offline_servers: number;
}

export interface PlanStats {
  total_plans: number;
  active_plans: number;
}

export interface AuditStats {
  total_logs: number;
  logs_today: number;
  logs_this_week: number;
  unique_users_today: number;
}

/**
 * Audit Log Entry
 * Endpoint: GET /api/v1/admin/audit/logs
 */
export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogsResponse {
  data: AuditLogEntry[];
  total: number;
  offset: number;
  limit: number;
  total_pages: number;
}

/**
 * Server Response
 * Endpoint: GET /api/v1/servers
 */
export interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  hostname: string;
  provider: string;
  ipv4: string;
  ipv6: string;
  status: string;
  is_public: boolean;
  is_online: boolean;
  node_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServersListResponse {
  servers: Server[];
  total: number;
  offset: number;
  limit: number;
}

/**
 * Plan Response
 * Endpoint: GET /api/v1/plans
 */
export interface Plan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  traffic_limit_gb: number;
  device_limit: number;
  max_sessions: number;
  price: number;
  currency: string;
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface PlansListResponse {
  plans: Plan[];
  total: number;
}
