import type { ApiError as ApiErrorType } from '@/types/api';
import { multiTabSync } from '@/lib/auth/multi-tab-sync';
import { attemptServerSideRefresh } from '@/lib/api/server-refresh-helper';

export class ApiError extends Error implements ApiErrorType {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get isNetworkError(): boolean { return this.status === 0; }
  get isAuthError(): boolean { return this.status === 401 || this.status === 403; }
  get isValidationError(): boolean { return this.status === 422 || this.status === 400; }
  get isServerError(): boolean { return this.status >= 500; }
  get isTimeoutError(): boolean { return this.status === 408 || this.code === 'TIMEOUT_ERROR'; }

  get userFriendlyMessage(): string {
    if (this.isNetworkError) return 'Unable to connect to the server. Please check your internet connection and try again.';
    if (this.isAuthError) {
      if (this.status === 401) return 'Your session has expired. Please log in again.';
      return 'You do not have permission to perform this action.';
    }
    if (this.isValidationError) return this.message || 'The data you provided is invalid. Please check your input and try again.';
    if (this.isTimeoutError) return 'The request took too long to complete. Please try again.';
    if (this.isServerError) return 'A server error occurred. Our team has been notified. Please try again later.';
    return this.message;
  }

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

class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<boolean> | null = null;
  private isRefreshing: boolean = false;

  constructor() {
    this.baseURL = '';
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number = 30000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout. The server took too long to respond.', 408, 'API_TIMEOUT');
      }
      throw error;
    }
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      console.log('[API-CLIENT] Refresh already in progress, waiting...');
      return await this.refreshPromise;
    }
    
    if (this.isRefreshing) {
      console.log('[API-CLIENT] Refresh flag already set, aborting duplicate attempt');
      return false;
    }

    console.log('[API-CLIENT] Starting token refresh...');
    this.isRefreshing = true;
    this.refreshPromise = this.executeTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
      this.isRefreshing = false;
    }
  }

  private async executeTokenRefresh(): Promise<boolean> {
    try {
      const refreshResponse = await this.fetchWithTimeout('/api/auth/refresh', { method: 'POST', credentials: 'include' }, 5000);
      if (refreshResponse.ok) {
        console.log('[API-CLIENT] Token refresh successful');
        multiTabSync.notifyTokenRefreshed();
        return true;
      } else {
        console.warn('[API-CLIENT] Token refresh failed with status:', refreshResponse.status);
        return false;
      }
    } catch (error) {
      console.error('[API-CLIENT] Token refresh error:', error);
      return false;
    }
  }

  private async handleGracefulLogout(): Promise<void> {
    console.log('[API-CLIENT] Performing graceful logout...');
    try {
      await this.fetchWithTimeout('/api/auth/logout', { method: 'POST', credentials: 'include' }, 5000);
    } catch (error) {
      console.warn('[API-CLIENT] Logout request failed, proceeding with redirect:', error);
    }
    if (typeof window !== 'undefined') {
      console.log('[API-CLIENT] Redirecting to login...');
      multiTabSync.notifyLogout('session_expired');
      window.location.href = '/login?reason=session_expired';
    }
  }
  
  private async request<T>(endpoint: string, options?: RequestInit, retryCount: number = 0): Promise<T> {
    let url: string;
    const isServerSide = typeof window === 'undefined';
    
    if (isServerSide && !endpoint.startsWith('http')) {
      const nextServerUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      url = `${nextServerUrl}${endpoint}`;
    } else {
      url = `${this.baseURL}${endpoint}`;
    }

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json', ...options?.headers };
      
      if (isServerSide) {
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const allCookies = cookieStore.getAll();
          if (allCookies.length > 0) {
            const cookieHeader = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
            (headers as Record<string, string>)['Cookie'] = cookieHeader;
          }
        } catch (error) {
          console.warn('[API-CLIENT] Could not access cookies on server-side:', error);
        }
      }

      const response = await this.fetchWithTimeout(url, { ...options, credentials: 'include', headers });

      // TOKEN_EXPIRED handling - ONLY RETRY ONCE
      if (!response.ok && response.status === 401 && !endpoint.includes('/api/auth/refresh') && !endpoint.includes('/api/auth/login') && retryCount === 0) {
        let shouldRetryWithRefresh = false;
        try {
          const errorData = await response.clone().json();
          const errorCode = errorData?.error?.code || errorData?.code || '';
          const errorMessage = errorData?.error?.message || errorData?.message || '';
          
          if (errorCode === 'TOKEN_EXPIRED' || errorMessage.includes('token has expired') || errorMessage.includes('access token has expired')) {
            shouldRetryWithRefresh = true;
            console.log(`[API-CLIENT] TOKEN_EXPIRED detected (${errorCode}), attempting refresh...`);
          } else if (errorCode === 'TOKEN_REVOKED' || errorMessage.includes('revoked')) {
            console.log('[API-CLIENT] Token revoked, redirecting to login');
            if (!isServerSide) {
              await this.handleGracefulLogout();
            }
            throw new ApiError('Session has been revoked. Please log in again.', 401, 'SESSION_REVOKED');
          } else {
            console.log(`[API-CLIENT] Non-token 401 error, not refreshing. Code: ${errorCode}`);
          }
        } catch (parseError) {
          if (parseError instanceof ApiError) throw parseError;
          console.log('[API-CLIENT] Could not parse 401 error, skipping refresh');
        }

        if (shouldRetryWithRefresh) {
          // Use server-side or client-side refresh based on environment
          const refreshSuccess = isServerSide ? await attemptServerSideRefresh() : await this.attemptTokenRefresh();
          
          if (refreshSuccess) {
            console.log(`[API-CLIENT] Retrying original request after successful refresh (${endpoint})`);
            const retryOptions = options ? { ...options } : undefined;
            if (retryOptions && options?.body) {
              retryOptions.body = options.body;
            }
            // CRITICAL: Pass retryCount=1 to prevent infinite loop
            return this.request<T>(endpoint, retryOptions, 1);
          } else {
            console.log('[API-CLIENT] Refresh failed, session expired');
            if (!isServerSide) {
              await this.handleGracefulLogout();
            }
            throw new ApiError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED');
          }
        }
      }

      if (!response.ok) {
        const error = await this.handleError(response);
        this.logError(error, { url, method: options?.method || 'GET', status: response.status });
        throw error;
      }

      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof TypeError) {
        const apiError = new ApiError('Network error: Unable to reach the server. Please check your connection.', 0, 'NETWORK_ERROR', { originalError: error.message });
        this.logError(apiError, { url, method: options?.method || 'GET', status: 0 });
        throw apiError;
      }
      const apiError = new ApiError('An unexpected error occurred', 0, 'UNKNOWN_ERROR', { originalError: String(error) });
      this.logError(apiError, { url, method: options?.method || 'GET', status: 0 });
      throw apiError;
    }
  }

  private logError(error: ApiError, context: { url: string; method: string; status: number }): void {
    if (error.isAuthError) return;
    if (error.isNetworkError && process.env.NODE_ENV === 'development') return;
    const sanitizedDetails = this.sanitizeErrorDetails(error.details);
    console.error('═══════════════════════════════════════════');
    console.error('API Error Details:');
    console.error('═══════════════════════════════════════════');
    console.error('Endpoint:', context.url);
    console.error('Method:', context.method);
    console.error('Status:', error.status || 'N/A');
    console.error('Code:', error.code || 'UNKNOWN');
    console.error('Message:', error.message || 'No error message provided');
    if (sanitizedDetails && Object.keys(sanitizedDetails).length > 0) {
      console.error('Details:', JSON.stringify(sanitizedDetails, null, 2));
    }
    console.error('Timestamp:', new Date().toISOString());
    console.error('═══════════════════════════════════════════');
  }

  private sanitizeErrorDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!details) return undefined;
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key'];
    const sanitized = { ...details };
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  private async handleError(response: Response): Promise<ApiError> {
    let message = '';
    let details: Record<string, unknown> = {};
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || '';
      details = errorData;
    } catch {}
    if (!message) {
      message = ApiError.getDefaultMessage(response.status);
    }
    return new ApiError(message, response.status, `HTTP_${response.status}`, details);
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
    return result;
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
