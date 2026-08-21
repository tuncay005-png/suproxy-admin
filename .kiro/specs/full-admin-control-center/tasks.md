# Implementation Plan: Full Admin Control Center

## Overview

This implementation plan converts the Full Admin Control Center design into executable TypeScript/Next.js development tasks. The plan follows the existing Admin UI architecture patterns, expands the API proxy layer with 47 new endpoints, and implements 7 major administrative modules to expose all Go backend capabilities.

**Implementation Language:** TypeScript with Next.js 14+ App Router

**Key Architectural Principles:**
- Server Components for data fetching, Client Components for interactivity
- All backend communication through Next.js API proxy routes
- Type safety with strict TypeScript and Zod validation
- Consistent error handling and user-friendly messages
- Responsive design with TailwindCSS breakpoints
- Accessibility compliance (WCAG 2.1 Level AA)

## Tasks

- [x] 1. Foundation: Type Definitions and API Client Expansion
  - Create comprehensive TypeScript type definitions for all modules
  - Expand API client library with typed methods for 47 new endpoints
  - _Requirements: 11.10, 17.3, 17.4_

  - [x] 1.1 Create core type definitions
    - Create `types/api.ts` with ApiResponse, ApiError, PaginationParams, PaginatedResponse interfaces
    - Create `types/session.ts` with UserSession and SessionsListResponse interfaces
    - Create `types/xray.ts` with XrayInstance, XrayInstanceHealth, XrayInstanceStats, XrayInbound, XrayClient, XrayClientConfig, CreateInboundInput, CreateClientInput interfaces
    - Create `types/server.ts` with Server, Node, ServersListResponse, NodesListResponse interfaces
    - Create `types/plan.ts` with Plan, CreatePlanInput, PlansListResponse interfaces
    - Create `types/subscription.ts` with Subscription interface
    - Create `types/audit.ts` with AuditLog, AuditLogsListResponse, AuditLogsFilter, AuditStats interfaces
    - Create `types/system.ts` with SystemHealth, DatabaseStatus, XraySystemStatus, VersionInfo interfaces
    - _Requirements: 11.10, 17.3_

  - [x] 1.2 Create API client endpoint methods
    - Update `lib/api/endpoints/users.ts` to add create, update, delete methods
    - Create `lib/api/endpoints/sessions.ts` with list, revoke, revokeAll methods
    - Create `lib/api/endpoints/xray.ts` with instances, inbounds, clients nested objects and all methods
    - Update `lib/api/endpoints/servers.ts` to add getById method
    - Create `lib/api/endpoints/nodes.ts` with list and listByServer methods
    - Update `lib/api/endpoints/plans.ts` to add getById, create, update, delete methods
    - Create `lib/api/endpoints/subscriptions.ts` with getForUser method
    - Update `lib/api/endpoints/audit.ts` to add getLogs with filtering and getStats methods
    - Create `lib/api/endpoints/system.ts` with getHealth, getStats, getDatabaseStatus, getXraySystemStatus, getVersion methods
    - _Requirements: 11.10, 17.6_

- [x] 2. API Proxy Layer: Create 47 New Endpoint Routes
  - Implement Next.js API routes that proxy requests to Go backend
  - Follow existing proxy pattern with session token authentication
  - Handle errors consistently with user-friendly messages
  - _Requirements: 11.1-11.13, 13.4-13.8_

  - [x] 2.1 Create User Management proxy routes
    - Update `app/api/admin/users/route.ts` to add POST handler for user creation
    - Update `app/api/admin/users/[id]/route.ts` to add PUT and DELETE handlers
    - Use standard proxy template with session token forwarding
    - Return user-friendly error messages for 400, 401, 403, 404, 500 status codes
    - _Requirements: 1.1, 1.2, 1.8, 11.1_

  - [x] 2.2 Create Session Management proxy routes
    - Create `app/api/auth/sessions/route.ts` with GET handler (list sessions)
    - Create `app/api/auth/sessions/[id]/route.ts` with DELETE handler (revoke session)
    - Add POST handler to sessions route for logout-all functionality
    - Forward requests to `/api/v1/auth/sessions` backend endpoints
    - _Requirements: 2.1, 2.4, 2.5, 11.8_

  - [x] 2.3 Create Xray Instance Management proxy routes
    - Create `app/api/admin/xray/instances/route.ts` with GET handler
    - Create `app/api/admin/xray/instances/[id]/route.ts` with GET handler
    - Create `app/api/admin/xray/instances/[id]/start/route.ts` with POST handler
    - Create `app/api/admin/xray/instances/[id]/stop/route.ts` with POST handler
    - Create `app/api/admin/xray/instances/[id]/restart/route.ts` with POST handler
    - Create `app/api/admin/xray/instances/[id]/reload/route.ts` with POST handler
    - Create `app/api/admin/xray/instances/[id]/health/route.ts` with GET handler
    - Create `app/api/admin/xray/instances/[id]/stats/route.ts` with GET handler
    - All routes forward to `/api/v1/admin/xray/instances/*` backend endpoints
    - _Requirements: 4.1, 4.3-4.8, 11.1_

  - [x] 2.4 Create Xray Inbound Management proxy routes
    - Create `app/api/admin/xray/inbounds/route.ts` with GET and POST handlers
    - Create `app/api/admin/xray/inbounds/[id]/route.ts` with GET, PUT, DELETE handlers
    - Create `app/api/admin/xray/inbounds/[id]/enable/route.ts` with PUT handler
    - Create `app/api/admin/xray/inbounds/[id]/disable/route.ts` with PUT handler
    - Forward to `/api/v1/admin/xray/inbounds/*` backend endpoints
    - _Requirements: 5.1, 5.4, 5.6-5.8, 11.2_

  - [x] 2.5 Create Xray Client Management proxy routes
    - Create `app/api/admin/xray/clients/route.ts` with GET and POST handlers
    - Create `app/api/admin/xray/clients/[id]/route.ts` with GET and DELETE handlers
    - Create `app/api/admin/xray/clients/[id]/enable/route.ts` with PUT handler
    - Create `app/api/admin/xray/clients/[id]/disable/route.ts` with PUT handler
    - Create `app/api/admin/xray/clients/[id]/regenerate-uuid/route.ts` with POST handler
    - Create `app/api/admin/xray/clients/[id]/reprovision/route.ts` with POST handler
    - Forward to `/api/v1/admin/xray/clients/*` backend endpoints
    - _Requirements: 6.1, 6.4-6.8, 11.3_

  - [x] 2.6 Create Server and Node Infrastructure proxy routes
    - Verify `app/api/servers/route.ts` exists with GET handler (should be existing)
    - Create `app/api/servers/[id]/route.ts` with GET handler for single server
    - Create `app/api/nodes/route.ts` with GET handler supporting server_id query parameter
    - Forward to `/api/v1/servers` and `/api/v1/nodes` backend endpoints
    - _Requirements: 7.1, 7.4, 11.4_

  - [x] 2.7 Create Plan Management proxy routes
    - Forward to `/api/v1/servers` and `/api/v1/nodes` backend endpoints
    - _Requirements: 7.1, 7.4, 11.4_

  - [x] 2.7 Create Plan Management proxy routes
    - Update `app/api/plans/route.ts` to add POST handler for plan creation
    - Create `app/api/plans/[id]/route.ts` with GET, PUT, DELETE handlers
    - Forward to `/api/v1/plans/*` backend endpoints
    - Return active subscriptions count in delete error if plan has subscriptions
    - _Requirements: 8.1, 8.4, 8.6-8.8, 11.5_

  - [x] 2.8 Create Subscription viewing proxy routes
    - Create `app/api/subscriptions/user/[userId]/route.ts` with GET handler
    - Forward to `/api/v1/subscriptions/user/:userId` backend endpoint
    - Return empty object or null when user has no subscription
    - _Requirements: 3.1, 11.9_

  - [x] 2.9 Create Audit Logs proxy routes
    - Verify `app/api/admin/audit/logs/route.ts` exists with GET handler (should be existing)
    - Update route to support query parameters: page, limit, action, entity_type, actor_id, start_date, end_date
    - Create `app/api/admin/audit/stats/route.ts` with GET handler
    - Forward to `/api/v1/admin/audit/*` backend endpoints
    - _Requirements: 9.1-9.5, 11.6_

  - [x] 2.10 Create System Monitoring proxy routes
    - Verify `app/api/admin/system/health/route.ts` exists (should be existing)
    - Verify `app/api/admin/system/stats/route.ts` exists (should be existing)
    - Create `app/api/admin/system/database/route.ts` with GET handler
    - Create `app/api/admin/system/xray/route.ts` with GET handler
    - Create `app/api/admin/system/version/route.ts` with GET handler
    - Forward to `/api/v1/admin/system/*` backend endpoints
    - _Requirements: 10.1-10.4, 11.7_

- [x] 3. Checkpoint - Verify API Proxy Layer
  - Ensure all TypeScript compiles without errors
  - Test each proxy route with curl or Postman to verify backend connectivity
  - Verify session token authentication works for all routes
  - Ensure all error responses return consistent format
  - Ask the user if questions arise

- [x] 4. Form Validation: Zod Schemas
  - Create Zod validation schemas for all forms
  - Ensure client-side validation before API submission
  - _Requirements: 13.1-13.2, 17.4_

  - [x] 4.1 Create User Management validation schemas
    - Create `lib/validations/user.ts` with createUserSchema for email, password, first_name, last_name, phone, role
    - Create updateUserSchema for optional first_name, last_name, phone, email
    - Email must be valid format, password minimum 8 chars with uppercase, lowercase, number
    - Export TypeScript types using z.infer
    - _Requirements: 1.9, 13.1_

  - [x] 4.2 Create Xray validation schemas
    - Create `lib/validations/xray.ts` with createInboundSchema for instance_id, protocol, port, tag, settings
    - Port must be integer between 1-65535
    - Tag must be alphanumeric with hyphens/underscores only
    - Create createClientSchema for email, inbound_id, settings
    - Export TypeScript types using z.infer
    - _Requirements: 5.9, 6.1, 13.1_

  - [x] 4.3 Create Plan validation schemas
    - Create `lib/validations/plan.ts` with createPlanSchema for name, description, price, currency, duration_days, data_limit_gb, active
    - Price must be non-negative number
    - Currency must be 3-letter uppercase code (e.g., USD, EUR)
    - Duration days must be positive integer
    - Data limit must be non-negative number
    - Export TypeScript types using z.infer
    - _Requirements: 8.9, 13.1_

- [x] 5. User Management Module Expansion
  - Complete user CRUD operations with create, edit, delete functionality
  - Add user subscriptions display to detail pages
  - _Requirements: 1.1-1.10, 3.1-3.6_

  - [x] 5.1 Create User Creation page and form
    - Create `app/admin/users/new/page.tsx` as Server Component with basic layout
    - Create `components/admin/users/user-creation-form.tsx` as Client Component
    - Use react-hook-form with zodResolver and createUserSchema
    - Include fields: email, password, first_name, last_name, phone (optional), role selector
    - Call usersApi.create on submit with useTransition for pending state
    - Show success toast and redirect to /admin/users on success
    - Display inline field errors and general error alert
    - Include Cancel and Create buttons
    - _Requirements: 1.1-1.3, 1.9, 13.1-13.3, 13.9-13.11_

  - [x] 5.2 Implement User Edit functionality
    - Update `app/admin/users/[id]/page.tsx` to fetch user by ID
    - Create `components/admin/users/user-edit-form.tsx` as Client Component
    - Pre-populate form with current user data using defaultValues
    - Use updateUserSchema for validation (password not required for edit)
    - Call usersApi.update on submit
    - Show success toast and refresh data on success
    - Display inline field errors
    - _Requirements: 1.3-1.4, 13.1-13.3_

  - [x] 5.3 Implement User Deletion with confirmation
    - Create `components/admin/users/delete-user-dialog.tsx` as Client Component using AlertDialog
    - Display user's email in confirmation message
    - Check if user is current admin (prevent self-deletion)
    - Show "You cannot delete your own account" error if attempting self-deletion
    - Call usersApi.delete on confirmation with useTransition
    - Show success toast and redirect to users list on success
    - Display error message if deletion fails
    - _Requirements: 1.7-1.8, 1.10, 16.1-16.3, 16.6-16.9_

  - [x] 5.4 Add User Status and Role management
    - Create `components/admin/users/user-status-badge.tsx` for visual status indicators (active/inactive/suspended)
    - Create `components/admin/users/user-role-badge.tsx` for role indicators (user/admin)
    - Add status change dropdown in user detail page calling usersApi.updateStatus
    - Add role change dropdown in user detail page calling usersApi.updateRole
    - Prevent demoting self from admin role with error message
    - Show success toast after status/role change
    - _Requirements: 1.5-1.6, 1.10_

  - [x] 5.5 Add User Subscriptions display
    - Create `components/admin/users/user-subscription-card.tsx` as Client Component
    - Fetch subscription data using subscriptionsApi.getForUser in user detail page
    - Display plan name, start date, expiry date, status (active/expired/suspended/cancelled)
    - Show remaining days until expiry for active subscriptions
    - Display expiry date in red with "Expired" badge for expired subscriptions
    - Show "No Subscription" message when user has no subscription
    - Add link to plans management page
    - _Requirements: 3.1-3.6_

- [x] 6. Session Management Module
  - Create sessions list page with revoke capabilities
  - Implement session security features
  - _Requirements: 2.1-2.8_

  - [x] 6.1 Create Sessions list page and table
    - Create `app/admin/sessions/page.tsx` as Server Component fetching from sessionsApi.list
    - Create `components/admin/sessions/sessions-table.tsx` as Client Component
    - Display columns: username, email, IP address, user agent, created_at, last_activity_at, expires_at, actions
    - Highlight current user's session with distinct background color or border
    - Create `components/admin/sessions/session-device-info.tsx` to parse and display user agent
    - _Requirements: 2.1-2.2, 2.7_

  - [x] 6.2 Implement Session revocation
    - Create `components/admin/sessions/revoke-session-button.tsx` with confirmation dialog
    - Display warning when attempting to revoke own session
    - Call sessionsApi.revoke on confirmation
    - Show success toast and refresh sessions list
    - Display error toast if revocation fails
    - _Requirements: 2.3-2.4, 2.8, 16.1-16.3_

  - [x] 6.3 Implement Revoke All Sessions for user
    - Create `components/admin/sessions/revoke-all-sessions-dialog.tsx` with confirmation
    - Display count of sessions to be revoked in confirmation message
    - Call sessionsApi.revokeAll with user_id on confirmation
    - Show success toast and refresh sessions list
    - Add this as action button in user detail page
    - _Requirements: 2.5-2.6_

  - [x] 6.4 Add Sessions to navigation
    - Update `lib/utils/navigation.ts` to add Sessions item with UserCheck icon
    - Link to /admin/sessions
    - Position after Users in navigation order
    - _Requirements: 12.5_

- [x] 7. Xray Instance Management Module
  - Create instance list, detail pages with control operations
  - Implement health monitoring and statistics display
  - _Requirements: 4.1-4.10_

  - [x] 7.1 Create Xray Instances list page
    - Create `app/admin/xray/instances/page.tsx` as Server Component fetching from xrayApi.instances.list
    - Create `components/admin/xray/instances/instances-table.tsx` as Client Component
    - Display columns: name, status, server_name, uptime, actions
    - Create `components/admin/xray/instances/instance-status-badge.tsx` for status visualization (running=green, stopped=gray, error=red, starting/stopping=yellow)
    - Format uptime as human-readable duration (e.g., "2d 5h 30m")
    - _Requirements: 4.1-4.2_

  - [x] 7.2 Implement Instance control operations
    - Create `components/admin/xray/instances/instance-control-buttons.tsx` as Client Component
    - Add Start button (only visible when status is "stopped") calling xrayApi.instances.start
    - Add Stop button (only visible when status is "running") with confirmation dialog calling xrayApi.instances.stop
    - Add Restart button (only visible when status is "running") calling xrayApi.instances.restart
    - Add Reload Config button (only visible when status is "running") calling xrayApi.instances.reload
    - Show confirmation dialog for Stop operation warning about service interruption
    - Display loading state on buttons during operation
    - Show success/error toast after each operation
    - Refresh instance data after operation completes
    - _Requirements: 4.3-4.6, 4.10, 16.3_

  - [x] 7.3 Create Instance detail page with health and stats
    - Create `app/admin/xray/instances/[id]/page.tsx` as Server Component
    - Fetch instance data, health status, and stats in parallel using Promise.all
    - Create `components/admin/xray/instances/instance-health-card.tsx` displaying status, uptime, last_check, error_message
    - Create `components/admin/xray/instances/instance-stats-card.tsx` displaying connections_active, connections_total, traffic_up, traffic_down, clients_active, clients_total
    - Use health indicator colors (healthy=green, unhealthy=red, unknown=gray)
    - Format traffic numbers with byte units (KB, MB, GB)
    - Add auto-refresh toggle to refresh data every 30 seconds
    - _Requirements: 4.7-4.9_

  - [x] 7.4 Create Xray navigation structure
    - Update `lib/utils/navigation.ts` to add Xray section with Network icon
    - Add child items: Instances (Radio icon), Inbounds (Activity icon), Clients (Users icon)
    - Make Xray expandable/collapsible submenu
    - _Requirements: 12.4_

- [ ] 8. Checkpoint - Test Xray Instances Module
  - Verify instances list loads with real data
  - Test start, stop, restart, reload operations
  - Verify health and stats display correctly
  - Test auto-refresh functionality
  - Ensure all error handling works
  - Ask the user if questions arise

- [x] 9. Xray Inbound Configuration Module
  - Create inbound list, create, edit pages
  - Implement protocol-specific configuration
  - _Requirements: 5.1-5.10_

  - [x] 9.1 Create Xray Inbounds list page
    - Create `app/admin/xray/inbounds/page.tsx` as Server Component fetching from xrayApi.inbounds.list
    - Create `components/admin/xray/inbounds/inbounds-table.tsx` as Client Component
    - Display columns: protocol, port, tag, enabled, instance_id, actions
    - Add enabled/disabled toggle switch calling xrayApi.inbounds.enable or disable
    - Show success toast after toggle action
    - _Requirements: 5.1-5.2, 5.7_

  - [x] 9.2 Create Inbound creation page and form
    - Create `app/admin/xray/inbounds/new/page.tsx` as Server Component
    - Create `components/admin/xray/inbounds/inbound-form.tsx` as Client Component
    - Use react-hook-form with zodResolver and createInboundSchema
    - Create `components/admin/xray/inbounds/inbound-protocol-selector.tsx` for protocol dropdown (vless, vmess, trojan, shadowsocks)
    - Create `components/admin/xray/inbounds/inbound-settings-fields.tsx` for protocol-specific dynamic fields
    - Add instance selector dropdown (fetch from xrayApi.instances.list)
    - Call xrayApi.inbounds.create on submit
    - Show success toast and redirect to inbounds list
    - Display validation errors inline
    - _Requirements: 5.3-5.4, 5.9-5.10, 13.1-13.3_

  - [x] 9.3 Create Inbound edit page
    - Create `app/admin/xray/inbounds/[id]/page.tsx` as Server Component fetching inbound by ID
    - Reuse inbound-form.tsx component with pre-populated data
    - Call xrayApi.inbounds.update on submit
    - Show success toast and redirect to inbounds list
    - _Requirements: 5.5-5.6_

  - [x] 9.4 Implement Inbound deletion
    - Create `components/admin/xray/inbounds/delete-inbound-dialog.tsx` with confirmation
    - Display warning if inbound has active clients (fetch client count)
    - Show number of affected clients in confirmation message
    - Call xrayApi.inbounds.delete on confirmation
    - Show success toast and refresh list
    - _Requirements: 5.8, 16.1-16.2, 16.4_

- [x] 10. Xray Client Management Module
  - Create client list, create pages with configuration display
  - Implement client operations (enable/disable, regenerate UUID, reprovision)
  - _Requirements: 6.1-6.10_

  - [x] 10.1 Create Xray Clients list page
    - Create `app/admin/xray/clients/page.tsx` as Server Component fetching from xrayApi.clients.list
    - Create `components/admin/xray/clients/clients-table.tsx` as Client Component
    - Display columns: email, UUID, inbound_tag, enabled, traffic_up, traffic_down, actions
    - Format traffic numbers with byte units (KB, MB, GB)
    - Add enabled/disabled toggle switch calling xrayApi.clients.enable or disable
    - Add filter dropdown to filter by inbound_id
    - _Requirements: 6.1-6.2, 6.5, 6.10_

  - [x] 10.2 Create Client creation page and form
    - Create `app/admin/xray/clients/new/page.tsx` as Server Component
    - Create `components/admin/xray/clients/client-form.tsx` as Client Component
    - Use react-hook-form with zodResolver and createClientSchema
    - Include email field and inbound selector dropdown
    - Call xrayApi.clients.create on submit
    - Display generated client configuration after successful creation
    - _Requirements: 6.3-6.4, 6.9, 13.1-13.3_

  - [x] 10.3 Create Client configuration display
    - Create `components/admin/xray/clients/client-config-display.tsx` as Client Component
    - Display connection URL with copy-to-clipboard button
    - Display QR code using qr_code_data from backend
    - Use QR code library (e.g., qrcode.react) to render QR code
    - Add "Copy URL" button with success feedback
    - Show this component after client creation and in client detail view
    - _Requirements: 6.9_

  - [x] 10.4 Implement Client operations
    - Create `components/admin/xray/clients/regenerate-uuid-dialog.tsx` with confirmation
    - Display warning that regenerating UUID will invalidate existing client configurations
    - Call xrayApi.clients.regenerateUuid on confirmation
    - Create `components/admin/xray/clients/reprovision-client-dialog.tsx` with confirmation
    - Call xrayApi.clients.reprovision on confirmation
    - Show success toast after each operation
    - Refresh client data after operation
    - _Requirements: 6.6-6.7, 16.1-16.2_

  - [x] 10.5 Implement Client deletion
    - Create delete confirmation dialog showing client email
    - Call xrayApi.clients.delete on confirmation
    - Show success toast and refresh clients list
    - _Requirements: 6.8, 16.1-16.2_

- [x] 11. Server and Node Infrastructure Module
  - Create server list and detail pages
  - Display node information and health metrics
  - _Requirements: 7.1-7.10_

  - [x] 11.1 Create Servers list page
    - Create `app/admin/servers/page.tsx` as Server Component fetching from serversApi.list
    - Create `components/admin/servers/servers-table.tsx` as Client Component
    - Display columns: name, country, city, ip_address, status, node_count, actions
    - Create `components/admin/servers/server-status-badge.tsx` for status visualization (online=green, offline=red, maintenance=yellow)
    - Create `components/admin/servers/server-location-badge.tsx` showing country flag and city
    - Create `components/admin/servers/server-filters.tsx` for filtering by country and status
    - Display empty state when no servers exist with message "No servers configured"
    - _Requirements: 7.1-7.2, 7.6, 7.8, 7.10_

  - [x] 11.2 Create Server detail page with nodes
    - Create `app/admin/servers/[id]/page.tsx` as Server Component
    - Fetch server data and associated nodes in parallel using Promise.all
    - Display server details (name, location, IP, status)
    - Create `components/admin/servers/nodes-list.tsx` displaying node type, name, status, health_metrics
    - Create `components/admin/servers/node-health-indicator.tsx` showing health status with colored dot
    - Display CPU usage, memory usage, disk usage metrics if available
    - Format metrics as percentages
    - _Requirements: 7.3-7.5_

  - [x] 11.3 Enable Servers navigation and update dashboard
    - Update `lib/utils/navigation.ts` to enable Servers item (should already exist, verify enabled)
    - Update dashboard stat card to fetch real server count from serversApi.list
    - Update stat card to be clickable linking to /admin/servers
    - _Requirements: 7.7, 12.1_

- [x] 12. Plan Management Module
  - Create plan list, create, edit, delete pages
  - Implement plan subscription awareness
  - _Requirements: 8.1-8.11_

  - [x] 12.1 Create Plans list page
    - Create `app/admin/plans/page.tsx` as Server Component fetching from plansApi.list
    - Create `components/admin/plans/plans-table.tsx` as Client Component
    - Display columns: name, price, currency, duration_days, data_limit_gb, active, active_subscriptions, actions
    - Create `components/admin/plans/plan-status-badge.tsx` for active/inactive status
    - Format price with currency symbol
    - Format duration as human-readable (e.g., "30 days", "1 year")
    - Format data limit in GB
    - Display active_subscriptions count
    - _Requirements: 8.1-8.2, 8.10_

  - [x] 12.2 Create Plan creation page and form
    - Create `app/admin/plans/new/page.tsx` as Server Component
    - Create `components/admin/plans/plan-creation-form.tsx` as Client Component
    - Use react-hook-form with zodResolver and createPlanSchema
    - Include fields: name, description (textarea), price (number), currency (3-char input), duration_days (number), data_limit_gb (number), active (checkbox)
    - Call plansApi.create on submit
    - Show success toast and redirect to plans list
    - Display validation errors inline
    - _Requirements: 8.3-8.4, 8.9, 13.1-13.3_

  - [x] 12.3 Create Plan edit page
    - Create `app/admin/plans/[id]/page.tsx` as Server Component fetching plan by ID
    - Create `components/admin/plans/plan-edit-form.tsx` as Client Component
    - Pre-populate form with current plan data
    - Call plansApi.update on submit
    - Show success toast and redirect to plans list
    - _Requirements: 8.5-8.6_

  - [x] 12.4 Implement Plan deletion with subscription check
    - Create `components/admin/plans/delete-plan-dialog.tsx` with confirmation
    - Display number of active_subscriptions in confirmation message
    - Show strong warning if plan has active subscriptions: "This plan has X active subscriptions. Users will lose access."
    - Require typing plan name for confirmation if active_subscriptions > 0
    - Call plansApi.delete on confirmation
    - Show success toast and refresh plans list
    - Display error if backend prevents deletion due to subscriptions
    - _Requirements: 8.7-8.8, 16.1-16.2, 16.5_

  - [x] 12.5 Enable Plans navigation and update dashboard
    - Update `lib/utils/navigation.ts` to enable Plans item (should already exist, verify enabled)
    - Update dashboard stat card to fetch real plan count from plansApi.list
    - Update stat card to be clickable linking to /admin/plans
    - _Requirements: 8.11, 12.2_

- [ ] 13. Checkpoint - Test Core Modules
  - Verify all CRUD operations work for users, plans, sessions
  - Test all Xray operations (instances, inbounds, clients)
  - Verify server and node display works
  - Test all confirmation dialogs
  - Ensure navigation works correctly
  - Ask the user if questions arise

- [x] 14. Audit Logs Module
  - Create comprehensive audit log viewer with filtering
  - Implement log detail view and export functionality
  - _Requirements: 9.1-9.10_

  - [x] 14.1 Create Audit Logs list page with filtering
    - Create `app/admin/logs/page.tsx` as Server Component
    - Read filters from searchParams (page, limit, action, entity_type, start_date, end_date)
    - Fetch logs using auditApi.getLogs with filters
    - Create `components/admin/logs/audit-logs-table.tsx` as Client Component
    - Display columns: timestamp, actor_email, action, entity_type, entity_id, ip_address, status, actions
    - Format timestamp as relative time (e.g., "2 hours ago") with full timestamp on hover
    - Create `components/admin/logs/audit-filters.tsx` with action dropdown, entity type dropdown, date range picker
    - Use URL state for filters (update searchParams on filter change)
    - Implement pagination controls with page size options (10, 25, 50, 100)
    - _Requirements: 9.1-9.5, 9.7_

  - [x] 14.2 Create Audit Log detail view
    - Create `components/admin/logs/audit-log-detail-dialog.tsx` as Client Component
    - Display full log entry with all fields including metadata
    - Show metadata as formatted JSON with syntax highlighting
    - Display request body and response if available in metadata
    - Show user agent string with parsed browser/OS information
    - Make dialog accessible with keyboard navigation
    - _Requirements: 9.6_

  - [x] 14.3 Implement Audit Stats display
    - Create `components/admin/logs/audit-stats-cards.tsx` as Client Component
    - Fetch stats using auditApi.getStats
    - Display total_actions count
    - Display actions_by_type as small stat cards or chart
    - Display recent_activity_count
    - Place stats cards above audit logs table
    - _Requirements: 9.9_

  - [x] 14.4 Implement Export functionality
    - Create `components/admin/logs/export-logs-button.tsx` as Client Component
    - Add dropdown with "Export as CSV" and "Export as JSON" options
    - On CSV export, convert current filtered logs to CSV format and download
    - On JSON export, convert logs to JSON and download
    - Use browser download API to trigger file download
    - Show loading state during export
    - _Requirements: 9.8_

  - [x] 14.5 Create Date Range Picker component
    - Create `components/admin/logs/date-range-picker.tsx` as Client Component
    - Use shadcn/ui Calendar component or similar
    - Allow selecting start_date and end_date
    - Update URL search params when dates selected
    - Display selected range in filter controls
    - Add "Clear dates" button
    - _Requirements: 9.4_

  - [x] 14.6 Enable Logs navigation and update dashboard
    - Update `lib/utils/navigation.ts` to enable Logs item (verify it exists)
    - Update dashboard activity feed to fetch recent logs using auditApi.getLogs with limit=10
    - Make activity feed items clickable to view log detail
    - Update recent_audit_actions stat card with real count
    - _Requirements: 9.10, 12.3_

- [x] 15. Enhanced System Monitoring Module
  - Create detailed monitoring dashboard
  - Display system health, database status, Xray status, version info
  - _Requirements: 10.1-10.10_

  - [x] 15.1 Update main Dashboard with real data
    - Update `app/admin/page.tsx` to fetch stats from systemApi.getStats
    - Update user count stat card with total_users and active_users
    - Update Xray instances stat card with total_xray_instances and active_xray_instances
    - Update recent audit actions stat card with recent_audit_actions
    - Update server count from serversApi.list
    - Update plan count from plansApi.list
    - Make all stat cards clickable linking to respective modules
    - _Requirements: 10.5, 10.8_

  - [x] 15.2 Create detailed Monitoring page
    - Create `app/admin/monitoring/page.tsx` as Server Component
    - Fetch health, database status, Xray status, version in parallel using Promise.all
    - Create `components/admin/monitoring/system-health-card.tsx` displaying overall health status and database connection
    - Create `components/admin/monitoring/database-status-card.tsx` displaying connection status, response_time_ms, active_connections, max_connections
    - Create `components/admin/monitoring/xray-system-card.tsx` displaying instances_total, instances_running, instances_stopped, clients_total, clients_active
    - Create `components/admin/monitoring/version-info-card.tsx` displaying version, build_date, git_commit
    - Use color-coded indicators: healthy=green, degraded=yellow, unhealthy=red
    - Display red error indicator when any health check fails
    - _Requirements: 10.1-10.4, 10.6_

  - [x] 15.3 Implement Auto-refresh for monitoring
    - Create `components/admin/monitoring/auto-refresh-toggle.tsx` as Client Component
    - Add toggle switch to enable/disable auto-refresh (default: off)
    - When enabled, refresh monitoring data every 30 seconds using useEffect interval
    - Display last updated timestamp
    - Clear interval when component unmounts or toggle disabled
    - _Requirements: 10.7_

  - [x] 15.4 Add Monitoring to navigation
    - Update `lib/utils/navigation.ts` to add Monitoring item with Settings icon
    - Link to /admin/monitoring
    - Position at bottom of navigation list
    - _Requirements: 12.6_

- [x] 16. Loading States and Empty States
  - Implement consistent loading and empty states across all modules
  - Add error boundaries for graceful error handling
  - _Requirements: 14.1-14.8_

  - [x] 16.1 Create loading.tsx files for all routes
    - Create `app/admin/users/loading.tsx` with skeleton loader for users table
    - Create `app/admin/users/[id]/loading.tsx` with skeleton loader for user detail
    - Create `app/admin/sessions/loading.tsx` with skeleton loader
    - Create `app/admin/xray/instances/loading.tsx` with skeleton loader
    - Create `app/admin/xray/instances/[id]/loading.tsx` with skeleton loader
    - Create `app/admin/xray/inbounds/loading.tsx` with skeleton loader
    - Create `app/admin/xray/clients/loading.tsx` with skeleton loader
    - Create `app/admin/servers/loading.tsx` with skeleton loader
    - Create `app/admin/servers/[id]/loading.tsx` with skeleton loader
    - Create `app/admin/plans/loading.tsx` with skeleton loader
    - Create `app/admin/logs/loading.tsx` with skeleton loader
    - Create `app/admin/monitoring/loading.tsx` with skeleton loader
    - Use shadcn/ui Skeleton component for consistent styling
    - _Requirements: 14.1, 14.4_

  - [x] 16.2 Create empty states for all list views
    - Create reusable `components/ui/empty-state.tsx` component with icon, title, description, action button props
    - Add empty states to: users, sessions, instances, inbounds, clients, servers, plans, logs
    - Each empty state should have relevant icon, helpful message, and CTA button
    - Display "No results found" when search/filter returns empty
    - _Requirements: 14.2, 14.7_

  - [x] 16.3 Create error.tsx files for all routes
    - Create error.tsx files matching the same structure as loading.tsx (users, sessions, xray/*, servers, plans, logs, monitoring)
    - Use consistent error boundary pattern with AlertCircle icon, error message, "Try Again" and "Go to Dashboard" buttons
    - Log errors to console for debugging
    - _Requirements: 14.5-14.6_

  - [x] 16.4 Add loading indicators to buttons
    - Create reusable button loading state pattern
    - Add loading spinner to all submit buttons during form submission
    - Add loading spinner to action buttons during async operations
    - Disable buttons during loading state
    - _Requirements: 14.3, 13.9_

- [x] 17. Responsive Design and Accessibility
  - Implement responsive breakpoints for all layouts
  - Ensure accessibility compliance
  - _Requirements: 15.1-15.10_

  - [x] 17.1 Implement mobile responsive layouts
    - Update all list pages to make tables horizontally scrollable on mobile with `overflow-x-auto`
    - Update forms to stack fields vertically on mobile using `flex-col` classes
    - Update sidebar to hide on mobile and show hamburger menu icon
    - Ensure touch targets are minimum 44px (use `min-h-11 min-w-11` classes)
    - Test all pages at 320px viewport width
    - _Requirements: 15.1, 15.5-15.7_

  - [x] 17.2 Implement tablet responsive layouts
    - Use TailwindCSS `md:` breakpoint for tablet adjustments
    - Ensure tables display properly without horizontal scroll on tablet
    - Use 2-column form layouts on tablet where appropriate
    - Test all pages at 768px and 1024px viewport widths
    - _Requirements: 15.2_

  - [x] 17.3 Implement desktop responsive layouts
    - Use TailwindCSS `lg:` and `xl:` breakpoints for desktop optimizations
    - Ensure sidebar is always visible on desktop
    - Use multi-column layouts for forms and cards where appropriate
    - Optimize dashboard grid layout for wide screens
    - _Requirements: 15.3-15.4_

  - [x] 17.4 Implement accessibility features
    - Add ARIA labels to all icon-only buttons using `aria-label` attribute
    - Ensure all form inputs have associated labels (use shadcn/ui Label component)
    - Ensure keyboard navigation works: Tab, Shift+Tab, Enter, Escape
    - Add focus-visible styles to all interactive elements
    - Test navigation with Tab key only
    - Add `role` attributes to custom interactive elements
    - Ensure screen readers announce page titles and major sections
    - _Requirements: 15.8-15.9_

  - [x] 17.5 Verify color contrast compliance
    - Use shadcn/ui default colors which meet WCAG 2.1 Level AA
    - Test status badges, error messages, and text colors for sufficient contrast
    - Ensure disabled states have visible indication beyond color
    - Use online contrast checker tool to verify critical UI elements
    - _Requirements: 15.10_

- [ ] 18. Final Integration and Testing
  - Integrate all modules with navigation
  - Verify end-to-end workflows
  - Test error handling and edge cases
  - _Requirements: 17.1-17.12, 18.1-18.10_

  - [x] 18.1 Complete navigation integration
    - Verify all navigation items are enabled and linked correctly
    - Test active route highlighting works for all pages
    - Test Xray submenu expand/collapse functionality
    - Test mobile sidebar open/close with hamburger menu
    - Verify navigation icons display correctly from lucide-react
    - _Requirements: 12.1-12.9_

  - [x] 18.2 Verify TypeScript compilation
    - Run `npm run type-check` or `tsc --noEmit` to verify no TypeScript errors
    - Fix any type errors or missing type definitions
    - Ensure all API response types match backend contracts
    - Verify all Zod schemas export correct types
    - _Requirements: 17.3, 18.1_

  - [x] 18.3 Test authentication and session handling
    - Verify all API proxy routes require authentication (return 401 when not logged in)
    - Test session expiry redirects to login page
    - Verify session cookie is sent with all API requests
    - Test that logging out clears session and redirects to login
    - Ensure existing authentication functionality still works
    - _Requirements: 18.8-18.9_

  - [x] 18.4 Test all CRUD operations end-to-end
    - Test user creation, edit, status change, role change, deletion
    - Test plan creation, edit, deletion (with and without subscriptions)
    - Test inbound creation, edit, enable/disable, deletion
    - Test client creation, enable/disable, regenerate UUID, reprovision, deletion
    - Test session revocation (single and all)
    - Test Xray instance start, stop, restart, reload
    - Verify all operations display success toasts
    - Verify all operations refresh data correctly
    - _Requirements: 18.3-18.6_

  - [ ] 18.5 Test error handling comprehensively
    - Test network error (stop Go backend): should show "Unable to connect" message
    - Test 401 error (invalid session): should redirect to login
    - Test 403 error (permission denied): should show "Access Denied"
    - Test 404 error (resource not found): should show "Not Found"
    - Test 500 error (server error): should show "Server Error"
    - Test validation errors: should map to form fields
    - Verify all error messages are user-friendly (no raw backend errors shown)
    - _Requirements: 13.3-13.8, 18.7_

  - [ ] 18.6 Test loading states and empty states
    - Verify skeleton loaders display during page navigation
    - Verify empty states display when no data exists
    - Verify "No results found" displays for empty search results
    - Verify button loading indicators display during operations
    - Test error boundaries display when components fail
    - _Requirements: 14.1-14.8_

  - [ ] 18.7 Test responsive design on multiple devices
    - Test all pages on mobile viewport (320px-767px)
    - Test all pages on tablet viewport (768px-1023px)
    - Test all pages on desktop viewport (1024px+)
    - Verify tables scroll horizontally on mobile
    - Verify forms stack vertically on mobile
    - Verify sidebar behavior on all viewports
    - _Requirements: 15.1-15.4_

  - [ ] 18.8 Test accessibility with keyboard and screen reader
    - Navigate entire application using keyboard only (Tab, Shift+Tab, Enter, Escape)
    - Verify all buttons, links, form fields are keyboard accessible
    - Verify focus indicators are visible
    - Test with NVDA or macOS VoiceOver screen reader
    - Verify page titles and headings are announced
    - Verify form errors are announced
    - _Requirements: 15.8-15.9_

  - [ ] 18.9 Verify data display from backend
    - Verify dashboard displays real data (not placeholder "—" values)
    - Verify all stat cards show real counts from backend
    - Verify all list pages show real data
    - Verify health checks display real status
    - Verify audit logs display real log entries
    - _Requirements: 10.9, 18.2-18.3_

  - [ ] 18.10 Final regression testing
    - Verify existing user list and view functionality still works (from admin-dashboard spec)
    - Verify login and logout still work
    - Verify dashboard layout is not broken
    - Test creating a user, viewing the user, editing the user, deleting the user end-to-end
    - Test creating a plan, editing the plan, deleting the plan end-to-end
    - Test Xray instance operations end-to-end
    - Verify no console errors in browser during normal usage
    - _Requirements: 18.10_

- [ ] 19. Final Checkpoint - Production Readiness
  - All TypeScript compiles without errors
  - All 47 API proxy routes verified working
  - All manual test checklists completed
  - All 18 requirements validated
  - Authentication and session management working
  - Responsive design tested on mobile, tablet, desktop
  - Accessibility features verified
  - Error handling tested comprehensively
  - Ask the user if questions arise before marking complete

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10"] },
    { "id": 2, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 3, "tasks": ["5.1", "6.1", "7.1", "9.1", "10.1", "11.1", "12.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "6.2", "7.2", "9.2", "10.2", "11.2", "12.2", "14.1"] },
    { "id": 5, "tasks": ["5.5", "6.3", "7.3", "9.3", "10.3", "11.3", "12.3", "14.2", "14.3", "15.1"] },
    { "id": 6, "tasks": ["6.4", "7.4", "9.4", "10.4", "12.4", "14.4", "14.5", "15.2"] },
    { "id": 7, "tasks": ["10.5", "12.5", "14.6", "15.3", "15.4"] },
    { "id": 8, "tasks": ["16.1", "16.2", "16.3", "16.4"] },
    { "id": 9, "tasks": ["17.1", "17.2", "17.3"] },
    { "id": 10, "tasks": ["17.4", "17.5"] },
    { "id": 11, "tasks": ["18.1", "18.2", "18.3"] },
    { "id": 12, "tasks": ["18.4", "18.5", "18.6"] },
    { "id": 13, "tasks": ["18.7", "18.8", "18.9"] },
    { "id": 14, "tasks": ["18.10"] }
  ]
}
```

## Notes

- **No Backend Modifications:** All tasks operate within Next.js. The Go backend is treated as an immutable API service.
- **Type Safety First:** TypeScript interfaces and Zod schemas provide compile-time and runtime safety, reducing the need for extensive unit testing.
- **Server Components Pattern:** Data fetching happens in Server Components, interactivity in Client Components following Next.js 14+ best practices.
- **Consistent Error Handling:** All API errors map to user-friendly messages using ApiError class methods.
- **Checkpoint Tasks:** Provide natural pause points to verify work before proceeding to dependent tasks.
- **Testing Strategy:** Focuses on manual testing workflows, TypeScript type safety, and backend integration testing (backend already has comprehensive tests).
- **47 New API Endpoints:** All proxy routes forward to existing Go backend endpoints without modification.
- **Accessibility:** WCAG 2.1 Level AA compliance through semantic HTML, ARIA labels, keyboard navigation, and color contrast.
- **Responsive Design:** Mobile-first approach with TailwindCSS breakpoints (sm, md, lg, xl).
- **Task Dependencies:** The dependency graph enables parallel execution of independent tasks while respecting file dependencies.
