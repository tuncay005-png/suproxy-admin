# Design Document: Full Admin Control Center

## Overview

### Purpose

This design document specifies the technical implementation for expanding the existing Admin Dashboard into a comprehensive Full Admin Control Center. The expansion exposes all existing Go backend capabilities across Users, Xray, Infrastructure, Plans, Monitoring, and Audit Logs through a modern Next.js interface.

### Scope

**In Scope:**
- Complete user CRUD operations (Create, Update, Delete)
- User sessions and activity management
- User subscriptions display
- Xray instance management (start, stop, restart, reload, health, stats)
- Xray inbound configuration management
- Xray client management
- Server and node infrastructure management
- Plan management (CRUD operations)
- Comprehensive audit log viewer with filtering
- Enhanced system monitoring dashboard
- API proxy layer expansion (47 new endpoints)
- Navigation and module organization
- Consistent form validation and error handling
- Loading states and empty states
- Responsive design and accessibility
- Confirmation dialogs for destructive actions

**Out of Scope:**
- Modifications to the Go backend (backend is source of truth)
- Direct database connections from Next.js
- Real-time WebSocket updates (may use polling where needed)
- Multi-factor authentication
- CSRF protection (future enhancement)
- Rate limiting (handled by backend)

### Architectural Constraints

**Critical Constraints:**
1. **No Backend Modifications:** The Go backend MUST NOT be modified. All business logic resides in the backend.
2. **Proxy Pattern:** All backend communication flows through Next.js API routes (proxy layer)
3. **Server Components First:** Use Next.js Server Components for data fetching, Client Components for interactivity
4. **Session-Based Auth:** Authentication uses httpOnly session cookies (no client-side tokens)
5. **Type Safety:** Full TypeScript coverage with strict typing
6. **Existing Patterns:** Follow established patterns in the current Admin UI implementation

### Technology Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript (strict mode)
- **UI Library:** shadcn/ui components (built on Radix UI)
- **Styling:** TailwindCSS with responsive breakpoints
- **Icons:** lucide-react
- **Form Validation:** Zod schemas
- **Data Fetching:** Server Components + API Client pattern
- **State Management:** React hooks + URL state where applicable
- **Backend Communication:** Fetch API through proxy routes


## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin UI (Next.js 14)                     │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Server         │  │ Client         │  │ API Routes     │    │
│  │ Components     │  │ Components     │  │ (Proxy Layer)  │    │
│  │                │  │                │  │                │    │
│  │ • Data Fetch   │  │ • Forms        │  │ • /api/admin/* │    │
│  │ • SSR Pages    │  │ • Dialogs      │  │ • /api/auth/*  │    │
│  │ • Layouts      │  │ • Search       │  │ • /api/plans   │    │
│  │                │  │ • Interactions │  │ • /api/servers │    │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘    │
│           │                   │                    │             │
│           └───────────────────┴────────────────────┘             │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │ HTTP + Session Cookie
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                              ▼                                    │
│                   Go Backend HTTP Server                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ HTTP Handlers│  │ Use Cases    │  │ Repositories │          │
│  │              │  │              │  │              │          │
│  │ • Auth       │  │ • Admin      │  │ • User Repo  │          │
│  │ • Admin      │  │ • User Mgmt  │  │ • Xray Repo  │          │
│  │ • Users      │  │ • Xray Mgmt  │  │ • Server Repo│          │
│  │ • Xray       │  │ • Plan Mgmt  │  │ • Plan Repo  │          │
│  │ • Plans      │  │ • Audit Log  │  │ • Audit Repo │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┴──────────────────┘                   │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │                 │
                  │ • users         │
                  │ • xray_*        │
                  │ • plans         │
                  │ • servers       │
                  │ • audit_logs    │
                  └─────────────────┘
```

### Data Flow Patterns

#### Pattern 1: Server Component Data Fetch (Read Operations)

```typescript
// Server Component - Fetches data server-side
async function UsersPage() {
  const response = await usersApi.list(); // Server-side fetch
  const users = response.data.users;
  
  return <UserListTable users={users} />; // Pass to client component
}

// API Client (runs on server during SSR)
export const usersApi = {
  list: () => apiClient.get('/api/admin/users')
};

// Next.js API Route (Proxy)
export async function GET(request: NextRequest) {
  const sessionToken = await getSessionToken();
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const response = await fetch(`${backendUrl}/api/v1/admin/users`, {
    headers: { 'Authorization': `Bearer ${sessionToken}` }
  });
  
  return NextResponse.json(await response.json());
}
```

#### Pattern 2: Client Component Mutation (Write Operations)

```typescript
// Client Component - Handles user interactions
'use client';

function CreateUserForm() {
  const [isPending, startTransition] = useTransition();
  
  async function handleSubmit(data: CreateUserInput) {
    startTransition(async () => {
      try {
        await usersApi.create(data); // Client-side fetch
        router.push('/admin/users');
        toast.success('User created');
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.userFriendlyMessage);
        }
      }
    });
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Pattern 3: Server Actions (Alternative for Mutations)

```typescript
// Server Action (runs on server, called from client)
'use server';

async function createUser(formData: FormData) {
  const data = parseFormData(formData);
  await usersApi.create(data);
  revalidatePath('/admin/users');
  redirect('/admin/users');
}

// Client Component
'use client';

function CreateUserForm() {
  return (
    <form action={createUser}>
      {/* form fields */}
    </form>
  );
}
```

### Module Architecture

Each administrative module follows a consistent structure:

```
app/admin/[module]/
├── page.tsx                 # Server Component: List view
├── loading.tsx              # Loading state
├── error.tsx                # Error boundary
├── new/
│   └── page.tsx            # Server Component: Create page
└── [id]/
    ├── page.tsx            # Server Component: Detail/Edit page
    ├── loading.tsx         # Loading state
    └── error.tsx           # Error boundary

components/admin/[module]/
├── [module]-list-table.tsx     # Client: Interactive table
├── [module]-form.tsx           # Client: Create/Edit form
├── [module]-detail.tsx         # Client: Detail view
├── [module]-actions.tsx        # Client: Action buttons
└── [module]-filters.tsx        # Client: Search/filter

lib/api/endpoints/[module].ts   # API client methods
types/[module].ts               # TypeScript types
app/api/admin/[module]/
├── route.ts                    # Proxy: GET, POST
└── [id]/
    └── route.ts                # Proxy: GET, PUT, DELETE
```


## Components and Interfaces

### Navigation Structure

#### Updated Navigation Configuration

```typescript
// lib/utils/navigation.ts

import {
  Home, Users, Server, CreditCard, FileText, 
  Activity, Settings, Network, Radio, UserCheck
} from "lucide-react";

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Sessions",
    href: "/admin/sessions",
    icon: UserCheck,
  },
  {
    title: "Xray",
    icon: Network,
    children: [
      {
        title: "Instances",
        href: "/admin/xray/instances",
        icon: Radio,
      },
      {
        title: "Inbounds",
        href: "/admin/xray/inbounds",
        icon: Activity,
      },
      {
        title: "Clients",
        href: "/admin/xray/clients",
        icon: Users,
      },
    ],
  },
  {
    title: "Servers",
    href: "/admin/servers",
    icon: Server,
  },
  {
    title: "Plans",
    href: "/admin/plans",
    icon: CreditCard,
  },
  {
    title: "Logs",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    title: "Monitoring",
    href: "/admin/monitoring",
    icon: Settings,
  },
];
```

### Component Hierarchy by Module

#### 1. User Management Module

**Page Components:**
```typescript
// app/admin/users/page.tsx - List view
async function UsersPage() {
  const response = await usersApi.list();
  return <UserListTableWithSearch users={response.data.users} />;
}

// app/admin/users/new/page.tsx - Create user
function NewUserPage() {
  return <UserCreationForm />;
}

// app/admin/users/[id]/page.tsx - User detail/edit
async function UserDetailPage({ params }: { params: { id: string } }) {
  const response = await usersApi.getById(params.id);
  return <UserDetailView user={response.data} />;
}
```

**Component Structure:**
```
components/admin/users/
├── user-list-table-with-search.tsx     # Client: Table + search
├── user-creation-form.tsx              # Client: Create form
├── user-detail-view.tsx                # Client: Detail display
├── user-edit-form.tsx                  # Client: Edit form
├── user-status-badge.tsx               # Client: Status indicator
├── user-role-badge.tsx                 # Client: Role indicator
├── user-actions-dropdown.tsx           # Client: Action menu
├── delete-user-dialog.tsx              # Client: Confirmation dialog
└── user-subscription-card.tsx          # Client: Subscription info
```

#### 2. Session Management Module

**Page Components:**
```typescript
// app/admin/sessions/page.tsx - Sessions list
async function SessionsPage() {
  const response = await sessionsApi.list();
  return <SessionsTable sessions={response.data.sessions} />;
}
```

**Component Structure:**
```
components/admin/sessions/
├── sessions-table.tsx                  # Client: Sessions list
├── session-row.tsx                     # Client: Single session
├── revoke-session-button.tsx           # Client: Revoke action
├── revoke-all-sessions-dialog.tsx      # Client: Confirmation
└── session-device-info.tsx             # Client: Device details
```

#### 3. Xray Management Module

**Page Components:**
```typescript
// app/admin/xray/instances/page.tsx - Instances list
async function XrayInstancesPage() {
  const response = await xrayApi.instances.list();
  return <InstancesTable instances={response.data.instances} />;
}

// app/admin/xray/instances/[id]/page.tsx - Instance detail
async function InstanceDetailPage({ params }) {
  const [instance, health, stats] = await Promise.all([
    xrayApi.instances.getById(params.id),
    xrayApi.instances.getHealth(params.id),
    xrayApi.instances.getStats(params.id),
  ]);
  
  return (
    <InstanceDetailView 
      instance={instance.data} 
      health={health.data} 
      stats={stats.data} 
    />
  );
}

// app/admin/xray/inbounds/page.tsx - Inbounds list
async function XrayInboundsPage() {
  const response = await xrayApi.inbounds.list();
  return <InboundsTable inbounds={response.data.inbounds} />;
}

// app/admin/xray/clients/page.tsx - Clients list
async function XrayClientsPage() {
  const response = await xrayApi.clients.list();
  return <ClientsTable clients={response.data.clients} />;
}
```

**Component Structure:**
```
components/admin/xray/
├── instances/
│   ├── instances-table.tsx             # Client: Instances list
│   ├── instance-status-badge.tsx       # Client: Status indicator
│   ├── instance-control-buttons.tsx    # Client: Start/Stop/Restart
│   ├── instance-health-card.tsx        # Client: Health display
│   ├── instance-stats-card.tsx         # Client: Stats display
│   └── instance-actions-dropdown.tsx   # Client: Action menu
├── inbounds/
│   ├── inbounds-table.tsx              # Client: Inbounds list
│   ├── inbound-form.tsx                # Client: Create/Edit form
│   ├── inbound-protocol-selector.tsx   # Client: Protocol dropdown
│   ├── inbound-settings-fields.tsx     # Client: Dynamic fields
│   └── delete-inbound-dialog.tsx       # Client: Confirmation
└── clients/
    ├── clients-table.tsx               # Client: Clients list
    ├── client-form.tsx                 # Client: Create form
    ├── client-config-display.tsx       # Client: Config/QR code
    ├── client-actions-dropdown.tsx     # Client: Action menu
    ├── regenerate-uuid-dialog.tsx      # Client: Confirmation
    └── reprovision-client-dialog.tsx   # Client: Confirmation
```

#### 4. Server Management Module

**Page Components:**
```typescript
// app/admin/servers/page.tsx - Servers list
async function ServersPage() {
  const response = await serversApi.list();
  return <ServersTable servers={response.data.servers} />;
}

// app/admin/servers/[id]/page.tsx - Server detail
async function ServerDetailPage({ params }) {
  const [server, nodes] = await Promise.all([
    serversApi.getById(params.id),
    nodesApi.listByServer(params.id),
  ]);
  
  return (
    <ServerDetailView 
      server={server.data} 
      nodes={nodes.data.nodes} 
    />
  );
}
```

**Component Structure:**
```
components/admin/servers/
├── servers-table.tsx                   # Client: Servers list
├── server-card.tsx                     # Client: Server card view
├── server-status-badge.tsx             # Client: Status indicator
├── server-location-badge.tsx           # Client: Location display
├── nodes-list.tsx                      # Client: Associated nodes
├── node-health-indicator.tsx           # Client: Node health
└── server-filters.tsx                  # Client: Filter controls
```

#### 5. Plan Management Module

**Page Components:**
```typescript
// app/admin/plans/page.tsx - Plans list
async function PlansPage() {
  const response = await plansApi.list();
  return <PlansTable plans={response.data.plans} />;
}

// app/admin/plans/new/page.tsx - Create plan
function NewPlanPage() {
  return <PlanCreationForm />;
}

// app/admin/plans/[id]/page.tsx - Plan detail/edit
async function PlanDetailPage({ params }) {
  const response = await plansApi.getById(params.id);
  return <PlanDetailView plan={response.data} />;
}
```

**Component Structure:**
```
components/admin/plans/
├── plans-table.tsx                     # Client: Plans list
├── plan-creation-form.tsx              # Client: Create form
├── plan-edit-form.tsx                  # Client: Edit form
├── plan-card.tsx                       # Client: Plan card view
├── plan-status-badge.tsx               # Client: Active/Inactive
├── delete-plan-dialog.tsx              # Client: Confirmation (shows subscriptions)
└── plan-limits-display.tsx             # Client: Limits breakdown
```

#### 6. Audit Logs Module

**Page Components:**
```typescript
// app/admin/logs/page.tsx - Audit logs list
async function AuditLogsPage({ searchParams }) {
  const response = await auditApi.getLogs({
    page: searchParams.page || 1,
    limit: searchParams.limit || 25,
    action: searchParams.action,
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
  });
  
  return (
    <AuditLogsTable 
      logs={response.data.logs} 
      pagination={response.data.pagination} 
    />
  );
}
```

**Component Structure:**
```
components/admin/logs/
├── audit-logs-table.tsx                # Client: Logs table
├── audit-log-row.tsx                   # Client: Single log entry
├── audit-log-detail-dialog.tsx         # Client: Detail modal
├── audit-filters.tsx                   # Client: Filter controls
├── audit-stats-cards.tsx               # Client: Action stats
├── export-logs-button.tsx              # Client: Export CSV/JSON
└── date-range-picker.tsx               # Client: Date filter
```

#### 7. Monitoring Dashboard Module

**Page Components:**
```typescript
// app/admin/monitoring/page.tsx - Enhanced monitoring
async function MonitoringPage() {
  const [health, database, xraySystem, version] = await Promise.all([
    dashboardApi.getSystemHealth(),
    dashboardApi.getDatabaseStatus(),
    dashboardApi.getXraySystemStatus(),
    dashboardApi.getVersion(),
  ]);
  
  return (
    <MonitoringDashboard 
      health={health.data}
      database={database.data}
      xraySystem={xraySystem.data}
      version={version.data}
    />
  );
}
```

**Component Structure:**
```
components/admin/monitoring/
├── system-health-card.tsx              # Client: Overall health
├── database-status-card.tsx            # Client: DB metrics
├── xray-system-card.tsx                # Client: Xray metrics
├── version-info-card.tsx               # Client: Version display
├── health-indicator.tsx                # Client: Status dot
└── auto-refresh-toggle.tsx             # Client: Auto-refresh control
```


## Data Models

### TypeScript Type Definitions

#### Core Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
  page?: number;
  totalPages?: number;
}
```

#### User Types

```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin';
  last_login_at: string | null;
  last_login_ip: string;
  failed_login_count: number;
  locked_until: string | null;
  password_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  offset: number;
  limit: number;
}
```

#### Session Types

```typescript
// types/session.ts
export interface UserSession {
  id: string;
  user_id: string;
  username: string;
  email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
}

export interface SessionsListResponse {
  sessions: UserSession[];
  total: number;
}
```

#### Xray Types

```typescript
// types/xray.ts
export interface XrayInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  server_id: string;
  server_name: string;
  uptime: number; // seconds
  created_at: string;
  updated_at: string;
}

export interface XrayInstanceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  uptime: number;
  last_check: string;
  error_message?: string;
}

export interface XrayInstanceStats {
  connections_active: number;
  connections_total: number;
  traffic_up: number;
  traffic_down: number;
  clients_active: number;
  clients_total: number;
}

export interface XrayInbound {
  id: string;
  instance_id: string;
  protocol: 'vless' | 'vmess' | 'trojan' | 'shadowsocks';
  port: number;
  tag: string;
  enabled: boolean;
  settings: Record<string, unknown>; // Protocol-specific settings
  created_at: string;
  updated_at: string;
}

export interface CreateInboundInput {
  instance_id: string;
  protocol: 'vless' | 'vmess' | 'trojan' | 'shadowsocks';
  port: number;
  tag: string;
  settings: Record<string, unknown>;
}

export interface XrayClient {
  id: string;
  email: string;
  uuid: string;
  inbound_id: string;
  inbound_tag: string;
  enabled: boolean;
  traffic_up: number;
  traffic_down: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  email: string;
  inbound_id: string;
  settings?: Record<string, unknown>;
}

export interface XrayClientConfig {
  protocol: string;
  address: string;
  port: number;
  uuid: string;
  connection_url: string;
  qr_code_data: string;
}
```

#### Server Types

```typescript
// types/server.ts
export interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  ip_address: string;
  status: 'online' | 'offline' | 'maintenance';
  node_count: number;
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  server_id: string;
  type: 'xray' | 'database' | 'service';
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  health_metrics: {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ServersListResponse {
  servers: Server[];
  total: number;
}

export interface NodesListResponse {
  nodes: Node[];
  total: number;
}
```

#### Plan Types

```typescript
// types/plan.ts
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  data_limit_gb: number;
  active: boolean;
  active_subscriptions: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanInput {
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  data_limit_gb: number;
  active: boolean;
}

export interface PlansListResponse {
  plans: Plan[];
  total: number;
}
```

#### Subscription Types

```typescript
// types/subscription.ts
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
  start_date: string;
  expiry_date: string;
  data_used_gb: number;
  data_limit_gb: number;
  created_at: string;
  updated_at: string;
}
```

#### Audit Log Types

```typescript
// types/audit.ts
export interface AuditLog {
  id: string;
  action: string;
  actor_id: string;
  actor_email: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogsListResponse {
  logs: AuditLog[];
  total: number;
  offset: number;
  limit: number;
}

export interface AuditLogsFilter {
  page?: number;
  limit?: number;
  action?: string;
  entity_type?: string;
  actor_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface AuditStats {
  total_actions: number;
  actions_by_type: Record<string, number>;
  recent_activity_count: number;
}
```

#### System Monitoring Types

```typescript
// types/system.ts
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected';
  timestamp: string;
}

export interface DatabaseStatus {
  status: 'connected' | 'disconnected';
  response_time_ms: number;
  active_connections: number;
  max_connections: number;
}

export interface XraySystemStatus {
  instances_total: number;
  instances_running: number;
  instances_stopped: number;
  clients_total: number;
  clients_active: number;
}

export interface VersionInfo {
  version: string;
  build_date: string;
  git_commit: string;
}
```


### API Client Methods

#### User Management API

```typescript
// lib/api/endpoints/users.ts
export const usersApi = {
  // List all users
  list: (): Promise<ApiResponse<UsersListResponse>> =>
    apiClient.get('/api/admin/users'),

  // Get user by ID
  getById: (id: string): Promise<ApiResponse<User>> =>
    apiClient.get(`/api/admin/users/${id}`),

  // Create user
  create: (data: CreateUserInput): Promise<ApiResponse<User>> =>
    apiClient.post('/api/admin/users', data),

  // Update user
  update: (id: string, data: UpdateUserInput): Promise<ApiResponse<User>> =>
    apiClient.put(`/api/admin/users/${id}`, data),

  // Update user status
  updateStatus: (id: string, status: string): Promise<ApiResponse<User>> =>
    apiClient.put(`/api/admin/users/${id}/status`, { status }),

  // Update user role
  updateRole: (id: string, role: string): Promise<ApiResponse<User>> =>
    apiClient.put(`/api/admin/users/${id}/role`, { role }),

  // Delete user
  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/admin/users/${id}`),
};
```

#### Session Management API

```typescript
// lib/api/endpoints/sessions.ts
export const sessionsApi = {
  // List all active sessions
  list: (): Promise<ApiResponse<SessionsListResponse>> =>
    apiClient.get('/api/auth/sessions'),

  // Revoke single session
  revoke: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/auth/sessions/${id}`),

  // Revoke all sessions for a user
  revokeAll: (userId: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post('/api/auth/logout-all', { user_id: userId }),
};
```

#### Xray Management API

```typescript
// lib/api/endpoints/xray.ts
export const xrayApi = {
  instances: {
    list: (): Promise<ApiResponse<{ instances: XrayInstance[] }>> =>
      apiClient.get('/api/admin/xray/instances'),

    getById: (id: string): Promise<ApiResponse<XrayInstance>> =>
      apiClient.get(`/api/admin/xray/instances/${id}`),

    start: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post(`/api/admin/xray/instances/${id}/start`, {}),

    stop: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post(`/api/admin/xray/instances/${id}/stop`, {}),

    restart: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post(`/api/admin/xray/instances/${id}/restart`, {}),

    reload: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.post(`/api/admin/xray/instances/${id}/reload`, {}),

    getHealth: (id: string): Promise<ApiResponse<XrayInstanceHealth>> =>
      apiClient.get(`/api/admin/xray/instances/${id}/health`),

    getStats: (id: string): Promise<ApiResponse<XrayInstanceStats>> =>
      apiClient.get(`/api/admin/xray/instances/${id}/stats`),
  },

  inbounds: {
    list: (): Promise<ApiResponse<{ inbounds: XrayInbound[] }>> =>
      apiClient.get('/api/admin/xray/inbounds'),

    getById: (id: string): Promise<ApiResponse<XrayInbound>> =>
      apiClient.get(`/api/admin/xray/inbounds/${id}`),

    create: (data: CreateInboundInput): Promise<ApiResponse<XrayInbound>> =>
      apiClient.post('/api/admin/xray/inbounds', data),

    update: (id: string, data: Partial<CreateInboundInput>): Promise<ApiResponse<XrayInbound>> =>
      apiClient.put(`/api/admin/xray/inbounds/${id}`, data),

    delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.delete(`/api/admin/xray/inbounds/${id}`),

    enable: (id: string): Promise<ApiResponse<XrayInbound>> =>
      apiClient.put(`/api/admin/xray/inbounds/${id}/enable`, {}),

    disable: (id: string): Promise<ApiResponse<XrayInbound>> =>
      apiClient.put(`/api/admin/xray/inbounds/${id}/disable`, {}),
  },

  clients: {
    list: (): Promise<ApiResponse<{ clients: XrayClient[] }>> =>
      apiClient.get('/api/admin/xray/clients'),

    getById: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.get(`/api/admin/xray/clients/${id}`),

    create: (data: CreateClientInput): Promise<ApiResponse<XrayClient & { config: XrayClientConfig }>> =>
      apiClient.post('/api/admin/xray/clients', data),

    delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
      apiClient.delete(`/api/admin/xray/clients/${id}`),

    enable: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.put(`/api/admin/xray/clients/${id}/enable`, {}),

    disable: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.put(`/api/admin/xray/clients/${id}/disable`, {}),

    regenerateUuid: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.post(`/api/admin/xray/clients/${id}/regenerate-uuid`, {}),

    reprovision: (id: string): Promise<ApiResponse<XrayClient>> =>
      apiClient.post(`/api/admin/xray/clients/${id}/reprovision`, {}),
  },
};
```

#### Server Management API

```typescript
// lib/api/endpoints/servers.ts
export const serversApi = {
  list: (): Promise<ApiResponse<ServersListResponse>> =>
    apiClient.get('/api/servers'),

  getById: (id: string): Promise<ApiResponse<Server>> =>
    apiClient.get(`/api/servers/${id}`),
};

export const nodesApi = {
  list: (): Promise<ApiResponse<NodesListResponse>> =>
    apiClient.get('/api/nodes'),

  listByServer: (serverId: string): Promise<ApiResponse<NodesListResponse>> =>
    apiClient.get(`/api/nodes?server_id=${serverId}`),
};
```

#### Plan Management API

```typescript
// lib/api/endpoints/plans.ts
export const plansApi = {
  list: (): Promise<ApiResponse<PlansListResponse>> =>
    apiClient.get('/api/plans'),

  getById: (id: string): Promise<ApiResponse<Plan>> =>
    apiClient.get(`/api/plans/${id}`),

  create: (data: CreatePlanInput): Promise<ApiResponse<Plan>> =>
    apiClient.post('/api/plans', data),

  update: (id: string, data: Partial<CreatePlanInput>): Promise<ApiResponse<Plan>> =>
    apiClient.put(`/api/plans/${id}`, data),

  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/plans/${id}`),
};
```

#### Subscription API

```typescript
// lib/api/endpoints/subscriptions.ts
export const subscriptionsApi = {
  getForUser: (userId: string): Promise<ApiResponse<Subscription>> =>
    apiClient.get(`/api/subscriptions/user/${userId}`),
};
```

#### Audit Logs API

```typescript
// lib/api/endpoints/audit.ts
export const auditApi = {
  getLogs: (filters: AuditLogsFilter): Promise<ApiResponse<AuditLogsListResponse>> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.action) params.set('action', filters.action);
    if (filters.entity_type) params.set('entity_type', filters.entity_type);
    if (filters.actor_id) params.set('actor_id', filters.actor_id);
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);

    return apiClient.get(`/api/admin/audit/logs?${params.toString()}`);
  },

  getStats: (): Promise<ApiResponse<AuditStats>> =>
    apiClient.get('/api/admin/audit/stats'),
};
```

#### System Monitoring API

```typescript
// lib/api/endpoints/system.ts
export const systemApi = {
  getHealth: (): Promise<ApiResponse<SystemHealth>> =>
    apiClient.get('/api/admin/system/health'),

  getStats: (): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    total_xray_instances: number;
    active_xray_instances: number;
    recent_audit_actions: number;
  }>> =>
    apiClient.get('/api/admin/system/stats'),

  getDatabaseStatus: (): Promise<ApiResponse<DatabaseStatus>> =>
    apiClient.get('/api/admin/system/database'),

  getXraySystemStatus: (): Promise<ApiResponse<XraySystemStatus>> =>
    apiClient.get('/api/admin/system/xray'),

  getVersion: (): Promise<ApiResponse<VersionInfo>> =>
    apiClient.get('/api/admin/system/version'),
};
```


### API Proxy Routes

#### Complete Proxy Route Mapping

```typescript
// New proxy routes to be created (47 endpoints)

// User Management (3 new endpoints)
app/api/admin/users/route.ts                    // POST (create user)
app/api/admin/users/[id]/route.ts              // PUT, DELETE
app/api/admin/users/[id]/status/route.ts       // Existing
app/api/admin/users/[id]/role/route.ts         // Existing

// Session Management (4 endpoints)
app/api/auth/sessions/route.ts                 // GET, POST (logout-all)
app/api/auth/sessions/[id]/route.ts           // DELETE

// Xray Instances (8 endpoints)
app/api/admin/xray/instances/route.ts          // GET
app/api/admin/xray/instances/[id]/route.ts     // GET
app/api/admin/xray/instances/[id]/start/route.ts      // POST
app/api/admin/xray/instances/[id]/stop/route.ts       // POST
app/api/admin/xray/instances/[id]/restart/route.ts    // POST
app/api/admin/xray/instances/[id]/reload/route.ts     // POST
app/api/admin/xray/instances/[id]/health/route.ts     // GET
app/api/admin/xray/instances/[id]/stats/route.ts      // GET

// Xray Inbounds (7 endpoints)
app/api/admin/xray/inbounds/route.ts           // GET, POST
app/api/admin/xray/inbounds/[id]/route.ts      // GET, PUT, DELETE
app/api/admin/xray/inbounds/[id]/enable/route.ts      // PUT
app/api/admin/xray/inbounds/[id]/disable/route.ts     // PUT

// Xray Clients (8 endpoints)
app/api/admin/xray/clients/route.ts            // GET, POST
app/api/admin/xray/clients/[id]/route.ts       // GET, DELETE
app/api/admin/xray/clients/[id]/enable/route.ts       // PUT
app/api/admin/xray/clients/[id]/disable/route.ts      // PUT
app/api/admin/xray/clients/[id]/regenerate-uuid/route.ts  // POST
app/api/admin/xray/clients/[id]/reprovision/route.ts  // POST

// Servers & Nodes (2 endpoints - existing, verify)
app/api/servers/route.ts                       // GET (existing)
app/api/nodes/route.ts                         // GET (new)

// Plans (5 endpoints)
app/api/plans/route.ts                         // GET (existing), POST (new)
app/api/plans/[id]/route.ts                    // GET, PUT, DELETE (new)

// Subscriptions (1 endpoint)
app/api/subscriptions/user/[userId]/route.ts   // GET

// Audit Logs (2 endpoints - 1 existing)
app/api/admin/audit/logs/route.ts              // GET (existing)
app/api/admin/audit/stats/route.ts             // GET (new)

// System Monitoring (4 endpoints - 2 existing)
app/api/admin/system/health/route.ts           // GET (existing)
app/api/admin/system/stats/route.ts            // GET (existing)
app/api/admin/system/database/route.ts         // GET (new)
app/api/admin/system/xray/route.ts             // GET (new)
app/api/admin/system/version/route.ts          // GET (new)
```

#### Standard Proxy Route Template

```typescript
// app/api/admin/[module]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_CONFIG.name);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!BACKEND_URL) {
      console.error('[PROXY] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Forward query parameters
    const searchParams = request.nextUrl.searchParams.toString();
    const endpoint = `${BACKEND_URL}/api/v1/admin/[module]${searchParams ? '?' + searchParams : ''}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_CONFIG.name);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!BACKEND_URL) {
      console.error('[PROXY] NEXT_PUBLIC_API_BASE_URL not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const endpoint = `${BACKEND_URL}/api/v1/admin/[module]`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```


## Error Handling

### Error Handling Strategy

#### Error Types and User-Friendly Messages

```typescript
// lib/api/client.ts (existing, enhanced)
export class ApiError extends Error implements ApiErrorType {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  get userFriendlyMessage(): string {
    // Network errors
    if (this.isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Authentication errors
    if (this.status === 401) {
      return 'Your session has expired. Please log in again.';
    }

    if (this.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    // Validation errors
    if (this.status === 400 || this.status === 422) {
      return this.message || 'The data you provided is invalid. Please check your input.';
    }

    // Not found errors
    if (this.status === 404) {
      return 'The requested resource was not found.';
    }

    // Timeout errors
    if (this.status === 408 || this.code === 'TIMEOUT_ERROR') {
      return 'The request took too long to complete. Please try again.';
    }

    // Server errors
    if (this.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }

    return this.message;
  }
}
```

#### Error Handling in Components

```typescript
// Pattern 1: Form submission error handling
'use client';

export function UserCreationForm() {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(data: CreateUserInput) {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        await usersApi.create(data);
        toast.success('User created successfully');
        router.push('/admin/users');
      } catch (err) {
        if (err instanceof ApiError) {
          // Map validation errors to specific fields
          if (err.isValidationError && err.details?.fields) {
            setFieldErrors(err.details.fields as Record<string, string>);
          } else {
            // Show general error message
            setError(err.userFriendlyMessage);
          }

          // Redirect to login if session expired
          if (err.status === 401) {
            router.push('/admin/login');
          }
        } else {
          setError('An unexpected error occurred');
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Input
        name="email"
        error={fieldErrors.email}
        // ... other props
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  );
}
```

#### Error Boundaries

```typescript
// app/admin/[module]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[MODULE-ERROR]', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-lg font-semibold">Something went wrong</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        An error occurred while loading this page.
      </p>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.href = '/admin'}>
          Go to Dashboard
        </Button>
        <Button onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
```

### Form Validation with Zod

#### Validation Schema Examples

```typescript
// lib/validations/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  role: z.enum(['user', 'admin'], {
    required_error: 'Role is required',
  }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// lib/validations/xray.ts
export const createInboundSchema = z.object({
  instance_id: z.string().min(1, 'Instance is required'),
  
  protocol: z.enum(['vless', 'vmess', 'trojan', 'shadowsocks'], {
    required_error: 'Protocol is required',
  }),
  
  port: z.number()
    .int('Port must be an integer')
    .min(1, 'Port must be at least 1')
    .max(65535, 'Port must be at most 65535'),
  
  tag: z.string()
    .min(1, 'Tag is required')
    .max(50, 'Tag must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Tag must contain only letters, numbers, hyphens, and underscores'),
  
  settings: z.record(z.unknown()).optional(),
});

export type CreateInboundFormData = z.infer<typeof createInboundSchema>;

// lib/validations/plan.ts
export const createPlanSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  price: z.number()
    .nonnegative('Price must be 0 or greater'),
  
  currency: z.string()
    .length(3, 'Currency must be a 3-letter code')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase letters'),
  
  duration_days: z.number()
    .int('Duration must be an integer')
    .positive('Duration must be greater than 0'),
  
  data_limit_gb: z.number()
    .nonnegative('Data limit must be 0 or greater'),
  
  active: z.boolean().default(true),
});

export type CreatePlanFormData = z.infer<typeof createPlanSchema>;
```

### Toast Notifications

```typescript
// lib/utils/toast.ts (using sonner)
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },

  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};

// Usage in components
async function handleDelete(id: string) {
  toast.promise(
    usersApi.delete(id),
    {
      loading: 'Deleting user...',
      success: 'User deleted successfully',
      error: (err) => err instanceof ApiError ? err.userFriendlyMessage : 'Failed to delete user',
    }
  );
}
```


## Testing Strategy

### Testing Approach

The Full Admin Control Center follows a pragmatic testing strategy focused on:

1. **Type Safety:** TypeScript with strict mode eliminates entire classes of bugs
2. **Manual Testing:** Primary verification method for UI interactions and data flow
3. **Backend Integration Testing:** Backend already has comprehensive test coverage
4. **Runtime Verification:** Error handling and validation provide runtime safety

### Testing Scope

#### What IS Tested

**Type Safety (Automatic):**
- All API responses typed
- All form data typed
- All component props typed
- Zod schemas ensure runtime type safety

**Manual Testing Focus:**
- Complete user workflows (create → list → edit → delete)
- Form validation (client-side and server-side)
- Error handling scenarios
- Authentication flow
- Navigation and routing
- Responsive design on different devices
- Accessibility features (keyboard navigation, screen readers)

**Backend Testing (Already Complete):**
- All business logic tested in Go backend
- Database operations tested
- Authentication and authorization tested
- API endpoints tested

#### What is NOT Tested

- Unit tests for individual components (rely on TypeScript and manual testing)
- Integration tests for UI (backend already tested)
- End-to-end automated tests (manual testing preferred for admin dashboard)
- Property-based testing (not applicable to UI interactions)

### Manual Testing Checklist

#### User Management Testing

```markdown
□ List users page loads with real data
□ Search filters users correctly
□ Create user form validates all fields
□ Create user form submits successfully
□ Created user appears in list
□ Edit user form loads with current data
□ Edit user form updates successfully
□ Change user status (active/inactive/suspended)
□ Change user role (user/admin)
□ Delete user shows confirmation dialog
□ Delete user removes from list
□ Cannot delete self
□ Cannot demote self from admin
□ Validation errors display correctly
□ Backend errors display user-friendly messages
```

#### Session Management Testing

```markdown
□ Sessions list page loads with all active sessions
□ Current session is highlighted
□ Revoke session shows confirmation dialog
□ Revoke session removes from list
□ Revoke all sessions dialog shows count
□ Cannot revoke own session
□ Session details display correctly (IP, user agent, time)
```

#### Xray Instance Management Testing

```markdown
□ Instances list page loads with all instances
□ Instance status badges display correctly
□ Start instance button works
□ Stop instance shows confirmation
□ Stop instance updates status
□ Restart instance works
□ Reload config works
□ Health check displays correctly
□ Stats display correctly
□ Instance detail page loads
□ Auto-refresh updates data
```

#### Xray Inbound Management Testing

```markdown
□ Inbounds list page loads
□ Create inbound form validates
□ Protocol selector works
□ Protocol-specific fields display
□ Create inbound submits successfully
□ Edit inbound form loads data
□ Edit inbound updates successfully
□ Enable/disable toggle works
□ Delete inbound shows confirmation
□ Delete with active clients shows warning
```

#### Xray Client Management Testing

```markdown
□ Clients list page loads
□ Create client form validates
□ Inbound selector works
□ Create client generates config
□ Client config displays (URL/QR code)
□ Enable/disable toggle works
□ Regenerate UUID shows confirmation
□ Regenerate UUID updates client
□ Reprovision client works
□ Delete client shows confirmation
```

#### Server Management Testing

```markdown
□ Servers list page loads
□ Server status badges display correctly
□ Server detail page loads
□ Nodes list displays for server
□ Node health indicators display
□ Filter by country works
□ Filter by status works
```

#### Plan Management Testing

```markdown
□ Plans list page loads
□ Create plan form validates
□ Price validation works
□ Duration validation works
□ Create plan submits successfully
□ Edit plan form loads data
□ Edit plan updates successfully
□ Delete plan shows active subscriptions
□ Delete plan with subscriptions shows warning
□ Delete plan without subscriptions works
```

#### Audit Logs Testing

```markdown
□ Audit logs page loads
□ Pagination works
□ Filter by action works
□ Filter by entity type works
□ Filter by date range works
□ Search works
□ Log detail dialog displays full metadata
□ Export to CSV works
□ Export to JSON works
□ Audit stats display correctly
```

#### Dashboard Testing

```markdown
□ Dashboard loads with real data
□ User count stat card displays correctly
□ Server count stat card displays correctly
□ Plan count stat card displays correctly
□ Xray instances stat card displays correctly
□ System health status displays
□ Activity feed shows recent logs
□ Quick actions work
□ Auto-refresh updates data
□ Click stat card navigates to detail page
```

#### Navigation Testing

```markdown
□ All navigation items display
□ Active route is highlighted
□ Xray submenu expands/collapses
□ Mobile sidebar opens/closes
□ Mobile overlay closes on click outside
□ Escape key closes mobile sidebar
□ Navigation icons display correctly
```

#### Error Handling Testing

```markdown
□ Network error shows friendly message
□ 401 error redirects to login
□ 403 error shows access denied
□ 404 error shows not found
□ 500 error shows server error
□ Validation errors map to form fields
□ Form errors display inline
□ General errors display in alert
□ Success toasts display
□ Error toasts display
```

#### Responsive Design Testing

**Mobile (320px-767px):**
```markdown
□ Sidebar collapses to hamburger menu
□ Tables scroll horizontally
□ Forms stack vertically
□ Buttons are full-width
□ Touch targets are 44px minimum
□ Text is readable
□ No horizontal scroll on pages
```

**Tablet (768px-1023px):**
```markdown
□ Sidebar displays correctly
□ Tables display without horizontal scroll
□ Forms use responsive columns
□ Dashboard cards stack appropriately
```

**Desktop (1024px+):**
```markdown
□ Sidebar is always visible
□ Tables display all columns
□ Forms use multi-column layout
□ Dashboard uses grid layout
□ Content uses maximum space efficiently
```

#### Accessibility Testing

```markdown
□ All interactive elements keyboard accessible
□ Tab order is logical
□ Focus indicators visible
□ Screen reader announces page titles
□ Screen reader announces form errors
□ ARIA labels present on icon buttons
□ Color contrast meets WCAG 2.1 AA
□ Form inputs have associated labels
□ Error messages are associated with inputs
```

### Testing Workflow

**For Each New Feature:**

1. **Development:**
   - Write TypeScript interfaces first
   - Implement component with type safety
   - Add Zod validation schemas
   - Implement error handling

2. **Manual Testing:**
   - Test happy path (success scenario)
   - Test validation errors
   - Test backend errors (401, 403, 404, 500)
   - Test network errors
   - Test on mobile, tablet, desktop
   - Test with keyboard only
   - Test with screen reader (if time permits)

3. **Code Review:**
   - Verify type safety
   - Verify error handling
   - Verify validation logic
   - Verify user-friendly messages
   - Verify accessibility basics

4. **Pre-Deployment Checklist:**
   - All TypeScript errors resolved
   - All manual test cases pass
   - No console errors in browser
   - Backend endpoints verified working
   - Authentication still works
   - Session management still works

### Verification Commands

```bash
# Type check
npm run type-check

# Build check (verifies all imports, types, etc.)
npm run build

# Lint check
npm run lint

# Development server
npm run dev
```


## UI/UX Patterns

### Common UI Patterns

#### 1. List Pages Pattern

```typescript
// Standard list page structure
async function ListPage() {
  const response = await moduleApi.list();
  
  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Module Name"
        description="Manage module resources"
        actions={
          <div className="flex gap-2">
            <RefreshButton />
            <Button asChild>
              <Link href="/admin/module/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Link>
            </Button>
          </div>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Icon}
          title="No items found"
          description="Get started by creating your first item"
          action={
            <Button asChild>
              <Link href="/admin/module/new">Create Item</Link>
            </Button>
          }
        />
      ) : (
        <ModuleTableWithFilters items={items} />
      )}
    </div>
  );
}
```

#### 2. Create/Edit Form Pattern

```typescript
'use client';

export function ModuleForm({ initialData, isEdit }: ModuleFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: initialData || getDefaultValues(),
  });

  const [isPending, startTransition] = useTransition();

  async function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        if (isEdit) {
          await moduleApi.update(initialData.id, data);
          toast.success('Updated successfully');
        } else {
          await moduleApi.create(data);
          toast.success('Created successfully');
        }
        router.push('/admin/module');
        router.refresh();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.userFriendlyMessage);
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields */}
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

#### 3. Confirmation Dialog Pattern

```typescript
'use client';

export function DeleteDialog({ item, onConfirm }: DeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm();
        setOpen(false);
        toast.success('Deleted successfully');
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.userFriendlyMessage);
        }
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{item.name}</strong>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### 4. Data Table Pattern

```typescript
'use client';

export function ModuleTable({ items }: ModuleTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState('');

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          href={`/admin/module/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionsDropdown item={row.original} />,
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, globalFilter: filtering },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search..."
        value={filtering}
        onChange={(e) => setFiltering(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

#### 5. Status Badge Pattern

```typescript
export function StatusBadge({ status }: { status: string }) {
  const variants = {
    active: 'default',
    running: 'default',
    healthy: 'default',
    inactive: 'secondary',
    stopped: 'secondary',
    suspended: 'destructive',
    error: 'destructive',
    unhealthy: 'destructive',
  } as const;

  return (
    <Badge variant={variants[status] || 'secondary'}>
      {status}
    </Badge>
  );
}
```

#### 6. Loading State Pattern

```typescript
// app/admin/[module]/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 7. Empty State Pattern

```typescript
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      </div>
      {action && <div className="pt-4">{action}</div>}
    </div>
  );
}
```

### Responsive Design Patterns

#### Mobile-First Approach

```typescript
// Example: Responsive table that becomes cards on mobile
export function ResponsiveTable({ items }: TableProps) {
  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block">
        <Table>
          {/* Full table structure */}
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="grid gap-4 md:hidden">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {item.name}
                <StatusBadge status={item.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Created: {formatDate(item.created_at)}
              </div>
              <ActionsDropdown item={item} />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
```

#### Responsive Layout Patterns

```typescript
// Grid that adapts to screen size
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Stat cards */}
</div>

// Flex that stacks on mobile
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  {/* Header with actions */}
</div>

// Form that uses single column on mobile, two columns on desktop
<div className="grid gap-4 md:grid-cols-2">
  {/* Form fields */}
</div>
```

### Accessibility Patterns

#### Keyboard Navigation

```typescript
// Ensure all interactive elements are keyboard accessible
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
  onClick={handleAction}
>
  Action
</button>

// Trap focus in modals
export function Modal({ open, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [open]);

  // ...
}
```

#### ARIA Labels

```typescript
// Icon buttons need aria-label
<Button size="icon" aria-label="Close menu">
  <X className="h-4 w-4" />
</Button>

// Status indicators need aria-live
<div aria-live="polite" aria-atomic="true">
  <StatusBadge status={status} />
</div>

// Form errors need aria-describedby
<Input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? 'email-error' : undefined}
/>
{error && (
  <p id="email-error" className="text-sm text-destructive">
    {error}
  </p>
)}
```


## Implementation Roadmap

### Development Phases

#### Phase 1: Complete User Management (Priority: Critical)
**Goal:** Enable full CRUD operations for users

**Tasks:**
1. Implement user update endpoint proxy (`PUT /api/admin/users/:id`)
2. Implement user delete endpoint proxy (`DELETE /api/admin/users/:id`)
3. Create `UserEditForm` component
4. Add edit functionality to user detail page
5. Add delete functionality with confirmation dialog
6. Implement self-modification prevention (cannot delete/demote self)
7. Add validation for all user fields
8. Test complete user lifecycle (create → edit → delete)

**Validation Criteria:**
- Can create users with all required fields
- Can edit user details (name, email, phone)
- Can change user status (active, inactive, suspended)
- Can change user role (user, admin)
- Can delete users with confirmation
- Cannot delete or demote currently logged-in admin
- All validation errors display correctly

---

#### Phase 2: Session Management (Priority: High)
**Goal:** Enable administrators to view and manage user sessions

**Tasks:**
1. Create sessions API endpoints (`lib/api/endpoints/sessions.ts`)
2. Implement session proxy routes:
   - `GET /api/auth/sessions`
   - `DELETE /api/auth/sessions/:id`
   - `POST /api/auth/logout-all`
3. Create session types (`types/session.ts`)
4. Create sessions page (`app/admin/sessions/page.tsx`)
5. Create `SessionsTable` component
6. Create `RevokeSessionDialog` component
7. Create `RevokeAllSessionsDialog` component
8. Highlight current user's session
9. Add navigation item for Sessions
10. Test session management workflow

**Validation Criteria:**
- Sessions list displays all active sessions
- Can revoke individual sessions
- Can revoke all sessions for a user
- Cannot revoke own session
- Session list updates after revocation
- Current session is highlighted

---

#### Phase 3: Xray Instance Management (Priority: High)
**Goal:** Enable Xray instance control (start, stop, restart, health)

**Tasks:**
1. Create Xray types (`types/xray.ts`)
2. Create Xray API endpoints (`lib/api/endpoints/xray.ts`)
3. Implement Xray instances proxy routes (8 routes)
4. Create instances page (`app/admin/xray/instances/page.tsx`)
5. Create instance detail page (`app/admin/xray/instances/[id]/page.tsx`)
6. Create `InstancesTable` component
7. Create `InstanceControlButtons` component (start, stop, restart, reload)
8. Create `InstanceHealthCard` component
9. Create `InstanceStatsCard` component
10. Add Xray navigation section with submenu
11. Test instance control operations

**Validation Criteria:**
- Instances list displays all instances with status
- Can start stopped instances
- Can stop running instances (with confirmation)
- Can restart instances
- Can reload instance configuration
- Health status displays correctly
- Statistics display correctly
- Status updates after control operations

---

#### Phase 4: Xray Inbound Management (Priority: High)
**Goal:** Enable inbound configuration management

**Tasks:**
1. Implement Xray inbounds proxy routes (7 routes)
2. Create inbounds page (`app/admin/xray/inbounds/page.tsx`)
3. Create inbound creation page (`app/admin/xray/inbounds/new/page.tsx`)
4. Create `InboundsTable` component
5. Create `InboundForm` component
6. Create `ProtocolSelector` component
7. Create `ProtocolSettingsFields` component (dynamic based on protocol)
8. Add enable/disable toggle
9. Add delete with confirmation
10. Create validation schema for inbounds
11. Test inbound lifecycle

**Validation Criteria:**
- Can list all inbounds with details
- Can create new inbounds with all protocols
- Protocol-specific settings display correctly
- Can edit existing inbounds
- Can enable/disable inbounds
- Can delete inbounds (with warning if clients exist)
- Validation works for all fields

---

#### Phase 5: Xray Client Management (Priority: High)
**Goal:** Enable client configuration management

**Tasks:**
1. Implement Xray clients proxy routes (8 routes)
2. Create clients page (`app/admin/xray/clients/page.tsx`)
3. Create client creation page (`app/admin/xray/clients/new/page.tsx`)
4. Create `ClientsTable` component
5. Create `ClientForm` component
6. Create `ClientConfigDisplay` component (show connection URL and QR code)
7. Add enable/disable toggle
8. Add regenerate UUID with confirmation
9. Add reprovision client functionality
10. Add delete with confirmation
11. Create validation schema for clients
12. Test client lifecycle

**Validation Criteria:**
- Can list all clients with details
- Can create new clients
- Client configuration displays after creation
- Can enable/disable clients
- Can regenerate client UUID
- Can reprovision clients
- Can delete clients
- Traffic stats display correctly

---

#### Phase 6: Server and Node Management (Priority: Medium)
**Goal:** Enable infrastructure visibility and management

**Tasks:**
1. Create server types (`types/server.ts`)
2. Create server API endpoints (`lib/api/endpoints/servers.ts`)
3. Implement nodes proxy route (`GET /api/nodes`)
4. Enable servers navigation item (remove "disabled" flag)
5. Create servers page (`app/admin/servers/page.tsx`)
6. Create server detail page (`app/admin/servers/[id]/page.tsx`)
7. Create `ServersTable` component
8. Create `ServerCard` component
9. Create `NodesList` component
10. Create `ServerFilters` component (by country, status)
11. Test server and node display

**Validation Criteria:**
- Servers list displays all servers
- Server status badges display correctly
- Can filter servers by country
- Can filter servers by status
- Server detail page shows all information
- Nodes display for each server
- Node health indicators work

---

#### Phase 7: Plan Management (Priority: Medium)
**Goal:** Enable subscription plan CRUD operations

**Tasks:**
1. Create plan types (`types/plan.ts`)
2. Create plan API endpoints (`lib/api/endpoints/plans.ts`)
3. Implement plan proxy routes (5 routes)
4. Enable plans navigation item
5. Create plans page (`app/admin/plans/page.tsx`)
6. Create plan creation page (`app/admin/plans/new/page.tsx`)
7. Create plan edit page (`app/admin/plans/[id]/page.tsx`)
8. Create `PlansTable` component
9. Create `PlanForm` component
10. Create `DeletePlanDialog` (show active subscriptions count)
11. Create validation schema for plans
12. Update dashboard plan count stat card
13. Test plan lifecycle

**Validation Criteria:**
- Can list all plans with details
- Can create new plans
- Can edit existing plans
- Can delete plans (with warning if subscriptions exist)
- Active subscription count displays
- Plan status toggle works
- Dashboard shows correct plan count

---

#### Phase 8: User Subscriptions Display (Priority: Medium)
**Goal:** Show subscription information on user detail pages

**Tasks:**
1. Create subscription types (`types/subscription.ts`)
2. Create subscription API endpoints (`lib/api/endpoints/subscriptions.ts`)
3. Implement subscription proxy route (`GET /api/subscriptions/user/:userId`)
4. Create `UserSubscriptionCard` component
5. Add subscription display to user detail page
6. Handle "no subscription" state
7. Test subscription display

**Validation Criteria:**
- Subscription displays on user detail page
- Shows plan name, dates, status, usage
- Expired subscriptions display in red
- Active subscriptions show remaining days
- "No subscription" state displays correctly
- Link to plans page works

---

#### Phase 9: Comprehensive Audit Logs (Priority: Medium)
**Goal:** Enable full audit log viewing with filtering and export

**Tasks:**
1. Create audit types (`types/audit.ts`)
2. Create audit API endpoints (`lib/api/endpoints/audit.ts`)
3. Implement audit stats proxy route (`GET /api/admin/audit/stats`)
4. Enable logs navigation item
5. Create audit logs page (`app/admin/logs/page.tsx`)
6. Create `AuditLogsTable` component with pagination
7. Create `AuditFilters` component (action, entity, date range)
8. Create `AuditLogDetailDialog` component
9. Create `AuditStatsCards` component
10. Create `ExportLogsButton` component (CSV and JSON export)
11. Implement URL-based filtering and pagination
12. Update dashboard activity feed
13. Test audit log workflow

**Validation Criteria:**
- Can list audit logs with pagination
- Can filter by action type
- Can filter by entity type
- Can filter by actor
- Can filter by date range
- Can search logs
- Log detail dialog shows full metadata
- Can export logs as CSV
- Can export logs as JSON
- Audit stats display correctly
- Dashboard activity feed shows recent logs

---

#### Phase 10: Enhanced System Monitoring (Priority: Low)
**Goal:** Provide detailed system health monitoring

**Tasks:**
1. Create system types (`types/system.ts`)
2. Create system API endpoints (`lib/api/endpoints/system.ts`)
3. Implement system proxy routes (3 new routes):
   - `GET /api/admin/system/database`
   - `GET /api/admin/system/xray`
   - `GET /api/admin/system/version`
4. Create monitoring page (`app/admin/monitoring/page.tsx`)
5. Create `SystemHealthCard` component
6. Create `DatabaseStatusCard` component
7. Create `XraySystemCard` component
8. Create `VersionInfoCard` component
9. Add auto-refresh toggle (30-second interval)
10. Add monitoring navigation item
11. Update dashboard stat cards with real data
12. Test monitoring display

**Validation Criteria:**
- System health status displays correctly
- Database metrics display (connections, response time)
- Xray system metrics display (instances, clients)
- Version information displays
- Auto-refresh updates data every 30 seconds
- Auto-refresh can be toggled on/off
- Dashboard stat cards show real data
- Red indicators for unhealthy systems

---

#### Phase 11: Navigation and Polish (Priority: Low)
**Goal:** Finalize navigation structure and UI polish

**Tasks:**
1. Update navigation configuration with all modules
2. Implement collapsible Xray submenu
3. Add navigation icons for all items
4. Verify active state highlighting
5. Test mobile navigation
6. Add keyboard shortcuts for common actions (optional)
7. Add breadcrumbs to detail pages (optional)
8. Polish loading states across all modules
9. Polish empty states across all modules
10. Verify consistent spacing and typography

**Validation Criteria:**
- All navigation items display correctly
- Xray submenu expands/collapses
- Active route is always highlighted
- Mobile navigation works smoothly
- All icons display correctly
- Loading states are consistent
- Empty states are consistent
- No visual inconsistencies

---

#### Phase 12: Final Testing and Documentation (Priority: Critical)
**Goal:** Comprehensive testing and documentation

**Tasks:**
1. Run through complete manual testing checklist
2. Test all error scenarios
3. Test responsive design on all breakpoints
4. Test keyboard navigation
5. Test with screen reader (basic verification)
6. Verify type safety (no TypeScript errors)
7. Run build verification (`npm run build`)
8. Document environment variables
9. Document deployment process
10. Create user guide for administrators
11. Create developer documentation for future maintenance

**Validation Criteria:**
- All manual test cases pass
- No TypeScript errors
- No console errors in browser
- Build succeeds without warnings
- Responsive design works on all devices
- Keyboard navigation works
- Documentation is complete and accurate

---

### Implementation Notes

**Backend Endpoint Verification:**

Before implementing each module, verify the backend endpoint exists and returns expected data:

```bash
# Test with curl (replace token and URL)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/v1/admin/users

# Expected response format:
{
  "success": true,
  "data": {
    "users": [...],
    "total": 10,
    "offset": 0,
    "limit": 10
  }
}
```

**Incremental Development:**

- Implement one module completely before moving to the next
- Test each module thoroughly before proceeding
- Commit working code after each module
- Create pull requests for code review after each phase

**Code Reuse:**

- Use established patterns from existing user management module
- Reuse components where applicable (tables, forms, dialogs)
- Follow TypeScript types and Zod schemas established
- Maintain consistent error handling across all modules


## Diagrams

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Browser"
        UI[Admin UI Pages]
        ClientComp[Client Components]
    end

    subgraph "Next.js Server"
        ServerComp[Server Components]
        APIProxy[API Proxy Routes]
        Middleware[Auth Middleware]
    end

    subgraph "Go Backend"
        HTTPHandler[HTTP Handlers]
        UseCases[Use Cases]
        Repos[Repositories]
    end

    subgraph "Data"
        PostgreSQL[(PostgreSQL)]
        Xray[Xray Processes]
    end

    UI --> ClientComp
    ClientComp --> APIProxy
    ServerComp --> APIProxy
    APIProxy --> Middleware
    Middleware --> HTTPHandler
    HTTPHandler --> UseCases
    UseCases --> Repos
    Repos --> PostgreSQL
    UseCases --> Xray

    style UI fill:#e1f5ff
    style ClientComp fill:#e1f5ff
    style ServerComp fill:#fff4e1
    style APIProxy fill:#fff4e1
    style Middleware fill:#fff4e1
    style HTTPHandler fill:#e8f5e9
    style UseCases fill:#e8f5e9
    style Repos fill:#e8f5e9
    style PostgreSQL fill:#f3e5f5
    style Xray fill:#f3e5f5
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js API
    participant Backend as Go Backend
    participant DB as PostgreSQL

    Browser->>NextJS: POST /api/auth/login
    NextJS->>Backend: POST /api/v1/auth/login
    Backend->>DB: Verify credentials
    DB-->>Backend: User data
    Backend-->>NextJS: Session token
    NextJS->>Browser: Set httpOnly cookie
    Browser->>NextJS: GET /api/admin/users
    NextJS->>NextJS: Read session cookie
    NextJS->>Backend: GET /api/v1/admin/users<br/>(with Bearer token)
    Backend->>DB: Query users
    DB-->>Backend: Users data
    Backend-->>NextJS: Users response
    NextJS-->>Browser: Users JSON
```

### Data Flow for CRUD Operations

```mermaid
sequenceDiagram
    participant User as Administrator
    participant UI as Admin UI
    participant API as API Proxy
    participant Backend as Go Backend
    participant DB as Database

    Note over User,DB: CREATE Operation
    User->>UI: Fill form & submit
    UI->>UI: Validate (Zod)
    UI->>API: POST /api/admin/users
    API->>Backend: POST /api/v1/admin/users
    Backend->>Backend: Validate & sanitize
    Backend->>DB: INSERT user
    DB-->>Backend: User created
    Backend-->>API: Success + user data
    API-->>UI: Success response
    UI->>User: Show success toast
    UI->>UI: Navigate to list page

    Note over User,DB: READ Operation
    User->>UI: Navigate to list page
    UI->>API: GET /api/admin/users
    API->>Backend: GET /api/v1/admin/users
    Backend->>DB: SELECT users
    DB-->>Backend: Users array
    Backend-->>API: Users data
    API-->>UI: Users response
    UI->>User: Display table

    Note over User,DB: UPDATE Operation
    User->>UI: Edit form & submit
    UI->>UI: Validate (Zod)
    UI->>API: PUT /api/admin/users/:id
    API->>Backend: PUT /api/v1/admin/users/:id
    Backend->>Backend: Validate & sanitize
    Backend->>DB: UPDATE user
    DB-->>Backend: Updated user
    Backend-->>API: Success + user data
    API-->>UI: Success response
    UI->>User: Show success toast
    UI->>UI: Refresh data

    Note over User,DB: DELETE Operation
    User->>UI: Click delete button
    UI->>User: Show confirmation dialog
    User->>UI: Confirm deletion
    UI->>API: DELETE /api/admin/users/:id
    API->>Backend: DELETE /api/v1/admin/users/:id
    Backend->>DB: DELETE user
    DB-->>Backend: Success
    Backend->>DB: INSERT audit_log
    Backend-->>API: Success message
    API-->>UI: Success response
    UI->>User: Show success toast
    UI->>UI: Remove from list
```

### Module Component Hierarchy

```mermaid
graph TB
    subgraph "User Management Module"
        UsersPage[Users Page<br/>Server Component]
        UserDetailPage[User Detail Page<br/>Server Component]
        UserNewPage[New User Page<br/>Server Component]
        
        UsersPage --> UserListTable[User List Table<br/>Client Component]
        UserListTable --> UserRow[User Row]
        UserRow --> ActionsDropdown[Actions Dropdown]
        
        UserDetailPage --> UserDetail[User Detail View<br/>Client Component]
        UserDetail --> EditButton[Edit Button]
        UserDetail --> DeleteDialog[Delete Dialog]
        UserDetail --> SubscriptionCard[Subscription Card]
        
        UserNewPage --> UserForm[User Creation Form<br/>Client Component]
    end

    subgraph "Xray Module"
        XrayInstancesPage[Instances Page<br/>Server Component]
        XrayInstanceDetailPage[Instance Detail<br/>Server Component]
        XrayInboundsPage[Inbounds Page<br/>Server Component]
        XrayClientsPage[Clients Page<br/>Server Component]
        
        XrayInstancesPage --> InstancesTable[Instances Table]
        InstancesTable --> ControlButtons[Control Buttons]
        
        XrayInstanceDetailPage --> HealthCard[Health Card]
        XrayInstanceDetailPage --> StatsCard[Stats Card]
        
        XrayInboundsPage --> InboundsTable[Inbounds Table]
        InboundsPage --> InboundForm[Inbound Form]
        
        XrayClientsPage --> ClientsTable[Clients Table]
        ClientsPage --> ClientForm[Client Form]
        ClientForm --> ConfigDisplay[Config Display]
    end

    style UsersPage fill:#e3f2fd
    style UserDetailPage fill:#e3f2fd
    style UserNewPage fill:#e3f2fd
    style XrayInstancesPage fill:#f3e5f5
    style XrayInstanceDetailPage fill:#f3e5f5
    style XrayInboundsPage fill:#f3e5f5
    style XrayClientsPage fill:#f3e5f5
```

### Navigation Structure

```mermaid
graph LR
    Dashboard[Dashboard<br/>/admin]
    Users[Users<br/>/admin/users]
    Sessions[Sessions<br/>/admin/sessions]
    Servers[Servers<br/>/admin/servers]
    Plans[Plans<br/>/admin/plans]
    Logs[Audit Logs<br/>/admin/logs]
    Monitoring[Monitoring<br/>/admin/monitoring]
    
    Xray[Xray]
    XrayInstances[Instances<br/>/admin/xray/instances]
    XrayInbounds[Inbounds<br/>/admin/xray/inbounds]
    XrayClients[Clients<br/>/admin/xray/clients]
    
    Dashboard --> Users
    Dashboard --> Sessions
    Dashboard --> Xray
    Dashboard --> Servers
    Dashboard --> Plans
    Dashboard --> Logs
    Dashboard --> Monitoring
    
    Xray --> XrayInstances
    Xray --> XrayInbounds
    Xray --> XrayClients
    
    style Dashboard fill:#4caf50,color:#fff
    style Xray fill:#9c27b0,color:#fff
```

### Error Handling Flow

```mermaid
graph TB
    Start[User Action] --> ClientValidation{Client-side<br/>Validation?}
    
    ClientValidation -->|Invalid| ShowFieldError[Show Field Errors]
    ShowFieldError --> End[End]
    
    ClientValidation -->|Valid| SendRequest[Send API Request]
    SendRequest --> APIResponse{API Response}
    
    APIResponse -->|200 Success| Success[Show Success Toast]
    Success --> UpdateUI[Update UI]
    UpdateUI --> End
    
    APIResponse -->|400/422 Validation| MapFieldErrors[Map to Field Errors]
    MapFieldErrors --> ShowFieldError
    
    APIResponse -->|401 Auth| RedirectLogin[Redirect to Login]
    RedirectLogin --> End
    
    APIResponse -->|403 Forbidden| ShowAccessDenied[Show Access Denied]
    ShowAccessDenied --> End
    
    APIResponse -->|404 Not Found| ShowNotFound[Show Not Found]
    ShowNotFound --> End
    
    APIResponse -->|500 Server| ShowServerError[Show Server Error]
    ShowServerError --> End
    
    APIResponse -->|Network Error| ShowNetworkError[Show Network Error]
    ShowNetworkError --> End

    style Start fill:#e3f2fd
    style Success fill:#c8e6c9
    style ShowFieldError fill:#ffccbc
    style RedirectLogin fill:#ffccbc
    style ShowAccessDenied fill:#ffccbc
    style ShowNotFound fill:#ffccbc
    style ShowServerError fill:#ffccbc
    style ShowNetworkError fill:#ffccbc
    style End fill:#f5f5f5
```


## Security Considerations

### Authentication and Authorization

#### Session Management

**Current Implementation:**
- httpOnly cookies store session tokens (prevents XSS attacks)
- Server-side session validation on every request
- Middleware protects all `/admin/*` routes
- Automatic redirect to login on 401 responses

**Security Properties:**
- Session tokens never exposed to JavaScript
- No tokens in localStorage or sessionStorage
- Session cookies have `Secure` flag in production
- Session cookies have `SameSite=Lax` to prevent CSRF

**Improvements to Consider (Future):**
- CSRF token implementation for state-changing operations
- Session timeout on client side (auto-logout after inactivity)
- Multi-factor authentication support
- Session activity logging

#### Authorization

**Backend Enforcement:**
- All `/api/v1/admin/*` endpoints require admin role
- Backend validates role on every request
- Admin UI only provides interface (backend is authoritative)

**UI-Level Protection:**
- Middleware checks session before rendering admin pages
- No authorization logic in UI (defer to backend)
- Graceful handling of 403 Forbidden responses

#### Self-Modification Prevention

**Rules:**
- Administrators cannot delete their own account
- Administrators cannot demote themselves from admin role
- UI prevents these actions client-side
- Backend enforces these rules server-side

**Implementation:**
```typescript
function canDeleteUser(userId: string, currentUserId: string): boolean {
  return userId !== currentUserId;
}

function canChangeUserRole(userId: string, currentUserId: string): boolean {
  return userId !== currentUserId;
}
```

### Input Validation and Sanitization

#### Client-Side Validation (Zod)

**Purpose:** Improve user experience by catching errors before submission

**Not Security:** Client-side validation can be bypassed

**Implementation:**
- All forms use Zod schemas
- Validation runs on blur and on submit
- Errors display inline for immediate feedback

#### Server-Side Validation (Backend)

**Purpose:** Actual security boundary

**Implementation:**
- Backend validates all inputs
- Backend sanitizes all inputs before database operations
- Backend returns 400/422 with field-level errors
- UI maps backend errors to form fields

#### Dangerous Operations

**Confirmation Dialogs Required:**
- Delete user
- Delete plan with active subscriptions
- Stop Xray instance
- Delete inbound with active clients
- Delete client
- Revoke all user sessions
- Regenerate client UUID

**Enhanced Confirmation:**

For critical operations, require typing a confirmation phrase:

```typescript
function DeletePlanDialog({ plan }: { plan: Plan }) {
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = confirmText === plan.name;

  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Plan</AlertDialogTitle>
          <AlertDialogDescription>
            This plan has {plan.active_subscriptions} active subscriptions.
            Type <strong>{plan.name}</strong> to confirm deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type plan name"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={!canConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Data Exposure

#### Sensitive Data Handling

**Passwords:**
- Never sent from backend to UI
- Only sent UI → Backend during user creation
- Forms use `type="password"` inputs
- Passwords not logged in API client

**Session Tokens:**
- Stored in httpOnly cookies only
- Never accessible to JavaScript
- Not logged in API client

**User Data:**
- Only admins can access user management endpoints
- Backend enforces role-based access
- Audit logs record all user data access

#### API Error Messages

**Principle:** Error messages should be helpful but not expose sensitive information

**Good:**
- "Invalid email or password" (during login)
- "This email is already registered" (during user creation)
- "Session expired, please log in again"

**Bad:**
- "User with email user@example.com not found" (exposes user existence)
- "Database connection failed: <connection string>" (exposes infrastructure)
- "SQL query failed: <query>" (exposes database schema)

**Implementation:**
```typescript
// Backend should return generic errors
// UI maps them to user-friendly messages

if (error.status === 401) {
  return "Invalid email or password"; // Don't specify which is wrong
}

if (error.status === 500) {
  return "A server error occurred. Please try again later.";
  // Don't expose: error.details.stack_trace
}
```

### Audit Logging

**Purpose:** Security oversight and forensic analysis

**What is Logged:**
- All user management operations (create, update, delete, status change, role change)
- All Xray management operations (instance control, inbound CRUD, client CRUD)
- All plan management operations (create, update, delete)
- All session revocations
- Login attempts (in backend)

**Log Contents:**
- Timestamp
- Actor (admin user ID and email)
- Action (create_user, delete_client, etc.)
- Entity type (user, xray_instance, plan)
- Entity ID
- IP address
- User agent
- Request metadata (request body for creates/updates)
- Response status (success/failure)

**Log Retention:**
- Logs stored indefinitely in PostgreSQL (or per retention policy)
- Logs are never deleted by admin UI
- Logs are read-only in admin UI

**Log Access:**
- Only admins can view audit logs
- Logs cannot be modified
- Export functionality for compliance reporting

### Rate Limiting

**Note:** Rate limiting is handled by the Go backend, not the Admin UI.

**Backend Responsibilities:**
- Rate limit login attempts (prevent brute force)
- Rate limit API calls per user/IP
- Return 429 Too Many Requests when exceeded

**UI Handling:**
```typescript
if (error.status === 429) {
  return "Too many requests. Please wait and try again.";
}
```

### HTTPS and Transport Security

**Production Requirements:**
- All traffic over HTTPS
- HTTP Strict Transport Security (HSTS) header
- TLS 1.2+ only
- Strong cipher suites

**Development:**
- HTTP acceptable for localhost
- HTTPS recommended for remote development

**Environment Configuration:**
```bash
# Production
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_SITE_URL=https://admin.example.com

# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Content Security Policy (Future Enhancement)

**Recommended CSP Headers:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
```

**Note:** Next.js may require `unsafe-inline` and `unsafe-eval` for development. Tighten for production.

### Dependency Security

**Current Practice:**
- Use npm/yarn for dependency management
- Regularly update dependencies
- Review security advisories

**Recommendations:**
- Run `npm audit` regularly
- Use `npm audit fix` to auto-fix vulnerabilities
- Review dependency licenses
- Minimize third-party dependencies

**Critical Dependencies:**
- Next.js (framework security)
- React (XSS protections)
- Zod (input validation)
- shadcn/ui (component security)


## Deployment and Configuration

### Environment Variables

#### Required Environment Variables

```bash
# .env.local or production environment

# Backend API URL (Go server)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Site URL (for server-side requests)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Session Cookie Name (must match backend)
NEXT_PUBLIC_SESSION_COOKIE_NAME=suproxy_session

# Node Environment
NODE_ENV=development
```

#### Production Environment Variables

```bash
# Production .env

# Backend API URL (HTTPS required)
NEXT_PUBLIC_API_BASE_URL=https://api.suproxy.example.com

# Site URL (HTTPS required)
NEXT_PUBLIC_SITE_URL=https://admin.suproxy.example.com

# Session Cookie Name
NEXT_PUBLIC_SESSION_COOKIE_NAME=suproxy_session

# Node Environment
NODE_ENV=production

# Optional: Analytics, Monitoring
NEXT_PUBLIC_ANALYTICS_ID=UA-XXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Deployment Process

#### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Server runs on http://localhost:3000
# Auto-reloads on file changes
```

#### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Verify build output
ls -la .next/
```

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  admin-ui:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:8080
      - NEXT_PUBLIC_SITE_URL=http://localhost:3000
      - NEXT_PUBLIC_SESSION_COOKIE_NAME=suproxy_session
    depends_on:
      - backend
    networks:
      - suproxy-network

  backend:
    image: suproxy-backend:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://suproxy:password@postgres:5432/suproxy
    depends_on:
      - postgres
    networks:
      - suproxy-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=suproxy
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=suproxy
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - suproxy-network

networks:
  suproxy-network:
    driver: bridge

volumes:
  postgres-data:
```

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_API_BASE_URL
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_SESSION_COOKIE_NAME

# Deploy to production
vercel --prod
```

#### Traditional Server Deployment

```bash
# Build the application
npm run build

# Copy build output to server
scp -r .next/ package.json package-lock.json user@server:/var/www/admin-ui/

# SSH into server
ssh user@server

# Install dependencies (production only)
cd /var/www/admin-ui
npm ci --production

# Start with PM2
pm2 start npm --name "admin-ui" -- start

# Or use systemd
sudo systemctl start admin-ui.service
```

```ini
# /etc/systemd/system/admin-ui.service
[Unit]
Description=Suproxy Admin UI
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/admin-ui
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=NEXT_PUBLIC_API_BASE_URL=https://api.suproxy.example.com
Environment=NEXT_PUBLIC_SITE_URL=https://admin.suproxy.example.com
Environment=NEXT_PUBLIC_SESSION_COOKIE_NAME=suproxy_session

[Install]
WantedBy=multi-user.target
```

### Monitoring and Logging

#### Application Logging

**Development:**
- Console logs for debugging
- Detailed error logs
- API request/response logging

**Production:**
- Structured logging (JSON format)
- Error tracking (Sentry, Datadog)
- Performance monitoring
- User activity tracking (via audit logs)

#### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check Next.js server is responsive
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    return Response.json(status, { status: 200 });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: String(error) },
      { status: 503 }
    );
  }
}
```

**Monitoring Endpoints:**
- `GET /api/health` - Next.js health check
- `GET /api/admin/system/health` - Backend system health (proxied)

**Metrics to Monitor:**
- Response times
- Error rates
- Session creation/expiration rates
- API call volumes
- Backend connectivity
- Database connectivity (via backend)

### Backup and Disaster Recovery

**What to Backup:**
- Database (PostgreSQL) - backend responsibility
- Application configuration (environment variables)
- Custom code changes
- Logs (if stored locally)

**Not Required:**
- Build artifacts (.next/) - regenerated from source
- node_modules/ - installed from package.json
- Temporary files

**Disaster Recovery:**
1. Restore database from backup (backend)
2. Redeploy Admin UI from source code
3. Configure environment variables
4. Verify authentication works
5. Verify backend connectivity
6. Test critical workflows

### Performance Optimization

#### Build Optimization

```javascript
// next.config.js
module.exports = {
  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Compress responses
  compress: true,

  // Configure image optimization
  images: {
    domains: ['api.suproxy.example.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Output standalone build for Docker
  output: 'standalone',

  // Disable telemetry in production
  telemetry: false,
};
```

#### Runtime Optimization

**Server Components:**
- Use Server Components by default (already doing this)
- Fetch data server-side when possible
- Reduce JavaScript sent to client

**Client Components:**
- Use Client Components only when needed
- Dynamic imports for heavy components
- Lazy load modals and dialogs

```typescript
// Lazy load confirmation dialog
const DeleteDialog = dynamic(() => import('./delete-dialog'), {
  loading: () => <Skeleton className="h-40 w-full" />,
});
```

**Caching:**
- Next.js automatic caching for static assets
- Cache API responses with `revalidate` (use sparingly for admin data)
- Browser caching for images and fonts

```typescript
// Example: Revalidate every 5 minutes
export const revalidate = 300;

async function DashboardPage() {
  const stats = await dashboardApi.getStats();
  // ...
}
```

**Database Queries:**
- Backend responsibility
- Proper indexing on frequently queried fields
- Pagination for large result sets

### Scalability Considerations

**Next.js Scaling:**
- Next.js App Router handles most requests server-side
- Can scale horizontally by adding more Next.js instances
- Load balancer distributes traffic
- Session state stored in backend (stateless Next.js)

**Backend Scaling:**
- Backend responsibility
- Admin UI adapts automatically to backend scaling

**Database Scaling:**
- Backend responsibility
- Admin UI performance depends on backend query performance

**CDN Usage:**
- Serve static assets (_next/static) from CDN
- Reduce load on Next.js server
- Improve global performance


## Maintenance and Extensibility

### Adding New Modules

When adding a new administrative module in the future, follow this checklist:

#### 1. Define Types

```typescript
// types/[module].ts
export interface ModuleEntity {
  id: string;
  // ... entity fields
  created_at: string;
  updated_at: string;
}

export interface CreateModuleInput {
  // ... required fields for creation
}

export interface ModuleListResponse {
  items: ModuleEntity[];
  total: number;
  offset: number;
  limit: number;
}
```

#### 2. Create API Client Methods

```typescript
// lib/api/endpoints/[module].ts
export const moduleApi = {
  list: (): Promise<ApiResponse<ModuleListResponse>> =>
    apiClient.get('/api/admin/module'),

  getById: (id: string): Promise<ApiResponse<ModuleEntity>> =>
    apiClient.get(`/api/admin/module/${id}`),

  create: (data: CreateModuleInput): Promise<ApiResponse<ModuleEntity>> =>
    apiClient.post('/api/admin/module', data),

  update: (id: string, data: Partial<CreateModuleInput>): Promise<ApiResponse<ModuleEntity>> =>
    apiClient.put(`/api/admin/module/${id}`, data),

  delete: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/api/admin/module/${id}`),
};
```

#### 3. Create Proxy Routes

```typescript
// app/api/admin/[module]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_CONFIG } from '@/lib/auth/session';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  // Standard proxy implementation
}

export async function POST(request: NextRequest) {
  // Standard proxy implementation
}

// app/api/admin/[module]/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Standard proxy implementation
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Standard proxy implementation
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Standard proxy implementation
}
```

#### 4. Create Validation Schemas

```typescript
// lib/validations/[module].ts
import { z } from 'zod';

export const createModuleSchema = z.object({
  // Define validation rules for each field
  name: z.string().min(1, 'Name is required'),
  // ...
});

export type CreateModuleFormData = z.infer<typeof createModuleSchema>;
```

#### 5. Create Page Components

```typescript
// app/admin/[module]/page.tsx - List page
async function ModulePage() {
  const response = await moduleApi.list();
  return <ModuleTable items={response.data.items} />;
}

// app/admin/[module]/new/page.tsx - Create page
function NewModulePage() {
  return <ModuleForm />;
}

// app/admin/[module]/[id]/page.tsx - Detail/Edit page
async function ModuleDetailPage({ params }: { params: { id: string } }) {
  const response = await moduleApi.getById(params.id);
  return <ModuleDetail item={response.data} />;
}

// app/admin/[module]/loading.tsx
export default function Loading() {
  return <Skeleton />;
}

// app/admin/[module]/error.tsx
'use client';
export default function Error({ error, reset }) {
  return <ErrorDisplay error={error} reset={reset} />;
}
```

#### 6. Create UI Components

```typescript
// components/admin/[module]/module-table.tsx
'use client';
export function ModuleTable({ items }: ModuleTableProps) {
  // Table implementation
}

// components/admin/[module]/module-form.tsx
'use client';
export function ModuleForm({ initialData, isEdit }: ModuleFormProps) {
  // Form implementation
}

// components/admin/[module]/delete-dialog.tsx
'use client';
export function DeleteDialog({ item, onConfirm }: DeleteDialogProps) {
  // Confirmation dialog implementation
}
```

#### 7. Add Navigation Item

```typescript
// lib/utils/navigation.ts
import { NewIcon } from 'lucide-react';

export const navigationItems: NavigationItem[] = [
  // ... existing items
  {
    title: "Module Name",
    href: "/admin/module",
    icon: NewIcon,
  },
];
```

#### 8. Test the Module

- Create: Can create new entities
- Read: Can list and view entities
- Update: Can edit entities
- Delete: Can delete entities
- Validation: Client-side and server-side validation works
- Error handling: Errors display user-friendly messages
- Responsive: Works on mobile, tablet, desktop
- Accessibility: Keyboard navigation works

### Code Organization Best Practices

#### File Structure

```
Admin UI Project Structure
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin pages
│   │   ├── [module]/             # Each module
│   │   │   ├── page.tsx          # List page
│   │   │   ├── loading.tsx       # Loading state
│   │   │   ├── error.tsx         # Error boundary
│   │   │   ├── new/              # Create page
│   │   │   └── [id]/             # Detail/Edit page
│   │   ├── layout.tsx            # Admin layout
│   │   └── page.tsx              # Dashboard
│   ├── api/                      # API proxy routes
│   │   ├── admin/                # Admin endpoints
│   │   │   └── [module]/         # Module proxies
│   │   └── auth/                 # Auth endpoints
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Public home
├── components/                   # React components
│   ├── admin/                    # Admin-specific
│   │   ├── [module]/             # Module components
│   │   └── layout/               # Layout components
│   └── ui/                       # shadcn/ui base
├── lib/                          # Utilities
│   ├── api/                      # API client
│   │   ├── client.ts             # Base client
│   │   └── endpoints/            # API methods
│   ├── utils/                    # Helper functions
│   └── validations/              # Zod schemas
├── types/                        # TypeScript types
│   ├── api.ts                    # API types
│   ├── [module].ts               # Module types
│   └── user.ts                   # User types
└── public/                       # Static assets
```

#### Naming Conventions

**Files:**
- Pages: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Components: `kebab-case.tsx` (e.g., `user-table.tsx`)
- Types: `kebab-case.ts` (e.g., `user-types.ts`)
- API: `kebab-case.ts` (e.g., `users-api.ts`)

**Components:**
- PascalCase for component names (e.g., `UserTable`)
- camelCase for props (e.g., `isLoading`)
- Descriptive names (e.g., `UserCreationForm` not `Form`)

**Functions:**
- camelCase for functions (e.g., `handleSubmit`)
- Verb-first for actions (e.g., `createUser`, `deleteClient`)
- Boolean prefixes: `is`, `has`, `can` (e.g., `isActive`, `hasPermission`)

**Types:**
- PascalCase for interfaces (e.g., `User`, `ApiResponse`)
- Suffix for specific types: `Input`, `Response`, `Props` (e.g., `CreateUserInput`)

#### Code Comments

**When to Comment:**
- Complex business logic
- Non-obvious TypeScript patterns
- Workarounds for limitations
- Backend behavior assumptions

**When NOT to Comment:**
- Self-explanatory code
- Standard patterns
- Type definitions (types are self-documenting)

**Good Comments:**
```typescript
// Backend returns status 409 when email already exists
// We map this to a field-level error for better UX
if (error.status === 409) {
  setFieldErrors({ email: 'This email is already registered' });
}

// Xray client UUID regeneration is irreversible
// Show strong confirmation before proceeding
async function handleRegenerateUuid() {
  const confirmed = await showConfirmation({
    title: 'Regenerate UUID',
    message: 'This will invalidate all existing client configurations.',
    confirmText: 'I understand',
  });
  // ...
}
```

**Bad Comments:**
```typescript
// Set loading to true
setIsLoading(true);

// User interface
interface User {
  // User ID
  id: string;
}
```

### Dependency Management

#### Core Dependencies

**Framework:**
- `next` - Next.js framework
- `react` - React library
- `react-dom` - React DOM

**UI:**
- `@radix-ui/*` - Unstyled accessible components (via shadcn/ui)
- `lucide-react` - Icon library
- `tailwindcss` - Utility-first CSS

**Validation:**
- `zod` - Schema validation
- `@hookform/resolvers` - React Hook Form + Zod integration

**Utilities:**
- `clsx` - Conditional classNames
- `tailwind-merge` - Merge Tailwind classes
- `date-fns` - Date formatting

**Development:**
- `typescript` - Type checking
- `eslint` - Linting
- `prettier` - Code formatting

#### Adding New Dependencies

**Before Adding:**
1. Check if functionality exists in current dependencies
2. Evaluate package size (bundle impact)
3. Check maintenance status (last update, open issues)
4. Review license compatibility
5. Check security advisories

**Evaluation Criteria:**
- Active maintenance (updated within 6 months)
- Good documentation
- TypeScript support
- Small bundle size (<100KB)
- Popular (many downloads, stars)

**Installation:**
```bash
# Add production dependency
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Document reason in commit message
git commit -m "Add package-name for [reason]"
```

### Performance Monitoring

#### Metrics to Track

**Client-Side:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

**Server-Side:**
- API response times
- Page generation times
- Error rates
- Cache hit rates

**Business Metrics:**
- Session duration
- Pages per session
- Most used features
- Error frequency

#### Tools

**Development:**
- Next.js built-in metrics
- Chrome DevTools
- React DevTools
- Lighthouse

**Production:**
- Vercel Analytics (if using Vercel)
- Google Analytics
- Sentry (error tracking)
- Custom logging

### Troubleshooting Guide

#### Common Issues

**Issue: "Authentication required" error on admin pages**
- Check: Session cookie exists in browser
- Check: Backend is running
- Check: `NEXT_PUBLIC_API_BASE_URL` is correct
- Solution: Log in again or restart backend

**Issue: "Cannot connect to server" error**
- Check: Backend is running on correct port
- Check: `NEXT_PUBLIC_API_BASE_URL` matches backend URL
- Check: No CORS issues (should be handled by proxy)
- Solution: Start backend or fix URL configuration

**Issue: TypeScript errors after adding new types**
- Check: Types are exported correctly
- Check: Import paths are correct
- Solution: Restart TypeScript server (`Cmd/Ctrl + Shift + P` > "TypeScript: Restart TS Server")

**Issue: Components not updating after data changes**
- Check: Using `router.refresh()` after mutations
- Check: Using `revalidatePath()` in server actions
- Solution: Add refresh calls after successful operations

**Issue: Styles not applying**
- Check: Tailwind class names are correct
- Check: `globals.css` is imported in root layout
- Check: Build cache is cleared
- Solution: Clear `.next/` folder and rebuild

**Issue: Build failing**
- Check: All TypeScript errors are resolved
- Check: All imports are correct
- Check: Environment variables are set
- Solution: Run `npm run type-check` and fix errors

### Future Enhancements

**Potential Features:**
- Real-time updates (WebSockets or Server-Sent Events)
- Bulk operations (select multiple users/clients for batch actions)
- Advanced filtering and sorting
- Export functionality for all data tables
- Custom admin roles with granular permissions
- Two-factor authentication
- API rate limiting visibility
- Traffic charts and analytics
- Notification system for admin alerts
- Customizable dashboard layout
- Dark/light theme persistence per user
- Keyboard shortcuts for power users

**Architectural Improvements:**
- CSRF protection
- Content Security Policy headers
- Automated integration tests
- Storybook for component documentation
- API response caching strategy
- Optimistic updates for better UX
- Progressive Web App (PWA) support
- Internationalization (i18n) support


## Summary

### Design Document Overview

This design document specifies the technical implementation for expanding the existing Admin Dashboard into a comprehensive Full Admin Control Center. The design maintains the established Next.js architecture while adding 47 new API endpoints and 9 new administrative modules.

### Key Design Decisions

1. **No Backend Modifications:** All business logic remains in the Go backend. The Admin UI serves purely as an interface layer.

2. **Proxy Pattern:** All backend communication flows through Next.js API routes to avoid CORS issues and centralize session management.

3. **Server Components First:** Leverage Next.js Server Components for data fetching, with Client Components only for interactivity.

4. **Type Safety:** Full TypeScript coverage with Zod validation ensures runtime safety.

5. **Consistent Patterns:** Every module follows the same architectural patterns for maintainability.

6. **Progressive Enhancement:** Build incrementally in 12 phases, with each phase fully tested before moving forward.

### Implementation Scope

**New Modules:**
- Complete User CRUD operations
- Session Management (view and revoke sessions)
- Xray Instance Management (27 endpoints)
  - Instance control (start, stop, restart, reload)
  - Inbound configuration CRUD
  - Client configuration CRUD
- Server and Node Management
- Plan Management (CRUD operations)
- Subscription Display
- Comprehensive Audit Logs (filtering, export)
- Enhanced System Monitoring

**Infrastructure:**
- 47 new API proxy routes
- 60+ new TypeScript types
- 40+ new React components
- 10+ new Zod validation schemas
- Updated navigation structure
- Comprehensive error handling
- Responsive design for all modules
- Accessibility features throughout

### Technical Highlights

**Architecture:**
- Next.js 14 App Router with Server and Client Components
- shadcn/ui component library for consistent UI
- Zod for runtime validation
- Type-safe API client with error handling
- Session-based authentication with httpOnly cookies

**Security:**
- No client-side tokens (XSS prevention)
- Session validation on every request
- Self-modification prevention for admins
- Comprehensive audit logging
- User-friendly error messages that don't expose sensitive data

**User Experience:**
- Responsive design (mobile, tablet, desktop)
- Loading states and empty states
- Confirmation dialogs for destructive actions
- Real-time status indicators
- Success/error toast notifications
- Keyboard navigation support
- WCAG 2.1 Level AA color contrast

**Developer Experience:**
- Consistent file structure across modules
- Reusable component patterns
- Clear separation of concerns
- Type safety eliminates entire classes of bugs
- Comprehensive documentation
- Easy to extend with new modules

### Success Criteria

The design will be considered successful when:

1. ✅ All 18 requirements from requirements.md are fully implemented
2. ✅ All 47 backend endpoints are exposed through API proxy routes
3. ✅ Type checking passes without errors (`npm run build`)
4. ✅ All manual test cases pass for each module
5. ✅ Responsive design works on all device sizes
6. ✅ Authentication and session management work correctly
7. ✅ Error handling provides user-friendly messages
8. ✅ Audit logs capture all administrative actions
9. ✅ No modifications were made to the Go backend
10. ✅ Code follows established patterns and conventions

### Next Steps

1. **Review and Approval:** Stakeholders review and approve this design document
2. **Phase 1 Implementation:** Begin with complete user CRUD operations (highest priority)
3. **Iterative Development:** Complete each phase fully before moving to the next
4. **Testing:** Manual testing after each phase using provided checklists
5. **Deployment:** Deploy to production after all phases complete and testing passes

### Maintenance Plan

**Ongoing:**
- Monitor backend API changes and update types accordingly
- Keep dependencies updated (npm audit, security patches)
- Review and update documentation as patterns evolve
- Add new modules following the established patterns

**Future Enhancements:**
- Real-time updates via WebSockets
- Bulk operations for batch actions
- Advanced analytics and reporting
- CSRF protection
- Multi-factor authentication
- Internationalization support

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Implementation

