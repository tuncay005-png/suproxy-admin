/**
 * Plan entity TypeScript type definitions
 * These types define subscription plan data structures
 */

/**
 * Plan entity representing a subscription tier
 */
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  data_limit_gb: number;
  active: boolean;
  active_subscriptions: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input data required to create a new plan
 */
export interface CreatePlanInput {
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  data_limit_gb: number;
  active: boolean;
}

/**
 * Response structure for plans list endpoint
 */
export interface PlansListResponse {
  plans: Plan[];
  total: number;
}
