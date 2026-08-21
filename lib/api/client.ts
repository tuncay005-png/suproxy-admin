/**
 * Centralized API Client
 * Provides a consistent interface for all backend HTTP communication
 * 
 * Features:
 * - Automatic credential handling (cookies)
 * - Consistent error handling with classification
 * - Error logging with sensitive data sanitization
 * - Type-safe request/response handling
 * - Support for GET, POST, PUT, DELETE methods
 * - Network timeout handling
 * 
 * ## Timeout Strategy
 * 
 * The API client uses the browser's native fetch API, which does not have a built-in
 * timeout mechanism. For production applications, timeouts can be implemented using:
 * 
 * 1. **AbortController with setTimeout**: Create an AbortController and trigger abort
 *    after a specified timeout period.
 * 
 * 2. **Server-side timeout configuration**: Configure timeout at the backend/proxy level
 *    (recommended approach for production).
 * 
 * 3. **Promise.race pattern**: Race the fetch promise against a timeout promise.
 * 
 * Example timeout implementation:
 * ```typescript
 * const controller = new AbortController();
 * const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
 * 
 * try {
 *   const response = await fetch(url, {
 *     signal: controller.signal,
 *     // ... other options
 *   });
 * } catch (error) {
 *   if (error.name === 'AbortError') {
 *     // Handle timeout
 *   }
 * } finally {
 *   clearTimeout(timeoutId);
 * }
 * ```
 * 
 * For this application, we rely on:
 * - Browser default timeout behavior
 * - Backend API timeout configuration
 * - Network error detection (status 0) for connectivity issues
 * - Specific handling of 408 Request Timeout responses from the server
 */

import type { ApiError as ApiErrorType } from '@/types/api';

/**
 * Custom API Error class with enhanced error information
 */
export class ApiError extends Error implements ApiErrorType {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /**
   * Check if the error is a network connectivity error
   */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /**
   * Check if the error is an authentication/authorization error
   */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if the error is a validation error
   */
  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }

  /**
   * Check if the error is a server error
   */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if the error is a timeout error
   */
  get isTimeoutError(): boolean {
    return this.status === 408 || this.code === 'TIMEOUT_ERROR';
  }

  /**
   * Get a user-friendly error message based on error type
   */
  get userFriendlyMessage(): string {
    if (this.isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    if (this.isAuthError) {
      if (this.status === 401) {
        return 'Your session has expired. Please log in again.';
      }
      return 'You do not have permission to perform this action.';
    }

    if (this.isValidationError) {
      return this.message || 'The data you provided is invalid. Please check your input and try again.';
    }

    if (this.isTimeoutError) {
      return 'The request took too long to complete. Please try again.';
    }

    if (this.isServerError) {
      return 'A server error occurred. Our team has been notified. Please try again later.';
    }

    // Return the original message for other errors
    return this.message;
  }

  /**
   * Get default error message for a specific HTTP status code
   * @param status - The HTTP status code
   * @returns Default user-friendly error message
   */
  static getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'You do not have permission to access this resource.',
      404: 'The requested resource was not found.',
      408: 'Request timeout. Please try again.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please wait and try again.',
      500: 'Internal server error. Please try again later.',
      502: 'Bad gateway. The server is temporarily unavailable.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. The server took too long to respond.',
    };

    return messages[status] || 'An unexpected error occurred.';
  }
}

/**
 * Centralized API Client class
 * Handles all HTTP requests to the backend API
 */
class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Detect if running server-side or client-side
    const isServerSide = typeof window === 'undefined';
    
    if (isServerSide) {
      // Server-side: Use empty baseURL to make relative requests to Next.js API routes
      // This ensures server-side pages call the proxy routes at /api/*
      this.baseURL = '';
    } else {
      // Client-side: Use backend URL directly (could also use proxy routes)
      // For consistency, we'll use the proxy routes on client-side too
      this.baseURL = '';
    }
  }

  /**
   * Core request method that all HTTP methods use
   * @template T The expected response type
   * @param endpoint The API endpoint path (e.g., '/api/v1/users')
   * @param options Fetch API options
   * @returns Promise resolving to the typed response data
   * @throws ApiError when the request fails
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    _isRetryAfterRefresh = false
  ): Promise<T> {
    // Construct the full URL
    let url: string;
    const isServerSide = typeof window === 'undefined';
    
    if (isServerSide && !endpoint.startsWith('http')) {
      // Server-side with relative URL: prepend localhost
      // Use localhost:3000 for Next.js dev server
      const nextServerUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      url = `${nextServerUrl}${endpoint}`;
    } else {
      // Client-side or already absolute URL
      url = `${this.baseURL}${endpoint}`;
    }

    try {
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };
      
      // On server-side, manually forward cookies if available
      if (isServerSide) {
        try {
          // Dynamically import cookies to avoid bundling server-only code on client
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const allCookies = cookieStore.getAll();
          
          if (allCookies.length > 0) {
            // Convert cookies to Cookie header format
            const cookieHeader = allCookies
              .map(cookie => `${cookie.name}=${cookie.value}`)
              .join('; ');
            (headers as Record<string, string>)['Cookie'] = cookieHeader;
          }
        } catch (error) {
          console.warn('[API-CLIENT] Could not access cookies on server-side:', error);
        }
      }

      const response = await fetch(url, {
        ...options,
        credentials: isServerSide ? 'include' : 'include', // Include cookies for session management
        headers,
      });


      // Client-side 401 handling with automatic refresh (max 1 retry)
      if (!response.ok && response.status === 401 && typeof window !== 'undefined' && !endpoint.includes('/api/auth/refresh') && !_isRetryAfterRefresh) {
        console.log('[API-CLIENT] 401 detected, attempting refresh...');
        
        // Single-flight mutex: wait if refresh already in progress
        if (this.refreshPromise) {
          console.log('[API-CLIENT] Refresh already in progress, waiting...');
          const success = await this.refreshPromise;
          if (success) {
            console.log('[API-CLIENT] Retrying after completed refresh');
            return this.request<T>(endpoint, options, true);
          }
        } else {
          // Start new refresh
          this.refreshPromise = (async () => {
            try {
              console.log('[API-CLIENT] Calling refresh endpoint...');
              const refreshResponse = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
              });
              
              if (refreshResponse.ok) {
                console.log('[API-CLIENT] Refresh successful');
                return true;
              } else {
                console.log('[API-CLIENT] Refresh failed, logging out');
                // Logout and redirect
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
                window.location.href = '/login';
                return false;
              }
            } catch (error) {
              console.error('[API-CLIENT] Refresh error:', error);
              return false;
            } finally {
              this.refreshPromise = null;
            }
          })();
          
          const success = await this.refreshPromise;
          if (success) {
            console.log('[API-CLIENT] Retrying original request');
            return this.request<T>(endpoint, options, true);
          }
        }
      }

      if (!response.ok) {
        const error = await this.handleError(response);
        this.logError(error, {
          url,
          method: options?.method || 'GET',
          status: response.status,
        });
        throw error;
      }

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      // If it's already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        const apiError = new ApiError(
          'Network error: Unable to reach the server. Please check your connection.',
          0,
          'NETWORK_ERROR',
          { originalError: error.message }
        );
        this.logError(apiError, {
          url,
          method: options?.method || 'GET',
          status: 0,
        });
        throw apiError;
      }

      // Handle other errors
      const apiError = new ApiError(
        'An unexpected error occurred',
        0,
        'UNKNOWN_ERROR',
        { originalError: String(error) }
      );
      this.logError(apiError, {
        url,
        method: options?.method || 'GET',
        status: 0,
      });
      throw apiError;
    }
  }

  /**
   * Log error details to console for debugging
   * Only logs unexpected errors (not auth failures during login)
   * @param error The ApiError to log
   * @param context Additional context about the request
   */
  private logError(
    error: ApiError,
    context: {
      url: string;
      method: string;
      status: number;
    }
  ): void {
    // Don't log expected authentication errors (401/403)
    // These are normal when users enter wrong credentials
    if (error.isAuthError) {
      return;
    }

    // Don't log network errors during development (often due to server not running)
    // Only log them in production where they indicate real connectivity issues
    if (error.isNetworkError && process.env.NODE_ENV === 'development') {
      return;
    }

    // Sanitize sensitive data (remove potential passwords, tokens)
    const sanitizedDetails = this.sanitizeErrorDetails(error.details);

    // Log structured error with clear formatting for unexpected errors
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('API Error Details:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Endpoint:', context.url);
    console.error('Method:', context.method);
    console.error('Status:', error.status || 'N/A');
    console.error('Code:', error.code || 'UNKNOWN');
    console.error('Message:', error.message || 'No error message provided');
    
    if (sanitizedDetails && Object.keys(sanitizedDetails).length > 0) {
      console.error('Details:', JSON.stringify(sanitizedDetails, null, 2));
    }
    
    console.error('Timestamp:', new Date().toISOString());
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Sanitize error details to remove sensitive information
   * @param details The error details object
   * @returns Sanitized details object
   */
  private sanitizeErrorDetails(
    details?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!details) return undefined;

    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key'];
    const sanitized = { ...details };

    // Remove sensitive keys
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Handle error responses from the API
   * @param response The failed HTTP response
   * @returns Promise resolving to an ApiError
   */
  private async handleError(response: Response): Promise<ApiError> {
    let message = '';
    let details: Record<string, unknown> = {};

    try {
      // Try to parse error response body
      const errorData = await response.json();
      message = errorData.message || errorData.error || '';
      details = errorData;
    } catch {
      // If JSON parsing fails, use empty string (will use default message)
      message = '';
    }

    // Use default message if no message was provided
    if (!message) {
      message = ApiError.getDefaultMessage(response.status);
    }

    // Create and return ApiError with status code
    return new ApiError(
      message,
      response.status,
      `HTTP_${response.status}`,
      details
    );
  }

  /**
   * Perform a GET request
   * @template T The expected response type
   * @param endpoint The API endpoint path
   * @returns Promise resolving to the typed response data
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Perform a POST request
   * @template T The expected response type
   * @param endpoint The API endpoint path
   * @param data The request body data
   * @returns Promise resolving to the typed response data
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  }

  /**
   * Perform a PUT request
   * @template T The expected response type
   * @param endpoint The API endpoint path
   * @param data The request body data
   * @returns Promise resolving to the typed response data
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Perform a DELETE request
   * @template T The expected response type
   * @param endpoint The API endpoint path
   * @returns Promise resolving to the typed response data
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

/**
 * Singleton instance of the API client
 * Import this instance to make API requests throughout the application
 * 
 * @example
 * import { apiClient } from '@/lib/api/client';
 * 
 * const users = await apiClient.get<User[]>('/api/v1/users');
 * const newUser = await apiClient.post<User>('/api/v1/users', userData);
 */
export const apiClient = new ApiClient();
