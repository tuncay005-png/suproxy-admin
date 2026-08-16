/**
 * Application-wide constants for the Admin Dashboard
 */

/**
 * Route paths for the admin dashboard
 */
export const ROUTES = {
  LOGIN: "/admin/login",
  DASHBOARD: "/admin",
  USERS: "/admin/users",
  USER_NEW: "/admin/users/new",
  SERVERS: "/admin/servers",
  PLANS: "/admin/plans",
  LOGS: "/admin/logs",
  DEPLOYMENTS: "/admin/deployments",
} as const;

/**
 * API endpoint paths (relative to NEXT_PUBLIC_API_BASE_URL)
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
  },
  USERS: {
    LIST: "/api/v1/users",
    CREATE: "/api/v1/users",
    GET: (id: string) => `/api/v1/users/${id}`,
    UPDATE: (id: string) => `/api/v1/users/${id}`,
    DELETE: (id: string) => `/api/v1/users/${id}`,
  },
} as const;

/**
 * Cookie names for session management
 */
export const COOKIE_NAMES = {
  SESSION: "admin_session",
  SESSION_TOKEN: "session_token",
} as const;

/**
 * Toast notification durations (in milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * Table column identifiers for user list
 */
export const USER_TABLE_COLUMNS = {
  ID: "id",
  EMAIL: "email",
  NAME: "name",
  ROLE: "role",
  STATUS: "status",
  CREATED_AT: "createdAt",
  ACTIONS: "actions",
} as const;

/**
 * Loading states for async operations
 */
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

/**
 * User roles (extend as needed)
 */
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

/**
 * User statuses (extend as needed)
 */
export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  USER_CREATED: "User created successfully.",
  USER_UPDATED: "User updated successfully.",
  USER_DELETED: "User deleted successfully.",
} as const;

/**
 * Form field limits
 */
export const FORM_LIMITS = {
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  TEXTAREA_MAX_LENGTH: 500,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Local storage keys (use sparingly, prefer cookies for sensitive data)
 */
export const STORAGE_KEYS = {
  THEME: "admin_theme",
  SIDEBAR_STATE: "admin_sidebar_state",
} as const;
