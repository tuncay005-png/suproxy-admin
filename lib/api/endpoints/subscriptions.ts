/**
 * Subscription API Endpoint Module
 * Provides methods for viewing user subscription information
 * 
 * This module implements subscription-related API calls for viewing
 * user subscription details including plan, status, and expiry.
 * 
 * Validates: Requirements 3.1-3.6, 11.9
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types/api';
import type { Subscription } from '@/types/subscription';

/**
 * Subscription management API endpoints
 * 
 * @example
 * import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions';
 * 
 * // Get subscription for a user
 * const response = await subscriptionsApi.getForUser('user-id-123');
 * console.log(`User subscription: ${response.data.plan_name}`);
 * console.log(`Status: ${response.data.status}`);
 * console.log(`Expires: ${response.data.expiry_date}`);
 */
export const subscriptionsApi = {
  /**
   * Get subscription details for a specific user
   * 
   * @param userId User UUID to get subscription for
   * @returns Promise resolving to subscription details or null if no subscription
   * @throws ApiError when the request fails
   * 
   * @example
   * try {
   *   const response = await subscriptionsApi.getForUser('123e4567-e89b-12d3-a456-426614174000');
   *   const subscription = response.data;
   *   
   *   if (subscription) {
   *     console.log('Plan:', subscription.plan_name);
   *     console.log('Status:', subscription.status);
   *     console.log('Expires:', subscription.expiry_date);
   *     console.log('Data used:', subscription.data_used_gb, 'GB');
   *     console.log('Data limit:', subscription.data_limit_gb, 'GB');
   *   } else {
   *     console.log('User has no active subscription');
   *   }
   * } catch (error) {
   *   if (error instanceof ApiError) {
   *     console.error('Failed to fetch subscription:', error.message);
   *   }
   * }
   */
  getForUser: (userId: string): Promise<ApiResponse<Subscription | null>> =>
    apiClient.get<ApiResponse<Subscription | null>>(`/api/subscriptions/user/${userId}`),
};
