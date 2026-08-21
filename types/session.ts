/**
 * Session entity TypeScript type definitions
 * These types define user session data structures matching backend Go DTO
 */

/**
 * User session entity representing an authenticated user active session
 * Maps to backend SessionInfo DTO
 */
export interface UserSession {
  id: string;
  user_id?: string;
  username?: string;
  email?: string;
  device_name: string;
  platform: string;
  ip_address: string;
  user_agent?: string; // Optional - fallback for display
  last_used_at?: string | null;
  last_activity_at?: string;
  created_at: string;
  expires_at?: string;
}

/**
 * Response structure for sessions list endpoint
 */
export interface SessionsListResponse {
  sessions: UserSession[];
  total: number;
}
