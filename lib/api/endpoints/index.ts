/**
 * API Endpoints Module Index
 * Central export point for all API endpoint modules
 * 
 * This file provides a single import point for all endpoint modules,
 * making it easy to access authentication, user management, and all
 * administrative endpoints throughout the application.
 * 
 * Validates: Requirements 6.2, 11.10, 17.6
 */

// Authentication
export { authApi } from './auth';

// User Management
export { usersApi } from './users';

// Session Management
export { sessionsApi } from './sessions';

// Xray Management
export { xrayApi } from './xray';

// Server Infrastructure
export { serversApi } from './servers';
export { nodesApi } from './nodes';

// Plan Management
export { plansApi } from './plans';

// Subscription Management
export { subscriptionsApi } from './subscriptions';

// Audit Logs
export { auditApi } from './audit';

// System Monitoring
export { systemApi } from './system';

// Dashboard
export { dashboardApi } from './dashboard';
