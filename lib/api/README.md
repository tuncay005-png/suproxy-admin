# API Client Module

This module provides a centralized, type-safe HTTP client for communicating with the Go backend API.

## Overview

The API client (`client.ts`) implements a consistent interface for all backend communication with:
- ✅ Automatic credential handling (cookies included in requests)
- ✅ Type-safe request/response handling
- ✅ Comprehensive error handling with custom `ApiError` class
- ✅ Support for GET, POST, PUT, DELETE HTTP methods
- ✅ Automatic JSON serialization/deserialization

## Configuration

The API client reads its base URL from the environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

This is configured in `.env.local`.

## Basic Usage

### Import the client

```typescript
import { apiClient, ApiError } from '@/lib/api/client';
```

### GET Request

```typescript
import type { User } from '@/types/user';

const users = await apiClient.get<User[]>('/api/v1/users');
```

### POST Request

```typescript
import type { LoginCredentials, LoginResponse } from '@/types/auth';

const credentials: LoginCredentials = {
  email: 'admin@example.com',
  password: 'password123',
};

const response = await apiClient.post<LoginResponse>(
  '/api/v1/auth/login',
  credentials
);
```

### PUT Request

```typescript
import type { User } from '@/types/user';

const updatedUser = await apiClient.put<User>(
  '/api/v1/users/123',
  {
    name: 'New Name',
    email: 'new@example.com',
  }
);
```

### DELETE Request

```typescript
await apiClient.delete('/api/v1/users/123');
```

## Error Handling

The API client throws `ApiError` instances for all failures. These errors include:

- `message`: Human-readable error message
- `status`: HTTP status code (0 for network errors)
- `code`: Error code (e.g., 'HTTP_404', 'NETWORK_ERROR')
- `details`: Additional error information from the backend

### Basic Error Handling

```typescript
try {
  const users = await apiClient.get<User[]>('/api/v1/users');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
  }
}
```

### Error Type Helpers

The `ApiError` class provides helper methods to identify error types:

```typescript
catch (error) {
  if (error instanceof ApiError) {
    if (error.isAuthError) {
      // 401 or 403 - redirect to login
    } else if (error.isNetworkError) {
      // Network connectivity issue
    } else if (error.isValidationError) {
      // 400 or 422 - show validation errors
    } else if (error.isServerError) {
      // 500+ - show server error message
    }
  }
}
```

### Handling Specific Status Codes

```typescript
catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Redirect to login
        router.push('/login');
        break;
      case 403:
        // Show permission denied message
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        // Show not found message
        toast.error('Resource not found');
        break;
      case 422:
        // Show validation errors
        const validationErrors = error.details;
        // Handle field-level errors
        break;
      default:
        // Generic error message
        toast.error(error.message);
    }
  }
}
```

## Features

### Automatic Cookie Handling

The API client automatically includes credentials (cookies) in all requests:

```typescript
credentials: 'include'
```

This ensures that session tokens stored in httpOnly cookies are sent with every request.

### Type Safety

All methods are generic and type-safe:

```typescript
// TypeScript knows the return type is User[]
const users = await apiClient.get<User[]>('/api/v1/users');

// TypeScript knows the return type is LoginResponse
const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', data);
```

### Automatic JSON Handling

- Request bodies are automatically serialized to JSON
- Response bodies are automatically parsed from JSON
- `Content-Type: application/json` header is set automatically

### Network Error Detection

Network failures (e.g., server unreachable) are caught and converted to `ApiError` instances with:
- `status: 0`
- `code: 'NETWORK_ERROR'`
- User-friendly error message

## Architecture

### Class Structure

```
ApiClient
├── request<T>(endpoint, options) → T
│   ├── Handles fetch request
│   ├── Includes credentials
│   ├── Sets JSON headers
│   ├── Parses response
│   └── Throws ApiError on failure
├── get<T>(endpoint) → T
├── post<T>(endpoint, data) → T
├── put<T>(endpoint, data) → T
└── delete<T>(endpoint) → T

ApiError extends Error
├── code: string
├── status: number
├── details?: Record<string, unknown>
├── isNetworkError: boolean
├── isAuthError: boolean
├── isValidationError: boolean
└── isServerError: boolean
```

## Endpoint Modules

The API client is used by endpoint modules to provide feature-specific methods:

```typescript
// lib/api/endpoints/auth.ts
import { apiClient } from '../client';
import type { LoginCredentials, LoginResponse } from '@/types/auth';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', credentials),
};

// Usage
import { authApi } from '@/lib/api/endpoints/auth';
const response = await authApi.login({ email, password });
```

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 6.1**: ✅ Reads base URL from `NEXT_PUBLIC_API_BASE_URL`
- **Requirement 6.2**: ✅ Provides GET, POST, PUT, DELETE methods
- **Requirement 6.3**: ✅ Includes credentials: 'include' for cookie handling
- **Requirement 6.4**: ✅ Throws ApiError with response details on failure
- **Requirement 6.5**: ✅ Consistent error handling across all endpoints
- **Requirement 6.6**: ✅ Adapter layer normalizes error structures

## Testing

See `client.test.example.ts` for example usage patterns and error handling scenarios.

## Future Enhancements

Potential improvements for future iterations:

1. Request/response interceptors
2. Request retry logic with exponential backoff
3. Request cancellation support (AbortController)
4. Response caching layer
5. Request deduplication
6. Timeout configuration
7. Request/response logging middleware
8. Authentication token refresh logic

## Related Files

- `types/api.ts` - API type definitions
- `types/auth.ts` - Authentication types
- `types/user.ts` - User types
- `lib/api/endpoints/` - Feature-specific endpoint modules
