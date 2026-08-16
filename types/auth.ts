/**
 * Authentication-related TypeScript type definitions
 * These types define the shape of authentication data used throughout the application
 */

/**
 * Login credentials submitted by the user
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response returned from the backend Go API
 */
export interface BackendLoginResponse {
  success: boolean;
  data: {
    user: UserInfo;
    access_token: string;
    refresh_token: string;
  };
}

/**
 * Response returned from the Next.js API route to the frontend
 */
export interface LoginResponse {
  user: UserInfo;
}

/**
 * Basic user information included in authentication responses
 */
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Session data stored in httpOnly cookies
 */
export interface Session {
  user: UserInfo;
  expiresAt: string;
}
