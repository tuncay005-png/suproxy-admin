/**
 * Session entity TypeScript type definitions
 * These types define user session data structures
 */

/**
 * User session entity representing an authenticated user's active session
 */
export interface UserSession {
  id: string;
  user_id: string;
  username: string;
  email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
}

/**
 * Response structure for sessions list endpoint
 */
export interface SessionsListResponse {
  sessions: UserSession[];
  total: number;
}
