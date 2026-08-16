/**
 * API request/response TypeScript type definitions
 * These types define the shape of API communication structures
 */

/**
 * Generic successful API response wrapper
 * @template T The type of the data payload
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Error response structure from API endpoints
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Generic paginated response wrapper
 * @template T The type of items in the list
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  page?: number;
  totalPages?: number;
}
