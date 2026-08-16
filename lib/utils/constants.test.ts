import { describe, it, expect } from "vitest";
import {
  ROUTES,
  API_ENDPOINTS,
  COOKIE_NAMES,
  TOAST_DURATION,
  PAGINATION,
  USER_TABLE_COLUMNS,
  LOADING_STATES,
  USER_ROLES,
  USER_STATUSES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FORM_LIMITS,
  HTTP_STATUS,
  STORAGE_KEYS,
} from "./constants";

describe("constants", () => {
  it("should define route paths", () => {
    expect(ROUTES.LOGIN).toBe("/admin/login");
    expect(ROUTES.DASHBOARD).toBe("/admin");
    expect(ROUTES.USERS).toBe("/admin/users");
    expect(ROUTES.USER_NEW).toBe("/admin/users/new");
  });

  it("should define API endpoints", () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe("/api/v1/auth/login");
    expect(API_ENDPOINTS.USERS.LIST).toBe("/api/v1/users");
    expect(API_ENDPOINTS.USERS.GET("123")).toBe("/api/v1/users/123");
  });

  it("should define cookie names", () => {
    expect(COOKIE_NAMES.SESSION).toBe("admin_session");
    expect(COOKIE_NAMES.SESSION_TOKEN).toBe("session_token");
  });

  it("should define toast durations", () => {
    expect(TOAST_DURATION.SHORT).toBe(2000);
    expect(TOAST_DURATION.MEDIUM).toBe(4000);
    expect(TOAST_DURATION.LONG).toBe(6000);
  });

  it("should define pagination settings", () => {
    expect(PAGINATION.DEFAULT_PAGE_SIZE).toBe(20);
    expect(PAGINATION.PAGE_SIZE_OPTIONS).toEqual([10, 20, 50, 100]);
  });

  it("should define user table columns", () => {
    expect(USER_TABLE_COLUMNS.ID).toBe("id");
    expect(USER_TABLE_COLUMNS.EMAIL).toBe("email");
    expect(USER_TABLE_COLUMNS.ACTIONS).toBe("actions");
  });

  it("should define loading states", () => {
    expect(LOADING_STATES.IDLE).toBe("idle");
    expect(LOADING_STATES.LOADING).toBe("loading");
    expect(LOADING_STATES.SUCCESS).toBe("success");
    expect(LOADING_STATES.ERROR).toBe("error");
  });

  it("should define user roles", () => {
    expect(USER_ROLES.ADMIN).toBe("admin");
    expect(USER_ROLES.USER).toBe("user");
  });

  it("should define user statuses", () => {
    expect(USER_STATUSES.ACTIVE).toBe("active");
    expect(USER_STATUSES.INACTIVE).toBe("inactive");
    expect(USER_STATUSES.SUSPENDED).toBe("suspended");
  });

  it("should define error messages", () => {
    expect(ERROR_MESSAGES.NETWORK_ERROR).toContain("Network error");
    expect(ERROR_MESSAGES.UNAUTHORIZED).toContain("not authorized");
    expect(ERROR_MESSAGES.SESSION_EXPIRED).toContain("session has expired");
  });

  it("should define success messages", () => {
    expect(SUCCESS_MESSAGES.LOGIN_SUCCESS).toContain("Login successful");
    expect(SUCCESS_MESSAGES.USER_CREATED).toContain("User created");
  });

  it("should define form limits", () => {
    expect(FORM_LIMITS.EMAIL_MAX_LENGTH).toBe(255);
    expect(FORM_LIMITS.PASSWORD_MIN_LENGTH).toBe(8);
    expect(FORM_LIMITS.NAME_MAX_LENGTH).toBe(100);
  });

  it("should define HTTP status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
  });

  it("should define storage keys", () => {
    expect(STORAGE_KEYS.THEME).toBe("admin_theme");
    expect(STORAGE_KEYS.SIDEBAR_STATE).toBe("admin_sidebar_state");
  });
});
