/**
 * User entity TypeScript type definitions
 * These types define user data structures used throughout the application
 */

/**
 * Complete user entity with all fields
 * Matches backend AdminUserResponse structure
 */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string;
  status: string; // 'active' | 'inactive' | 'suspended'
  role: string;
  last_login_at: string | null;
  last_login_ip: string;
  failed_login_count: number;
  locked_until: string | null;
  password_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input data required to create a new user
 */
export interface CreateUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
}

/**
 * Input data for updating an existing user
 */
export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

/**
 * Response structure for paginated user list endpoint
 * Matches backend: {success: true, data: {users: [...], total, offset, limit}}
 */
export interface UsersListResponse {
  users: User[];
  total: number;
  offset: number;
  limit: number;
}
