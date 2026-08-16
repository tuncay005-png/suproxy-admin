/**
 * Audit log TypeScript type definitions
 * These types define audit logging data structures
 */

/**
 * Audit log entry representing a recorded administrative action
 */
export interface AuditLog {
  id: string;
  action: string;
  actor_id: string;
  actor_email: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure';
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Response structure for audit logs list endpoint
 */
export interface AuditLogsListResponse {
  logs: AuditLog[];
  total: number;
  offset: number;
  limit: number;
}

/**
 * Filter parameters for querying audit logs
 */
export interface AuditLogsFilter {
  page?: number;
  limit?: number;
  action?: string;
  entity_type?: string;
  actor_id?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Statistics summary for audit logs
 */
export interface AuditStats {
  total_actions: number;
  actions_by_type: Record<string, number>;
  recent_activity_count: number;
}
