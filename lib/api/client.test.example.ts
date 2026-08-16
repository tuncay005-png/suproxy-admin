/**
 * Example usage of the API Client
 * This file demonstrates how to use the centralized API client
 * 
 * NOTE: This is not a runnable test, just example code for documentation
 */

import { apiClient, ApiError } from './client';
import type { User } from '@/types/user';
import type { LoginCredentials, LoginResponse } from '@/types/auth';

// Example 1: GET request
async function exampleGetRequest() {
  try {
    const users = await apiClient.get<User[]>('/api/v1/users');
    console.log('Users:', users);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message);
      console.error('Status:', error.status);
      console.error('Code:', error.code);
      
      // Handle specific error types
      if (error.isAuthError) {
        console.error('Authentication failed');
      } else if (error.isNetworkError) {
        console.error('Network connectivity issue');
      } else if (error.isValidationError) {
        console.error('Validation error');
      } else if (error.isServerError) {
        console.error('Server error');
      }
    }
  }
}

// Example 2: POST request
async function examplePostRequest() {
  try {
    const credentials: LoginCredentials = {
      email: 'admin@example.com',
      password: 'password123',
    };
    
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/login',
      credentials
    );
    
    console.log('Login successful:', response);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Login failed:', error.message);
    }
  }
}

// Example 3: PUT request
async function examplePutRequest() {
  try {
    const updatedUser = await apiClient.put<User>(
      '/api/v1/users/123',
      {
        name: 'Updated Name',
        email: 'updated@example.com',
      }
    );
    
    console.log('User updated:', updatedUser);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Update failed:', error.message);
    }
  }
}

// Example 4: DELETE request
async function exampleDeleteRequest() {
  try {
    await apiClient.delete('/api/v1/users/123');
    console.log('User deleted successfully');
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Delete failed:', error.message);
    }
  }
}

// Example 5: Error handling patterns
async function exampleErrorHandling() {
  try {
    const result = await apiClient.get('/api/v1/protected-resource');
    console.log(result);
  } catch (error) {
    if (error instanceof ApiError) {
      // Specific error handling based on status
      switch (error.status) {
        case 401:
          console.error('Unauthorized - redirect to login');
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 422:
          console.error('Validation error:', error.details);
          break;
        case 500:
          console.error('Server error - try again later');
          break;
        default:
          console.error('Unknown error:', error.message);
      }
    }
  }
}

export {
  exampleGetRequest,
  examplePostRequest,
  examplePutRequest,
  exampleDeleteRequest,
  exampleErrorHandling,
};
