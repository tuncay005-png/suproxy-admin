/**
 * Subscription entity TypeScript type definitions
 * These types define user subscription data structures
 */

/**
 * Subscription entity representing a user's active plan assignment
 */
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  start_date: string;
  expiry_date: string;
  data_used_gb: number;
  data_limit_gb: number;
  created_at: string;
  updated_at: string;
}
