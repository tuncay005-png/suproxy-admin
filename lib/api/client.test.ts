/**
 * API Client Tests
 * Tests for error handling and classification functionality
 */

import { describe, it, expect } from 'vitest';
import { ApiError } from './client';

describe('ApiError', () => {
  describe('Error Classification', () => {
    it('should identify network errors', () => {
      const error = new ApiError('Network error', 0, 'NETWORK_ERROR');
      expect(error.isNetworkError).toBe(true);
      expect(error.isAuthError).toBe(false);
      expect(error.isValidationError).toBe(false);
      expect(error.isServerError).toBe(false);
    });

    it('should identify auth errors (401)', () => {
      const error = new ApiError('Unauthorized', 401, 'HTTP_401');
      expect(error.isAuthError).toBe(true);
      expect(error.isNetworkError).toBe(false);
      expect(error.isValidationError).toBe(false);
      expect(error.isServerError).toBe(false);
    });

    it('should identify auth errors (403)', () => {
      const error = new ApiError('Forbidden', 403, 'HTTP_403');
      expect(error.isAuthError).toBe(true);
      expect(error.isNetworkError).toBe(false);
      expect(error.isValidationError).toBe(false);
      expect(error.isServerError).toBe(false);
    });

    it('should identify validation errors (400)', () => {
      const error = new ApiError('Bad request', 400, 'HTTP_400');
      expect(error.isValidationError).toBe(true);
      expect(error.isAuthError).toBe(false);
      expect(error.isNetworkError).toBe(false);
      expect(error.isServerError).toBe(false);
    });

    it('should identify validation errors (422)', () => {
      const error = new ApiError('Validation failed', 422, 'HTTP_422');
      expect(error.isValidationError).toBe(true);
      expect(error.isAuthError).toBe(false);
      expect(error.isNetworkError).toBe(false);
      expect(error.isServerError).toBe(false);
    });

    it('should identify server errors (500+)', () => {
      const error500 = new ApiError('Internal error', 500, 'HTTP_500');
      const error502 = new ApiError('Bad gateway', 502, 'HTTP_502');
      const error503 = new ApiError('Service unavailable', 503, 'HTTP_503');

      expect(error500.isServerError).toBe(true);
      expect(error502.isServerError).toBe(true);
      expect(error503.isServerError).toBe(true);
    });

    it('should identify timeout errors', () => {
      const error408 = new ApiError('Request timeout', 408, 'HTTP_408');
      const errorTimeout = new ApiError('Timeout', 0, 'TIMEOUT_ERROR');

      expect(error408.isTimeoutError).toBe(true);
      expect(errorTimeout.isTimeoutError).toBe(true);
    });
  });

  describe('User-Friendly Messages', () => {
    it('should provide user-friendly message for network errors', () => {
      const error = new ApiError('Network error', 0, 'NETWORK_ERROR');
      expect(error.userFriendlyMessage).toContain('Unable to connect');
    });

    it('should provide user-friendly message for 401 errors', () => {
      const error = new ApiError('Unauthorized', 401, 'HTTP_401');
      expect(error.userFriendlyMessage).toContain('session has expired');
    });

    it('should provide user-friendly message for 403 errors', () => {
      const error = new ApiError('Forbidden', 403, 'HTTP_403');
      expect(error.userFriendlyMessage).toContain('do not have permission');
    });

    it('should provide user-friendly message for validation errors', () => {
      const error = new ApiError('Validation failed', 422, 'HTTP_422');
      expect(error.userFriendlyMessage).toContain('Validation failed');
    });

    it('should provide user-friendly message for server errors', () => {
      const error = new ApiError('Server error', 500, 'HTTP_500');
      expect(error.userFriendlyMessage).toContain('server error occurred');
    });

    it('should provide user-friendly message for timeout errors', () => {
      const error = new ApiError('Timeout', 408, 'HTTP_408');
      expect(error.userFriendlyMessage).toContain('took too long');
    });
  });

  describe('Default Error Messages', () => {
    it('should return default message for common status codes', () => {
      expect(ApiError.getDefaultMessage(400)).toContain('Bad request');
      expect(ApiError.getDefaultMessage(401)).toContain('Authentication required');
      expect(ApiError.getDefaultMessage(403)).toContain('do not have permission');
      expect(ApiError.getDefaultMessage(404)).toContain('not found');
      expect(ApiError.getDefaultMessage(408)).toContain('timeout');
      expect(ApiError.getDefaultMessage(422)).toContain('Validation failed');
      expect(ApiError.getDefaultMessage(429)).toContain('Too many requests');
      expect(ApiError.getDefaultMessage(500)).toContain('Internal server error');
      expect(ApiError.getDefaultMessage(502)).toContain('Bad gateway');
      expect(ApiError.getDefaultMessage(503)).toContain('unavailable');
      expect(ApiError.getDefaultMessage(504)).toContain('Gateway timeout');
    });

    it('should return generic message for unknown status codes', () => {
      expect(ApiError.getDefaultMessage(418)).toContain('unexpected error');
      expect(ApiError.getDefaultMessage(999)).toContain('unexpected error');
    });
  });

  describe('Error Properties', () => {
    it('should store error details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ApiError('Validation error', 422, 'HTTP_422', details);

      expect(error.message).toBe('Validation error');
      expect(error.status).toBe(422);
      expect(error.code).toBe('HTTP_422');
      expect(error.details).toEqual(details);
    });

    it('should have correct error name', () => {
      const error = new ApiError('Test error', 500, 'HTTP_500');
      expect(error.name).toBe('ApiError');
    });

    it('should be instanceof Error', () => {
      const error = new ApiError('Test error', 500, 'HTTP_500');
      expect(error).toBeInstanceOf(Error);
    });
  });
});
