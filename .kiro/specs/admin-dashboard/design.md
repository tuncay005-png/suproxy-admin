# Technical Design Document: Admin Dashboard

## Overview

The Admin Dashboard is a production-grade Next.js application that provides a secure, modern web interface for administrative operations. Built with Next.js 14+ App Router, TypeScript, and Tailwind CSS, it replaces manual API tools like Postman with an intuitive UI for managing users and viewing system statistics.

**Key Design Principles:**
- **Backend Immutability**: The design strictly communicates with existing Go backend endpoints without modifications
- **Modularity**: Each feature module (users, future servers, plans, logs) is self-contained and independently maintainable
- **Extensibility**: Architecture supports seamless addition of new administrative modules
- **Type Safety**: End-to-end TypeScript with runtime validation via Zod
- **Production-Ready**: Implements authentication, error handling, loading states, and responsive design patterns

**Technology Stack:**
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui with lucide-react icons
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Server Components + Client Components pattern
- **HTTP Client**: Fetch API with custom adapter layer

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              App Router Layer (/app)                   │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │   Public    │  │ Auth Layouts │  │ Admin Routes │ │  │
│  │  │   Routes    │  │  & Middleware│  │   (Protected)│ │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Component Layer (React Components)           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │  │
│  │  │  Layout  │  │   Forms  │  │  Data Display      │  │  │
│  │  │Components│  │Components│  │  Components        │  │  │
│  │  └──────────┘  └──────────┘  └────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Business Logic Layer (lib/)                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌────────┐ │  │
│  │  │   Auth   │  │API Client│  │Schemas │  │ Utils  │ │  │
│  │  │ Service  │  │ Adapter  │  │ (Zod)  │  │Helpers │ │  │
│  │  └──────────┘  └──────────┘  └────────┘  └────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
              ┌───────────────────────┐
              │   Go Backend API      │
              │   (Existing Service)  │
              │  /api/v1/auth/login   │
              │  /api/v1/users        │
              └───────────────────────┘
```

### Component Interaction Flow

```
User Action → Page Component → Client Component → API Adapter → Backend
                    ↓                    ↓              ↓
              Server Actions      Form Handler    Error Handler
                    ↓                    ↓              ↓
             Loading State        Validation       Toast/Error UI
                    ↓                    ↓              ↓
               Revalidation         Success State   User Feedback
```

---

## Components and Interfaces

### Folder Structure

```
suproxy-admin/
├── app/
│   ├── (public)/              # Public routes group
│   │   └── login/             # Login page (unauthenticated)
│   │       └── page.tsx
│   ├── admin/                 # Protected admin routes
│   │   ├── layout.tsx         # Admin layout with sidebar/header
│   │   ├── page.tsx           # Dashboard overview page
│   │   ├── users/             # Users module
│   │   │   ├── page.tsx       # User list page
│   │   │   └── new/           # User creation
│   │   │       └── page.tsx
│   │   ├── servers/           # Future: Servers module
│   │   ├── plans/             # Future: Plans module
│   │   ├── logs/              # Future: Logs module
│   │   └── deployments/       # Future: Deployments module
│   ├── api/                   # API routes (for session management)
│   │   └── auth/
│   │       └── logout/
│   │           └── route.ts
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   └── middleware.ts          # Auth middleware
├── components/
│   ├── admin/                 # Admin-specific components
│   │   ├── layout/
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-header.tsx
│   │   │   └── admin-nav.tsx
│   │   ├── users/
│   │   │   ├── user-list-table.tsx
│   │   │   ├── user-creation-form.tsx
│   │   │   └── user-search.tsx
│   │   ├── dashboard/
│   │   │   ├── stat-card.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   └── quick-actions.tsx
│   │   └── auth/
│   │       └── login-form.tsx
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── table.tsx
│       ├── form.tsx
│       ├── toast.tsx
│       ├── skeleton.tsx
│       └── ... (other shadcn components)
├── lib/
│   ├── api/
│   │   ├── client.ts          # Base HTTP client
│   │   ├── adapter.ts         # Response/error adapter
│   │   └── endpoints/
│   │       ├── auth.ts        # Auth endpoint methods
│   │       ├── users.ts       # User endpoint methods
│   │       └── index.ts       # Endpoint exports
│   ├── auth/
│   │   ├── session.ts         # Session management utilities
│   │   └── middleware.ts      # Auth middleware logic
│   ├── schemas/
│   │   ├── auth.ts            # Login validation schemas
│   │   ├── user.ts            # User validation schemas
│   │   └── index.ts           # Schema exports
│   ├── utils/
│   │   ├── cn.ts              # Class name utility
│   │   ├── format.ts          # Formatting helpers
│   │   └── constants.ts       # App constants
│   └── hooks/
│       ├── use-auth.ts        # Auth state hook
│       └── use-toast.ts       # Toast notification hook
├── types/
│   ├── api.ts                 # API request/response types
│   ├── auth.ts                # Auth-related types
│   └── user.ts                # User entity types
├── .env.local                 # Environment variables
└── next.config.ts             # Next.js configuration
```

### Module Organization Pattern

Each feature module follows a consistent pattern:

```
module-name/
├── page.tsx              # Main page (Server Component)
├── loading.tsx           # Loading UI (optional)
├── error.tsx             # Error UI (optional)
└── components/           # Module-specific components
    ├── feature-form.tsx
    ├── feature-table.tsx
    └── feature-card.tsx
```

---

## Data Models

### TypeScript Type Definitions

```typescript
// types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Session {
  user: UserInfo;
  expiresAt: string;
}

// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

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
```

### Zod Validation Schemas

```typescript
// lib/schemas/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// lib/schemas/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'user', 'moderator'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
```

---

## Authentication Flow and Session Management

### Authentication Architecture

```
┌──────────────┐
│  Login Page  │
│  (Public)    │
└──────┬───────┘
       │ 1. User submits credentials
       ▼
┌──────────────────┐
│  Login Form      │
│  - Validation    │
│  - Client State │
└──────┬───────────┘
       │ 2. POST credentials
       ▼
┌────────────────────┐
│  API Adapter       │
│  POST /api/v1/     │
│  auth/login        │
└──────┬─────────────┘
       │ 3. Backend validates
       ▼
┌────────────────────┐
│  Go Backend        │
│  Returns JWT token │
└──────┬─────────────┘
       │ 4. Token received
       ▼
┌────────────────────┐
│  Session Manager   │
│  - Store httpOnly  │
│    cookie          │
│  - Set session     │
└──────┬─────────────┘
       │ 5. Redirect to /admin
       ▼
┌────────────────────┐
│  Middleware        │
│  - Check cookie    │
│  - Validate token  │
└──────┬─────────────┘
       │ 6. Allow access
       ▼
┌────────────────────┐
│  Dashboard Page    │
│  (Protected)       │
└────────────────────┘
```

### Session Management Implementation

**Cookie Strategy:**
- **Name**: `session_token`
- **Attributes**: `httpOnly`, `secure` (production), `sameSite: lax`, `path: /`
- **Storage**: Server-side httpOnly cookies (not localStorage)
- **Expiration**: Defined by backend JWT expiration

**Middleware Logic:**

```typescript
// app/middleware.ts (Conceptual)
export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Protect /admin/* routes
  if (isAdminRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login
  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
```

**Logout Flow:**
```typescript
// app/api/auth/logout/route.ts (Conceptual)
export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear session cookie
  response.cookies.set('session_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
```

---

## API Client Architecture

### Adapter Layer Design

The API adapter provides a centralized, consistent interface for all backend communication:

```typescript
// lib/api/client.ts (Conceptual structure)

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Send cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private async handleError(response: Response): Promise<ApiError> {
    let message = 'An error occurred';
    let details = {};

    try {
      const errorData = await response.json();
      message = errorData.message || message;
      details = errorData;
    } catch {
      message = response.statusText || message;
    }

    return {
      message,
      code: `HTTP_${response.status}`,
      status: response.status,
      details,
    };
  }
}

export const apiClient = new ApiClient();
```

### Endpoint Methods

```typescript
// lib/api/endpoints/auth.ts (Conceptual)
import { apiClient } from '../client';
import type { LoginCredentials, LoginResponse } from '@/types/auth';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse>('/api/v1/auth/login', credentials),
};

// lib/api/endpoints/users.ts (Conceptual)
import { apiClient } from '../client';
import type { User, CreateUserInput } from '@/types/user';

export const usersApi = {
  list: () => apiClient.get<User[]>('/api/v1/users'),
  create: (data: CreateUserInput) =>
    apiClient.post<User>('/api/v1/users', data),
};
```

---

## Component Hierarchy and Reusability

### Layout Component Structure

```
RootLayout (app/layout.tsx)
├── Theme Provider
├── Toast Provider
└── {children}
    ├── Public Routes (app/(public)/...)
    │   └── LoginPage
    │       └── LoginForm (Client Component)
    │
    └── Admin Routes (app/admin/...)
        └── AdminLayout (app/admin/layout.tsx)
            ├── AdminSidebar (Client Component)
            │   ├── Logo
            │   ├── AdminNav
            │   │   └── NavItem[] (dynamic)
            │   └── UserMenu
            ├── AdminHeader (Client Component)
            │   ├── BreadcrumbNav
            │   ├── QuickActions
            │   └── UserAvatar + Logout
            └── Main Content Area
                └── {children} (Page Components)
```

### Reusable Component Patterns

**1. Data Display Components:**
- `StatCard`: Reusable metric display for dashboard
- `DataTable`: Generic table with sorting, filtering
- `EmptyState`: Consistent empty data display
- `ErrorState`: Consistent error display

**2. Form Components:**
- `FormField`: Wrapper with label, error display
- `FormActions`: Submit, cancel button group
- `SearchInput`: Debounced search field

**3. Feedback Components:**
- `LoadingSkeleton`: Content loading placeholder
- `Toast`: Notification system
- `ConfirmDialog`: Confirmation modals

**4. Layout Components:**
- `PageHeader`: Consistent page title + actions
- `Card`: Content container
- `Section`: Logical content grouping

---

## State Management Approach

### Server Components First


The application follows Next.js App Router best practices:

**Server Components (Default):**
- Page components (data fetching)
- Layout components
- Static content display
- Benefits: Reduced JavaScript bundle, better SEO, automatic code splitting

**Client Components (`'use client'`):**
- Interactive forms
- Components with event handlers
- Components using React hooks (useState, useEffect)
- Toast notifications
- Sidebar navigation (for interactivity)

### Data Fetching Strategy

**Pattern: Server Component Data Fetching**
```typescript
// app/admin/users/page.tsx (Conceptual)
import { usersApi } from '@/lib/api/endpoints/users';
import { UserListTable } from '@/components/admin/users/user-list-table';

export default async function UsersPage() {
  // Server-side data fetch
  const users = await usersApi.list();

  return (
    <div>
      <PageHeader title="Users" />
      <UserListTable initialData={users} />
    </div>
  );
}
```

**Pattern: Client-Side Mutations**
```typescript
// components/admin/users/user-creation-form.tsx (Conceptual)
'use client';

export function UserCreationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    try {
      await usersApi.create(data);
      toast.success('User created successfully');
      router.push('/admin/users');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ... form render
}
```

### State Management Guidelines

- **No Global State Library**: Use React Server Components + URL state + forms
- **URL as State**: Search filters, pagination in query params
- **Form State**: React Hook Form manages form state
- **Server State**: Fetch in Server Components, revalidate with `revalidatePath()`
- **UI State**: Local useState for modals, dropdowns, toggles

---

## Routing and Middleware Strategy

### Route Organization

**Public Routes:**
- `/login` - Login page (unauthenticated)
- `/` - Redirect to `/admin` or `/login` based on auth

**Protected Routes (all under `/admin`):**
- `/admin` - Dashboard overview
- `/admin/users` - User list
- `/admin/users/new` - Create user
- `/admin/servers` - (Future) Server management
- `/admin/plans` - (Future) Plans management
- `/admin/logs` - (Future) Log viewer
- `/admin/deployments` - (Future) Deployment management

### Middleware Implementation

**Matcher Pattern:**
```typescript
export const config = {
  matcher: [
    '/admin/:path*',  // Protect all admin routes
    '/login',         // Handle login redirect
  ],
};
```

**Logic Flow:**
1. Check for session cookie on protected routes
2. Redirect unauthenticated users to `/login`
3. Redirect authenticated users from `/login` to `/admin`
4. Allow valid requests to proceed

### Dynamic Navigation

The sidebar navigation is data-driven for easy extension:

```typescript
// lib/utils/navigation.ts (Conceptual)
import { Home, Users, Server, CreditCard, FileText, Archive } from 'lucide-react';

export const navigationItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Servers',
    href: '/admin/servers',
    icon: Server,
    disabled: true, // Future module
  },
  {
    title: 'Plans',
    href: '/admin/plans',
    icon: CreditCard,
    disabled: true, // Future module
  },
  {
    title: 'Logs',
    href: '/admin/logs',
    icon: FileText,
    disabled: true, // Future module
  },
  {
    title: 'Deployments',
    href: '/admin/deployments',
    icon: Archive,
    disabled: true, // Future module
  },
];
```

---

## Error Handling Patterns

### Error Boundary Strategy

**Global Error Boundary:**
```typescript
// app/admin/error.tsx (Conceptual)
'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Page-Level Error Handling:**
Each page can have its own `error.tsx` for specific handling.

### API Error Handling

**Error Classification:**
```typescript
// lib/api/adapter.ts (Conceptual)
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isValidationError() {
    return this.status === 422;
  }

  get isServerError() {
    return this.status >= 500;
  }
}
```

**Error Display Patterns:**

1. **Toast Notifications** (transient errors):
   - Form submission errors
   - Mutation failures
   - Success confirmations

2. **Inline Error Messages** (field-level):
   - Form validation errors
   - Real-time input feedback

3. **Error States** (page-level):
   - Data fetching failures
   - Empty results
   - Network connectivity issues

4. **Console Logging** (debugging):
   - Detailed error objects
   - Stack traces
   - Request/response data

---

## UI/UX Patterns

### Loading States

**Skeleton Screens:**
```typescript
// app/admin/users/loading.tsx (Conceptual)
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

**Component-Level Loading:**
```typescript
// Button loading state
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Submitting...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### Empty States

```typescript
// components/admin/users/empty-state.tsx (Conceptual)
export function UsersEmptyState() {
  return (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No users found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating a new user
      </p>
      <Button className="mt-4" asChild>
        <Link href="/admin/users/new">Create User</Link>
      </Button>
    </div>
  );
}
```

### Error States

```typescript
// components/admin/error-state.tsx (Conceptual)
export function ErrorState({ 
  error, 
  retry 
}: { 
  error: ApiError; 
  retry?: () => void;
}) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message}
      </p>
      {retry && (
        <Button className="mt-4" onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
```

### Responsive Design Strategy

**Breakpoint System (Tailwind CSS):**
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

**Layout Adaptations:**
- **Mobile**: Collapsible sidebar, stacked forms
- **Tablet**: Compact sidebar, 2-column grids
- **Desktop**: Full sidebar, multi-column layouts

**Component Responsiveness:**
```typescript
// Example: Responsive table
<div className="overflow-x-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Email</TableHead>
        <TableHead className="hidden md:table-cell">Name</TableHead>
        <TableHead className="hidden lg:table-cell">Role</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  </Table>
</div>
```

---

## Extensibility Mechanisms

### Adding New Modules

To add a new administrative module (e.g., "Servers"):

**1. Create Route Structure:**
```
app/admin/servers/
├── page.tsx           # List page
├── new/
│   └── page.tsx       # Creation page
├── [id]/
│   ├── page.tsx       # Detail page
│   └── edit/
│       └── page.tsx   # Edit page
└── loading.tsx        # Loading state
```

**2. Add API Endpoints:**
```typescript
// lib/api/endpoints/servers.ts
export const serversApi = {
  list: () => apiClient.get<Server[]>('/api/v1/servers'),
  get: (id: string) => apiClient.get<Server>(`/api/v1/servers/${id}`),
  create: (data: CreateServerInput) =>
    apiClient.post<Server>('/api/v1/servers', data),
  update: (id: string, data: UpdateServerInput) =>
    apiClient.put<Server>(`/api/v1/servers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/v1/servers/${id}`),
};
```

**3. Define Types:**
```typescript
// types/server.ts
export interface Server {
  id: string;
  name: string;
  ipAddress: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
}

export interface CreateServerInput {
  name: string;
  ipAddress: string;
}
```

**4. Create Validation Schema:**
```typescript
// lib/schemas/server.ts
export const createServerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ipAddress: z.string().ip('Invalid IP address'),
});
```

**5. Build Components:**
```
components/admin/servers/
├── server-list-table.tsx
├── server-creation-form.tsx
├── server-card.tsx
└── server-status-badge.tsx
```

**6. Update Navigation:**
```typescript
// lib/utils/navigation.ts
{
  title: 'Servers',
  href: '/admin/servers',
  icon: Server,
  disabled: false, // Enable the module
}
```

### Extension Points

**Custom Hooks Pattern:**
```typescript
// lib/hooks/use-server-list.ts
export function useServerList() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      const data = await serversApi.list();
      setServers(data);
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { servers, isLoading, error, refresh };
}
```

---

## Correctness Properties

This section defines formal correctness properties that the Admin Dashboard must maintain across all operations. These properties serve as invariants that can be verified through testing to ensure system reliability and correctness.

### Property 1: Authentication State Consistency

*For any* user session state, when a user is authenticated, all protected routes SHALL be accessible, and when a user is not authenticated, all protected routes SHALL redirect to the login page.

**Validates: Requirements 1.4, 2.1, 2.3, 2.5**

**Rationale:** This property ensures the authentication system maintains consistent state across the application. There should never be a scenario where an authenticated user cannot access protected routes, or where an unauthenticated user can access protected content.

### Property 2: Session Cookie Security

*For any* authentication flow, session tokens SHALL only be stored in httpOnly cookies with appropriate security attributes (secure, sameSite), and SHALL never be exposed to client-side JavaScript.

**Validates: Requirements 1.8**

**Rationale:** This property enforces security best practices by preventing XSS attacks from accessing session tokens. The httpOnly flag ensures tokens are inaccessible to JavaScript, protecting against common web vulnerabilities.

### Property 3: Form Validation Consistency

*For any* form submission, client-side validation SHALL match server-side validation rules, and all invalid inputs SHALL be rejected before submission to the backend.

**Validates: Requirements 8.3, 8.4, 8.6, 8.7**

**Rationale:** This property ensures users receive immediate feedback for invalid inputs and prevents unnecessary network requests. Validation consistency between client and server prevents edge cases where one accepts data the other rejects.

### Property 4: API Error Handling Completeness

*For any* API request, if the backend returns an error response, the system SHALL display a user-friendly error message and preserve user input for correction.

**Validates: Requirements 10.1, 10.2, 10.5**

**Rationale:** This property ensures users are never left in an ambiguous state when operations fail. Preserving input prevents frustration from re-entering data, and clear error messages enable users to correct issues.

### Property 5: Loading State Visibility

*For any* asynchronous operation (authentication, data fetching, mutations), a loading indicator SHALL be displayed until the operation completes or fails.

**Validates: Requirements 11.1, 11.5, 11.6**

**Rationale:** This property ensures users always have visual feedback during operations, preventing confusion about whether the system is processing their request.

### Property 6: Route Protection Enforcement

*For any* navigation attempt to a protected route, the middleware SHALL verify session validity before allowing access, and SHALL redirect invalid sessions to the login page.

**Validates: Requirements 2.1, 2.2, 2.3**

**Rationale:** This property ensures authentication is enforced at the infrastructure level (middleware), not just at the component level, preventing unauthorized access through direct URL manipulation.

### Property 7: Data Freshness After Mutations

*For any* successful create, update, or delete operation, the affected data views SHALL be refreshed to reflect the new state.

**Validates: Requirements 4.4, 5.5**

**Rationale:** This property ensures the UI always displays current data after mutations, preventing stale data from misleading administrators.

### Property 8: Type Safety Across Boundaries

*For all* API interactions, request and response data SHALL conform to defined TypeScript interfaces validated by Zod schemas at runtime.

**Validates: Requirements 9.3, 9.4**

**Rationale:** This property ensures type safety extends beyond compile-time checks to runtime validation, catching unexpected data structures from the backend before they cause runtime errors.

---

## Error Handling

This section consolidates and expands upon the error handling patterns outlined throughout the design, providing a comprehensive strategy for managing failures at every layer of the application.

### Error Classification System

The application categorizes errors into distinct types for appropriate handling:

**1. Authentication Errors (401, 403)**
- **Trigger**: Invalid credentials, expired sessions, insufficient permissions
- **Handling**: Redirect to login page, clear session cookies, display auth-specific error messages
- **User Experience**: "Your session has expired. Please log in again."

**2. Validation Errors (422)**
- **Trigger**: Invalid form input, schema validation failures
- **Handling**: Display field-level error messages inline with the form
- **User Experience**: "Email address is invalid" (shown below the email field)

**3. Network Errors (Timeout, No Connection)**
- **Trigger**: Failed fetch requests, timeouts, offline state
- **Handling**: Display connectivity error message with retry option
- **User Experience**: "Unable to connect to the server. Please check your connection and try again."

**4. Server Errors (500-599)**
- **Trigger**: Backend service failures, unhandled exceptions
- **Handling**: Display generic error message, log detailed error for debugging
- **User Experience**: "Something went wrong on our end. Please try again later."

**5. Client Errors (400, 404)**
- **Trigger**: Bad requests, missing resources
- **Handling**: Display specific error message from backend if available
- **User Experience**: "User not found" or "Invalid request parameters"

### Error Handling by Layer

**Middleware Layer:**
```typescript
// Session validation errors
if (!sessionToken || !isValidToken(sessionToken)) {
  // Redirect to login instead of showing error page
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**API Client Layer:**
```typescript
// Centralized error transformation
private async handleError(response: Response): Promise<ApiError> {
  let message = 'An error occurred';
  let details = {};

  try {
    const errorData = await response.json();
    message = errorData.message || this.getDefaultMessage(response.status);
    details = errorData;
  } catch {
    message = this.getDefaultMessage(response.status);
  }

  // Log detailed error for debugging
  console.error('[API Error]', {
    status: response.status,
    url: response.url,
    message,
    details,
  });

  return new ApiError(message, response.status, `HTTP_${response.status}`, details);
}

private getDefaultMessage(status: number): string {
  if (status >= 500) return 'Server error. Please try again later.';
  if (status === 404) return 'Resource not found.';
  if (status === 401) return 'Authentication required.';
  if (status === 403) return 'Access denied.';
  if (status === 422) return 'Invalid input. Please check your data.';
  return 'An error occurred. Please try again.';
}
```

**Component Layer:**
```typescript
// Page-level error boundaries
// app/admin/users/error.tsx
'use client';

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Users Page Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Failed to load users</h2>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        {error.message || 'An unexpected error occurred while loading the user list.'}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
```

**Form-Level Error Handling:**
```typescript
// Form submission with error preservation
const onSubmit = async (data: CreateUserFormData) => {
  setIsSubmitting(true);
  try {
    await usersApi.create(data);
    toast.success('User created successfully');
    router.push('/admin/users');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isValidationError) {
        // Map backend validation errors to form fields
        Object.entries(error.details?.fields || {}).forEach(([field, message]) => {
          setError(field as keyof CreateUserFormData, {
            type: 'server',
            message: message as string,
          });
        });
      } else {
        // Display general error as toast
        toast.error(error.message);
      }
    } else {
      toast.error('An unexpected error occurred');
    }
    // Form input is automatically preserved by React Hook Form
  } finally {
    setIsSubmitting(false);
  }
};
```

### Error Recovery Mechanisms

**1. Automatic Retry:**
```typescript
// For transient network errors
const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error instanceof ApiError && error.isNetworkError) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};
```

**2. User-Initiated Retry:**
- All error states include a "Try Again" button
- Retry button re-invokes the failed operation
- Form submissions preserve user input for correction

**3. Graceful Degradation:**
- Dashboard displays cached data when fetch fails
- Non-critical widgets show error state without blocking page
- Statistics show "N/A" instead of failing entire page

### Error Logging Strategy

**Development Environment:**
```typescript
console.error('[Error Category]', {
  message: error.message,
  stack: error.stack,
  context: { userId, route, timestamp },
  requestData: sanitizedRequest,
  responseData: sanitizedResponse,
});
```

**Production Environment:**
- Console logging for client-side debugging
- Consider integration with error tracking service (e.g., Sentry) in future
- Sanitize sensitive data (passwords, tokens) before logging

---

## Testing Strategy

This section outlines a comprehensive testing approach for the Admin Dashboard, balancing unit tests, integration tests, and end-to-end tests to ensure correctness, reliability, and maintainability.

### Testing Philosophy

The Admin Dashboard is primarily a UI/CRUD application with minimal algorithmic complexity, making it **NOT suitable for property-based testing**. The testing strategy focuses on:

1. **Example-Based Unit Tests**: Verify component behavior with concrete test cases
2. **Integration Tests**: Validate API client interactions with mocked backend
3. **E2E Tests**: Verify critical user workflows end-to-end
4. **Visual Regression Tests**: Ensure UI consistency across changes (future consideration)

### Testing Pyramid

```
           /\
          /  \
         / E2E \                    (Few, critical paths)
        /--------\
       /          \
      / Integration \              (Moderate, API interactions)
     /--------------\
    /                \
   /   Unit Tests     \            (Many, component logic)
  /--------------------\
```

**Distribution:**
- **Unit Tests**: ~70% (component logic, utilities, validators)
- **Integration Tests**: ~20% (API client, auth flows, data fetching)
- **E2E Tests**: ~10% (critical user workflows)

### Technology Stack

**Framework**: Vitest (fast, ESM-native, TypeScript support)
**React Testing**: React Testing Library (user-centric testing)
**Mocking**: MSW (Mock Service Worker) for API mocking
**E2E**: Playwright (cross-browser, reliable, modern)
**Coverage**: Vitest coverage with Istanbul

### Unit Testing Strategy

**Component Tests:**

Each interactive component should have unit tests covering:
- Rendering with different prop combinations
- User interactions (clicks, form inputs, keyboard events)
- Conditional rendering logic
- Error states, loading states, empty states

**Example Test Structure:**
```typescript
// components/admin/users/user-creation-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { UserCreationForm } from './user-creation-form';

describe('UserCreationForm', () => {
  it('renders all form fields', () => {
    render(<UserCreationForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it('displays validation errors for invalid email', async () => {
    render(<UserCreationForm />);
    const emailInput = screen.getByLabelText(/email/i);
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab(); // Trigger blur validation
    
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it('disables submit button during submission', async () => {
    const onSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<UserCreationForm onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  it('displays success toast on successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const mockToast = vi.fn();
    render(<UserCreationForm onSubmit={onSubmit} toast={mockToast} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'user');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      type: 'success',
      message: expect.stringContaining('created'),
    }));
  });

  it('preserves form input when submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'));
    render(<UserCreationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait for error
    await screen.findByText(/error/i);
    
    // Input should still contain the value
    expect(emailInput).toHaveValue('test@example.com');
  });
});
```

**Utility Function Tests:**
```typescript
// lib/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatUserRole, truncateText } from './format';

describe('formatDate', () => {
  it('formats ISO date strings to readable format', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toBe('Jan 15, 2024');
  });

  it('handles invalid dates gracefully', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
  });
});

describe('formatUserRole', () => {
  it('capitalizes role names', () => {
    expect(formatUserRole('admin')).toBe('Admin');
    expect(formatUserRole('moderator')).toBe('Moderator');
  });
});
```

**Validation Schema Tests:**
```typescript
// lib/schemas/user.test.ts
import { describe, it, expect } from 'vitest';
import { createUserSchema } from './user';

describe('createUserSchema', () => {
  it('validates correct user data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user',
    };
    expect(() => createUserSchema.parse(validData)).not.toThrow();
  });

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
      name: 'Test User',
      role: 'user',
    };
    expect(() => createUserSchema.parse(invalidData)).toThrow(/invalid email/i);
  });

  it('rejects short passwords', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'short',
      name: 'Test User',
      role: 'user',
    };
    expect(() => createUserSchema.parse(invalidData)).toThrow(/at least 8 characters/i);
  });

  it('rejects invalid roles', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'superadmin', // Invalid role
    };
    expect(() => createUserSchema.parse(invalidData)).toThrow(/invalid role/i);
  });
});
```

### Integration Testing Strategy

**API Client Tests with MSW:**

```typescript
// lib/api/endpoints/users.test.ts
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { usersApi } from './users';
import type { User } from '@/types/user';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'user1@example.com',
    name: 'User One',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    email: 'user2@example.com',
    name: 'User Two',
    role: 'user',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    isActive: true,
  },
];

const server = setupServer(
  http.get('/api/v1/users', () => {
    return HttpResponse.json(mockUsers);
  }),
  http.post('/api/v1/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: '3',
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('usersApi', () => {
  it('fetches user list successfully', async () => {
    const users = await usersApi.list();
    expect(users).toEqual(mockUsers);
  });

  it('creates a new user successfully', async () => {
    const newUser = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      role: 'user' as const,
    };
    
    const created = await usersApi.create(newUser);
    
    expect(created).toMatchObject({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });
    expect(created.id).toBeDefined();
  });

  it('handles API errors correctly', async () => {
    server.use(
      http.get('/api/v1/users', () => {
        return HttpResponse.json(
          { message: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    await expect(usersApi.list()).rejects.toThrow(/server error/i);
  });

  it('handles network errors correctly', async () => {
    server.use(
      http.get('/api/v1/users', () => {
        return HttpResponse.error();
      })
    );

    await expect(usersApi.list()).rejects.toThrow();
  });
});
```

**Authentication Flow Tests:**
```typescript
// lib/auth/session.test.ts
import { describe, it, expect, vi } from 'vitest';
import { login, logout, getSession, isAuthenticated } from './session';

describe('Authentication', () => {
  it('stores session after successful login', async () => {
    const mockResponse = {
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'admin' },
    };

    // Mock successful login
    const result = await login({ email: 'test@example.com', password: 'password' });
    
    expect(result).toEqual(mockResponse);
    expect(await isAuthenticated()).toBe(true);
    expect(await getSession()).toMatchObject(mockResponse.user);
  });

  it('clears session on logout', async () => {
    // Setup authenticated session
    await login({ email: 'test@example.com', password: 'password' });
    expect(await isAuthenticated()).toBe(true);
    
    // Logout
    await logout();
    
    expect(await isAuthenticated()).toBe(false);
    expect(await getSession()).toBeNull();
  });
});
```

### End-to-End Testing Strategy

**Critical User Workflows:**

1. **Authentication Flow** (login, access protected routes, logout)
2. **User List Flow** (view users, search, refresh)
3. **User Creation Flow** (navigate to form, fill, submit, verify creation)

**Example E2E Test:**
```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin-password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should display user list', async ({ page }) => {
    await page.click('a[href="/admin/users"]');
    await page.waitForURL('/admin/users');
    
    // Verify table is displayed
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Verify headers
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
  });

  test('should create a new user', async ({ page }) => {
    await page.click('a[href="/admin/users"]');
    await page.click('a[href="/admin/users/new"]');
    await page.waitForURL('/admin/users/new');
    
    // Fill form
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'secure-password-123');
    await page.fill('[name="name"]', 'New User');
    await page.selectOption('[name="role"]', 'user');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success (toast or redirect)
    await expect(page.locator('text=created successfully')).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/admin/users/new');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation errors
    await expect(page.locator('text=email address')).toBeVisible();
    await expect(page.locator('text=password')).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Type in search
    await page.fill('[placeholder*="search" i]', 'john');
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const rows = page.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);
    
    // All visible rows should contain "john"
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/john/i);
    }
  });
});
```

### Test Coverage Goals

**Coverage Targets:**
- **Overall**: 80% code coverage
- **Critical Paths** (auth, API client): 90%+ coverage
- **UI Components**: 70%+ coverage
- **Utilities**: 95%+ coverage

**Coverage Commands:**
```bash
# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # E2E tests only
```

### Testing Best Practices

1. **Test User Behavior, Not Implementation**: Focus on what users see and do, not internal state
2. **Keep Tests Independent**: Each test should set up its own data and clean up
3. **Use Meaningful Test Names**: Describe what is being tested and expected outcome
4. **Mock External Dependencies**: Use MSW for API calls, mock environment variables
5. **Test Error Scenarios**: Don't just test happy paths, verify error handling
6. **Maintain Test Speed**: Unit tests should run in milliseconds, integration tests in seconds
7. **Run Tests in CI/CD**: Automate testing on every push and pull request

### Future Testing Enhancements

1. **Visual Regression Testing**: Integrate Percy or Chromatic for UI consistency checks
2. **Accessibility Testing**: Add axe-core for automated a11y checks
3. **Performance Testing**: Add Lighthouse CI for performance regression detection
4. **Contract Testing**: If backend API changes frequently, consider Pact for API contract testing

---

