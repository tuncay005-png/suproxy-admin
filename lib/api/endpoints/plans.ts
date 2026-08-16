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
 * Plan management API endpoints
 * 
 * @example
 * import { plansApi } from '@/lib/api/endpoints/plans';
 * 
 * // List all plans
 * const response = await plansApi.list();
 * console.log(`Found ${response.data.plans.length} plans`);
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
   * List all subscription plans
   * 
   * @returns Promise resolving to list of plans with pricing and limits
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await plansApi.list();
   *   const plans = response.data.plans;
   *   console.log(`Found ${plans.length} plans`);
   *   plans.forEach(plan => {
   *     console.log(`${plan.name}: ${plan.price} ${plan.currency}`);
   *     console.log(`  Active subscriptions: ${plan.active_subscriptions}`);
   *   });
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch plans:', error.message);
   *   }
   * }
   */
  list: (): Promise<ApiResponse<PlansListResponse>> =>
    apiClient.get<ApiResponse<PlansListResponse>>('/api/plans'),

  /**
   * Get details for a specific plan
   * 
   * @param id Plan UUID
   * @returns Promise resolving to plan details
   * @throws ApiError when plan not found or request fails
   * 
   * @example
   * try {
   *   const response = await plansApi.getById('123e4567-e89b-12d3-a456-426614174000');
   *   console.log('Plan:', response.data.name);
   *   console.log('Price:', response.data.price, response.data.currency);
   *   console.log('Duration:', response.data.duration_days, 'days');
   *   console.log('Data limit:', response.data.data_limit_gb, 'GB');
   * } catch (error) {
   *   if (error instanceof ApiError && error.status === 404) {
   *     console.error('Plan not found');
   *   }
   * }
   */
  getById: (id: string): Promise<ApiResponse<Plan>> =>
    apiClient.get<ApiResponse<Plan>>(`/api/plans/${id}`),

  /**
   * Create a new subscription plan
   * 
   * @param data Plan creation data (name, description, price, currency, duration, limits, active)
   * @returns Promise resolving to created plan
   * @throws ApiError when creation fails (e.g., validation errors, duplicate name)
   * 
   * @example
   * try {
   *   const response = await plansApi.create({
   *     name: 'Premium',
   *     description: 'Premium subscription',
   *     price: 29.99,
   *     currency: 'USD',
   *     duration_days: 30,
   *     data_limit_gb: 1000,
   *     active: true
   *   });
   *   console.log('Plan created:', response.data.id);
   * } catch (error) {
   *   if (error instanceof ApiError && error.isValidationError) {
   *     console.error('Validation error:', error.details);
   *   }
   * }
   */
  create: (data: CreatePlanInput): Promise<ApiResponse<Plan>> =>
    apiClient.post<ApiResponse<Plan>>('/api/plans', data),

  /**
   * Update an existing plan
   * 
   * @param id Plan UUID
   * @param data Partial plan data to update
   * @returns Promise resolving to updated plan
   * @throws ApiError when update fails (e.g., validation errors)
   * 
   * @example
   * try {
   *   const response = await plansApi.update('123e4567-e89b-12d3-a456-426614174000', {
   *     price: 24.99,
   *     description: 'Updated premium subscription'
   *   });
   *   console.log('Plan updated:', response.data);
   * } catch (error) {
   *   if (error instanceof ApiError && error.isValidationError) {
   *     console.error('Validation error:', error.details);
   *   }
   * }
   */
  update: (id: string, data: Partial<CreatePlanInput>): Promise<ApiResponse<Plan>> =>
    apiClient.put<ApiResponse<Plan>>(`/api/plans/${id}`, data),

  /**
   * Delete a subscription plan
   * Note: Backend may prevent deletion if plan has active subscriptions
   * 
   * @param id Plan UUID
   * @returns Promise resolving to success message
   * @throws ApiError when deletion fails (e.g., plan has active subscriptions)
   * 
   * @example
   * try {
   *   await plansApi.delete('123e4567-e89b-12d3-a456-426614174000');
   *   console.log('Plan deleted successfully');
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     if (error.status === 400) {
   *       console.error('Cannot delete plan with active subscriptions');
   *     } else {
   *       console.error('Failed to delete plan:', error.message);
   *     }
   *   }
   * }
   */
  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/api/plans/${id}`),
};
