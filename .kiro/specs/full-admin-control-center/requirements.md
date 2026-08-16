# Requirements Document

## Introduction

This specification defines the expansion of the existing Admin Dashboard into a comprehensive Full Admin Control Center. The Admin UI currently provides authentication and basic user viewing (53/53 tasks complete). This expansion will expose all existing Go backend capabilities across Users, Xray, Infrastructure, Plans, Monitoring, and Audit Logs.

**Critical Constraint:** The Go backend is the source of truth and MUST NOT be modified. All business logic resides in the backend. The Admin UI's role is to provide a modern Next.js interface that proxies requests to existing backend APIs, displays data, and enables administrative control through the established architecture.

**Current Architecture:**
- Admin UI: Next.js 14+ with App Router, TypeScript, shadcn/ui, Server Components
- Backend: Go (running, fully functional, 78+ endpoints)
- Database: PostgreSQL (already configured)
- Flow: Admin UI → Next.js API proxy → Go backend → PostgreSQL

**Integration Status:** ~32% of backend capabilities currently exposed in UI (12/78 endpoints integrated).

## Glossary

- **Admin_UI**: The Next.js application providing the administrative interface
- **Go_Backend**: The existing Go HTTP server with business logic and database access
- **API_Proxy**: Next.js API routes that forward requests to Go_Backend endpoints
- **Control_Center**: The expanded Admin UI with all backend capabilities exposed
- **Module**: A logical grouping of related administrative functions (Users, Xray, Servers, etc.)
- **Xray_Instance**: A running Xray proxy server process managed by the backend
- **Inbound**: An Xray configuration for accepting incoming connections
- **Client**: An Xray configuration for individual user access
- **Session**: An authenticated user's active browser session with httpOnly cookie
- **Audit_Log**: A database record of administrative actions with timestamp and metadata
- **Plan**: A subscription tier definition with limits and pricing
- **Subscription**: A user's active plan assignment with expiry and status
- **Server**: A physical or virtual machine hosting infrastructure
- **Node**: A service or process running on a server
- **Reality_Config**: Xray Reality protocol configuration data

## Requirements

### Requirement 1: Complete User Management CRUD

**User Story:** As an administrator, I want full create, read, update, and delete capabilities for users, so that I can manage user accounts without using external tools.

#### Acceptance Criteria

1. WHEN the administrator submits a valid user creation form, THE Admin_UI SHALL send a POST request through the API_Proxy to the Go_Backend user creation endpoint
2. WHEN the Go_Backend returns success, THE Admin_UI SHALL display a success message and redirect to the users list
3. WHEN the administrator clicks "Edit" on a user detail page, THE Admin_UI SHALL display a form pre-populated with the user's current data
4. WHEN the administrator submits updated user data, THE Admin_UI SHALL send a PUT request through the API_Proxy to update the user
5. WHEN the administrator changes a user's status, THE Admin_UI SHALL send a PUT request to the existing /api/v1/admin/users/:id/status endpoint
6. WHEN the administrator changes a user's role, THE Admin_UI SHALL send a PUT request to the existing /api/v1/admin/users/:id/role endpoint
7. WHEN the administrator clicks "Delete" on a user, THE Admin_UI SHALL display a confirmation dialog with the user's email
8. WHEN the administrator confirms deletion, THE Admin_UI SHALL send a DELETE request through the API_Proxy to remove the user
9. THE Admin_UI SHALL display inline validation errors for required fields before submission
10. WHEN deleting or demoting the currently logged-in admin, THE Admin_UI SHALL prevent the action and display an error message

### Requirement 2: User Sessions and Activity Management

**User Story:** As an administrator, I want to view and manage user sessions, so that I can monitor active logins and revoke access when needed.

#### Acceptance Criteria

1. WHEN the administrator navigates to the sessions page, THE Admin_UI SHALL display a list of active user sessions from GET /api/v1/auth/sessions
2. FOR EACH session, THE Admin_UI SHALL display the username, login time, IP address, user agent, and last activity timestamp
3. WHEN the administrator clicks "Revoke" on a session, THE Admin_UI SHALL display a confirmation dialog
4. WHEN the administrator confirms revocation, THE Admin_UI SHALL send a DELETE request to /api/v1/auth/sessions/:id
5. WHEN the administrator clicks "Revoke All Sessions" for a user, THE Admin_UI SHALL send a POST request to /api/v1/auth/logout-all with the user ID
6. THE Admin_UI SHALL refresh the sessions list after any revocation action
7. THE Admin_UI SHALL highlight the administrator's own session with a distinct visual indicator
8. WHEN attempting to revoke their own session, THE Admin_UI SHALL display a warning message

### Requirement 3: User Subscriptions Display

**User Story:** As an administrator, I want to view user subscription details, so that I can understand each user's plan and expiration status.

#### Acceptance Criteria

1. WHEN the administrator views a user's detail page, THE Admin_UI SHALL display the user's subscription information from GET /api/v1/subscriptions/me
2. THE Admin_UI SHALL display the plan name, start date, expiry date, and status (active, expired, suspended)
3. WHEN a subscription is expired, THE Admin_UI SHALL display the expiry date in red with an "Expired" badge
4. WHEN a subscription is active, THE Admin_UI SHALL display the remaining days until expiry
5. THE Admin_UI SHALL display "No Subscription" when the user has no active plan
6. THE Admin_UI SHALL provide a link to the plans management page for reference

### Requirement 4: Xray Instance Management

**User Story:** As an administrator, I want to monitor and control Xray instances, so that I can manage the proxy infrastructure without SSH access.

#### Acceptance Criteria

1. WHEN the administrator navigates to /admin/xray/instances, THE Admin_UI SHALL display a list of instances from GET /api/v1/admin/xray/instances
2. FOR EACH instance, THE Admin_UI SHALL display the instance ID, status (running, stopped, error), uptime, and server location
3. WHEN the administrator clicks "Start" on a stopped instance, THE Admin_UI SHALL send a POST request to /api/v1/admin/xray/instances/:id/start
4. WHEN the administrator clicks "Stop" on a running instance, THE Admin_UI SHALL display a confirmation dialog and send POST to /api/v1/admin/xray/instances/:id/stop
5. WHEN the administrator clicks "Restart" on an instance, THE Admin_UI SHALL send a POST request to /api/v1/admin/xray/instances/:id/restart
6. WHEN the administrator clicks "Reload Config" on an instance, THE Admin_UI SHALL send a POST request to /api/v1/admin/xray/instances/:id/reload
7. WHEN the administrator views an instance detail page, THE Admin_UI SHALL display health status from GET /api/v1/admin/xray/instances/:id/health
8. WHEN the administrator views an instance detail page, THE Admin_UI SHALL display statistics from GET /api/v1/admin/xray/instances/:id/stats
9. THE Admin_UI SHALL update instance status indicators in real-time or with auto-refresh
10. WHEN an instance control action fails, THE Admin_UI SHALL display the error message from the Go_Backend

### Requirement 5: Xray Inbound Configuration Management

**User Story:** As an administrator, I want to create and manage Xray inbounds, so that I can configure how the proxy accepts connections.

#### Acceptance Criteria

1. WHEN the administrator navigates to /admin/xray/inbounds, THE Admin_UI SHALL display a list of inbounds from GET /api/v1/admin/xray/inbounds
2. FOR EACH inbound, THE Admin_UI SHALL display the protocol, port, tag, enabled status, and associated instance
3. WHEN the administrator clicks "Create Inbound", THE Admin_UI SHALL display a form with fields for protocol, port, tag, and settings
4. WHEN the administrator submits a valid inbound configuration, THE Admin_UI SHALL send a POST request to /api/v1/admin/xray/inbounds
5. WHEN the administrator clicks "Edit" on an inbound, THE Admin_UI SHALL display a form pre-populated with current configuration
6. WHEN the administrator submits updated inbound data, THE Admin_UI SHALL send a PUT request to /api/v1/admin/xray/inbounds/:id
7. WHEN the administrator toggles an inbound's enabled status, THE Admin_UI SHALL send a PUT request to /api/v1/admin/xray/inbounds/:id/enable or disable
8. WHEN the administrator clicks "Delete" on an inbound, THE Admin_UI SHALL display a confirmation dialog and send DELETE to /api/v1/admin/xray/inbounds/:id
9. THE Admin_UI SHALL validate required fields (protocol, port, tag) before submission
10. THE Admin_UI SHALL display protocol-specific configuration fields based on the selected protocol type

### Requirement 6: Xray Client Management

**User Story:** As an administrator, I want to manage Xray clients, so that I can control individual user access to the proxy infrastructure.

#### Acceptance Criteria

1. WHEN the administrator navigates to /admin/xray/clients, THE Admin_UI SHALL display a list of clients from GET /api/v1/admin/xray/clients
2. FOR EACH client, THE Admin_UI SHALL display the email, UUID, associated inbound, enabled status, and traffic statistics
3. WHEN the administrator clicks "Create Client", THE Admin_UI SHALL display a form with fields for email, inbound selection, and settings
4. WHEN the administrator submits a valid client configuration, THE Admin_UI SHALL send a POST request to /api/v1/admin/xray/clients
5. WHEN the administrator toggles a client's enabled status, THE Admin_UI SHALL send a PUT request to /api/v1/admin/xray/clients/:id/enable or disable
6. WHEN the administrator clicks "Regenerate UUID" on a client, THE Admin_UI SHALL display a confirmation dialog and send POST to /api/v1/admin/xray/clients/:id/regenerate-uuid
7. WHEN the administrator clicks "Reprovision" on a client, THE Admin_UI SHALL send a POST request to /api/v1/admin/xray/clients/:id/reprovision
8. WHEN the administrator clicks "Delete" on a client, THE Admin_UI SHALL display a confirmation dialog and send DELETE to /api/v1/admin/xray/clients/:id
9. THE Admin_UI SHALL display the client's generated configuration (connection URL or QR code) after creation
10. THE Admin_UI SHALL filter clients by inbound when viewing from an inbound detail page

### Requirement 7: Server and Node Infrastructure Management

**User Story:** As an administrator, I want to view and manage servers and nodes, so that I can monitor the underlying infrastructure.

#### Acceptance Criteria

1. WHEN the administrator navigates to /admin/servers, THE Admin_UI SHALL display a list of servers from GET /api/v1/servers
2. FOR EACH server, THE Admin_UI SHALL display the server name, country, city, IP address, status, and node count
3. WHEN the administrator clicks on a server, THE Admin_UI SHALL navigate to a detail page showing full server information
4. WHEN viewing a server detail page, THE Admin_UI SHALL display associated nodes from GET /api/v1/nodes filtered by server ID
5. FOR EACH node, THE Admin_UI SHALL display the node type, status, and health metrics
6. THE Admin_UI SHALL display a visual indicator (green, yellow, red) for server and node health status
7. THE Admin_UI SHALL update the dashboard server count stat card with real data from the servers endpoint
8. WHEN no servers exist, THE Admin_UI SHALL display an empty state with a message encouraging server setup
9. THE Admin_UI SHALL display server location on a world map visualization (optional enhancement)
10. THE Admin_UI SHALL provide filtering by country and status on the servers list page

### Requirement 8: Plan Management

**User Story:** As an administrator, I want to create and manage subscription plans, so that I can define service tiers and pricing.

#### Acceptance Criteria

1. WHEN the administrator navigates to /admin/plans, THE Admin_UI SHALL display a list of plans from GET /api/v1/plans
2. FOR EACH plan, THE Admin_UI SHALL display the plan name, price, duration, data limit, and active status
3. WHEN the administrator clicks "Create Plan", THE Admin_UI SHALL display a form with fields for name, price, duration, and limits
4. WHEN the administrator submits a valid plan configuration, THE Admin_UI SHALL send a POST request to /api/v1/plans
5. WHEN the administrator clicks "Edit" on a plan, THE Admin_UI SHALL display a form pre-populated with current plan data
6. WHEN the administrator submits updated plan data, THE Admin_UI SHALL send a PUT request to /api/v1/plans/:id
7. WHEN the administrator clicks "Delete" on a plan, THE Admin_UI SHALL display a confirmation dialog showing the number of active subscriptions
8. WHEN the administrator confirms plan deletion, THE Admin_UI SHALL send a DELETE request to /api/v1/plans/:id
9. THE Admin_UI SHALL validate required fields (name, price, duration) before submission
10. THE Admin_UI SHALL display the number of active subscriptions for each plan
11. THE Admin_UI SHALL update the dashboard plan count stat card with real data from the plans endpoint

### Requirement 9: Comprehensive Audit Log Viewer

**User Story:** As an administrator, I want to view and search audit logs, so that I can track administrative actions and investigate security events.

#### Acceptance Criteria

1. WHEN the administrator navigates to /admin/logs, THE Admin_UI SHALL display a paginated list of audit logs from GET /api/v1/admin/audit/logs
2. FOR EACH log entry, THE Admin_UI SHALL display the timestamp, actor (admin username), action, entity type, entity ID, IP address, and status
3. WHEN the administrator enters text in the search field, THE Admin_UI SHALL filter logs by action, entity type, or actor username
4. WHEN the administrator selects a date range filter, THE Admin_UI SHALL request logs within the specified range
5. WHEN the administrator selects an action type filter, THE Admin_UI SHALL display only logs matching that action
6. WHEN the administrator clicks on a log entry, THE Admin_UI SHALL display a detail view with full metadata (request body, response, user agent)
7. THE Admin_UI SHALL display pagination controls with page size options (10, 25, 50, 100)
8. THE Admin_UI SHALL provide an "Export" button to download logs as CSV or JSON
9. THE Admin_UI SHALL display audit statistics from GET /api/v1/admin/audit/stats showing action counts by type
10. THE Admin_UI SHALL update the dashboard activity feed with the most recent 10 logs

### Requirement 10: Enhanced System Monitoring Dashboard

**User Story:** As an administrator, I want comprehensive system health monitoring, so that I can quickly identify issues and monitor performance.

#### Acceptance Criteria

1. WHEN the administrator views the dashboard, THE Admin_UI SHALL display system health status from GET /api/v1/admin/system/health
2. THE Admin_UI SHALL display database status (connected, response time) from GET /api/v1/admin/system/database
3. THE Admin_UI SHALL display Xray system status (instances running, total clients) from GET /api/v1/admin/system/xray
4. THE Admin_UI SHALL display API version information from GET /api/v1/admin/system/version
5. THE Admin_UI SHALL display stat cards for total users, active users, total servers, total plans, active Xray instances, and recent audit actions
6. WHEN any health check fails, THE Admin_UI SHALL display a red status indicator and error message
7. THE Admin_UI SHALL auto-refresh health status every 30 seconds
8. WHEN the administrator clicks on a stat card, THE Admin_UI SHALL navigate to the relevant detail page
9. THE Admin_UI SHALL display real data from backend endpoints instead of placeholder "—" values
10. THE Admin_UI SHALL display a visual timeline or chart showing system metrics trends (optional enhancement)

### Requirement 11: API Proxy Layer Expansion

**User Story:** As a developer, I want Next.js API routes for all backend endpoints, so that the Admin UI can communicate with the Go backend without CORS issues.

#### Acceptance Criteria

1. THE Admin_UI SHALL create proxy routes under /api/admin/xray/instances for all Xray instance endpoints
2. THE Admin_UI SHALL create proxy routes under /api/admin/xray/inbounds for all inbound management endpoints
3. THE Admin_UI SHALL create proxy routes under /api/admin/xray/clients for all client management endpoints
4. THE Admin_UI SHALL create proxy routes under /api/servers and /api/nodes for infrastructure endpoints
5. THE Admin_UI SHALL create proxy routes under /api/plans for plan management endpoints
6. THE Admin_UI SHALL create proxy routes under /api/admin/audit for audit log endpoints
7. THE Admin_UI SHALL create proxy routes under /api/admin/system for system monitoring endpoints
8. THE Admin_UI SHALL create proxy routes under /api/auth/sessions for session management endpoints
9. THE Admin_UI SHALL create proxy routes under /api/subscriptions for subscription viewing endpoints
10. THE Admin_UI SHALL expand the existing API client library with typed methods for all new endpoints
11. ALL proxy routes SHALL forward requests to the Go_Backend using the NEXT_PUBLIC_API_BASE_URL environment variable
12. ALL proxy routes SHALL include credentials (session cookies) in forwarded requests
13. ALL proxy routes SHALL return errors in a consistent format with status codes and messages

### Requirement 12: Navigation and Module Organization

**User Story:** As an administrator, I want organized navigation to all features, so that I can efficiently access different administrative functions.

#### Acceptance Criteria

1. THE Admin_UI SHALL enable the "Servers" navigation item and link to /admin/servers
2. THE Admin_UI SHALL enable the "Plans" navigation item and link to /admin/plans
3. THE Admin_UI SHALL enable the "Logs" navigation item and link to /admin/logs
4. THE Admin_UI SHALL add a "Xray" navigation section with subitems for Instances, Inbounds, and Clients
5. THE Admin_UI SHALL add a "Sessions" navigation item linking to /admin/sessions
6. THE Admin_UI SHALL add a "Monitoring" navigation item linking to /admin/monitoring (detailed system view)
7. THE Admin_UI SHALL highlight the active navigation item based on the current route
8. THE Admin_UI SHALL display module icons from lucide-react next to each navigation item
9. THE Admin_UI SHALL maintain the collapsible sidebar behavior on mobile devices
10. THE Admin_UI SHALL display the number of unread audit logs as a badge on the "Logs" navigation item (optional enhancement)

### Requirement 13: Form Validation and Error Handling Consistency

**User Story:** As an administrator, I want consistent validation and error handling, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. THE Admin_UI SHALL use Zod schemas for all form validation across all modules
2. THE Admin_UI SHALL display inline field-level error messages for validation failures
3. WHEN the Go_Backend returns a 400 error with validation details, THE Admin_UI SHALL map errors to specific form fields
4. WHEN the Go_Backend returns a 401 error, THE Admin_UI SHALL redirect to the login page
5. WHEN the Go_Backend returns a 403 error, THE Admin_UI SHALL display "Access Denied" with the reason
6. WHEN the Go_Backend returns a 404 error, THE Admin_UI SHALL display "Resource Not Found" with context
7. WHEN the Go_Backend returns a 500 error, THE Admin_UI SHALL display "Server Error" and log details to console
8. WHEN a network error occurs, THE Admin_UI SHALL display "Connection Failed - Check if backend is running"
9. THE Admin_UI SHALL display loading spinners during async operations for all forms
10. THE Admin_UI SHALL disable submit buttons during form submission to prevent double submission
11. THE Admin_UI SHALL display success toast notifications for all successful create, update, delete operations

### Requirement 14: Loading States and Empty States

**User Story:** As an administrator, I want clear feedback during loading and when no data exists, so that I understand the application state.

#### Acceptance Criteria

1. WHEN fetching data for any list page, THE Admin_UI SHALL display skeleton loading screens
2. WHEN a list page has no data, THE Admin_UI SHALL display an empty state with relevant messaging and call-to-action
3. THE Admin_UI SHALL display loading indicators on buttons during async operations
4. WHEN navigating between pages, THE Admin_UI SHALL use Next.js loading.tsx for route-level loading states
5. THE Admin_UI SHALL display error boundaries for component-level errors with retry buttons
6. WHEN data fetch fails, THE Admin_UI SHALL display an error state with a "Retry" button
7. THE Admin_UI SHALL display "No results found" when search or filter operations return empty results
8. THE Admin_UI SHALL display progress indicators for long-running operations (e.g., Xray instance restart)

### Requirement 15: Responsive Design and Accessibility

**User Story:** As an administrator, I want the Control Center to work on all devices and be accessible, so that I can manage the system from anywhere.

#### Acceptance Criteria

1. THE Admin_UI SHALL display properly on mobile devices (320px width minimum)
2. THE Admin_UI SHALL display properly on tablet devices (768px - 1024px)
3. THE Admin_UI SHALL display properly on desktop devices (1024px and above)
4. THE Admin_UI SHALL use TailwindCSS responsive breakpoints for layout adjustments
5. THE Admin_UI SHALL hide the sidebar on mobile and show a hamburger menu
6. THE Admin_UI SHALL make data tables horizontally scrollable on mobile devices
7. THE Admin_UI SHALL ensure all interactive elements have sufficient touch target sizes (44px minimum)
8. THE Admin_UI SHALL support keyboard navigation for all interactive elements
9. THE Admin_UI SHALL provide proper ARIA labels for screen readers
10. THE Admin_UI SHALL maintain color contrast ratios meeting WCAG 2.1 Level AA standards

### Requirement 16: Confirmation Dialogs for Destructive Actions

**User Story:** As an administrator, I want confirmation prompts before destructive actions, so that I don't accidentally delete or disable critical resources.

#### Acceptance Criteria

1. WHEN the administrator clicks "Delete" on any resource, THE Admin_UI SHALL display a confirmation dialog with the resource identifier
2. THE Admin_UI SHALL require typing a confirmation phrase (e.g., resource name) for critical deletions (users, plans with subscriptions)
3. WHEN the administrator attempts to stop a running Xray instance, THE Admin_UI SHALL display a warning about service interruption
4. WHEN the administrator attempts to delete an inbound with active clients, THE Admin_UI SHALL display the number of affected clients
5. WHEN the administrator attempts to delete a plan with active subscriptions, THE Admin_UI SHALL display the number of affected users
6. THE Admin_UI SHALL provide "Cancel" and "Confirm" buttons with distinct colors (gray and red)
7. THE Admin_UI SHALL focus the "Cancel" button by default to prevent accidental confirmation
8. WHEN the administrator confirms a destructive action, THE Admin_UI SHALL disable the confirm button and show a loading indicator
9. THE Admin_UI SHALL close the confirmation dialog after successful action completion
10. THE Admin_UI SHALL keep the confirmation dialog open and display errors if the action fails

### Requirement 17: Code Architecture and Maintainability

**User Story:** As a developer, I want well-organized code that follows established patterns, so that I can easily maintain and extend the Control Center.

#### Acceptance Criteria

1. THE Admin_UI SHALL organize each module in self-contained directories under app/admin/
2. THE Admin_UI SHALL create reusable components in components/admin/ organized by module
3. THE Admin_UI SHALL define TypeScript types for all API responses in lib/types/
4. THE Admin_UI SHALL define Zod validation schemas for all forms in lib/validations/
5. THE Admin_UI SHALL use Server Components for data fetching and Client Components for interactivity
6. THE Admin_UI SHALL follow the existing ApiClient pattern for all new endpoint integrations
7. THE Admin_UI SHALL create error.tsx and loading.tsx files for each route segment
8. THE Admin_UI SHALL use consistent naming conventions matching the existing codebase
9. THE Admin_UI SHALL document complex business logic with inline comments
10. THE Admin_UI SHALL maintain the existing project structure and conventions
11. THE Admin_UI SHALL NOT modify any Go backend code
12. THE Admin_UI SHALL NOT create direct database connections from Next.js

### Requirement 18: Testing and Verification

**User Story:** As a developer, I want to verify that all features work correctly, so that the Control Center is production-ready.

#### Acceptance Criteria

1. THE Admin_UI SHALL compile without TypeScript errors
2. THE Admin_UI SHALL successfully proxy requests to all backend endpoints
3. THE Admin_UI SHALL display real data from the Go_Backend in all list views
4. THE Admin_UI SHALL successfully create resources through backend POST endpoints
5. THE Admin_UI SHALL successfully update resources through backend PUT endpoints
6. THE Admin_UI SHALL successfully delete resources through backend DELETE endpoints
7. THE Admin_UI SHALL handle backend error responses gracefully with user-friendly messages
8. THE Admin_UI SHALL maintain authentication state across all new pages
9. THE Admin_UI SHALL log out users when session expires or becomes invalid
10. THE Admin_UI SHALL preserve existing authentication and user management functionality without regression

