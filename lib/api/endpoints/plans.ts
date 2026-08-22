/**
 * Plan Management API Endpoint Module
 * Provides methods for subscription plan management operations
 * 
 * This module implements plan-related API calls including creating,
 * updating, and deleting subscription plans.
 * 
 * Validates: Requirements 8.1-8.11, 11.5
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';
import type { Plan, CreatePlanInput, PlansListResponse } from '@/types/plan';

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Plan management API endpoints
 * 
 * @example
 * import { plansApi } from '@/lib/api/endpoints/plans';
 * 
 * // List plans with pagination
 * const response = await plansApi.list({ page: 1, limit: 20 });
 * console.log(`Found ${response.data.plans.length} plans out of ${response.data.total}`);
 * 
 * // Create a new plan
 * const newPlan = await plansApi.create({
 *   name: 'Premium',
 *   description: 'Premium subscription with unlimited data',
 *   price: 29.99,
 *   currency: 'USD',
 *   duration_days: 30,
 *   data_limit_gb: 1000,
 *   active: true
 * });
 */
export const plansApi = {
  /**
   * List subscription plans with pagination
   * 
   * @param params Pagination parameters (page, limit)
   * @returns Promise resolving to list of plans with pricing and limits
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await plansApi.list({ page: 1, limit: 20 });
   *   const plans = response.data.plans;
   *   console.log(`Found ${plans.length} plans out of ${response.data.total} total`);
   *   plans.forEach(plan => {
   *     console.log(`${plan.name}: ${plan.price} ${plan.currency}`);
   *     console.log(`  Active subscriptions: ${plan.active_subscriptions}`);
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch plans:', error);
   * }
   */
  list: (params?: PaginationParams): Promise<ApiResponse<PlansListResponse>> => {
    const page = params?.page ?? 1;
    const limit = Math.min(params?.limit ?? 20, 100); // Max 100
    const offset = (page - 1) * limit;
    
    return apiClient.get<ApiResponse<PlansListResponse>>(
      `/api/plans?offset=${offset}&limit=${limit}`
    );
  },

  /**
   * Get plan details by ID
   * 
   * @param id Plan UUID
   * @returns Promise resolving to the plan object
   * @throws ApiError when plan not found or request fails
   */
  getById: (id: string): Promise<ApiResponse<Plan>> =>
    apiClient.get<ApiResponse<Plan>>(`/api/plans/${id}`),

  /**
   * Create a new subscription plan
   * 
   * @param data Plan creation data
   * @returns Promise resolving to the created plan object
   * @throws ApiError when validation fails or request fails
   */
  create: (data: CreatePlanInput): Promise<ApiResponse<Plan>> =>
    apiClient.post<ApiResponse<Plan>>('/api/plans', data),

  /**
   * Update an existing plan
   * 
   * @param id Plan UUID
   * @param data Updated plan data
   * @returns Promise resolving to the updated plan object
   * @throws ApiError when plan not found or request fails
   */
  update: (id: string, data: Partial<CreatePlanInput>): Promise<ApiResponse<Plan>> =>
    apiClient.put<ApiResponse<Plan>>(`/api/plans/${id}`, data),

  /**
   * Delete a plan
   * 
   * @param id Plan UUID to delete
   * @returns Promise resolving when deletion is complete
   * @throws ApiError when plan not found or request fails
   */
  delete: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/plans/${id}`),
};
