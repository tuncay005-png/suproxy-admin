# Authentication and Session Management

This module provides secure session management utilities for the Admin Dashboard.

## Overview

The authentication system uses **httpOnly cookies** for secure session management, protecting against XSS attacks and ensuring tokens are never accessible to client-side JavaScript.

## Session Cookie Strategy

### Cookie Configuration

- **Cookie Name**: `session_token`
- **httpOnly**: `true` - Prevents client-side JavaScript access (XSS protection)
- **secure**: `true` in production - Ensures cookies are only sent over HTTPS
- **sameSite**: `lax` - Provides CSRF protection while allowing normal navigation
- **path**: `/` - Cookie is available for all routes
- **Expiration**: Defined by backend JWT expiration

### Security Considerations

1. **XSS Protection**: The httpOnly flag prevents malicious scripts from accessing the session token
2. **CSRF Protection**: The sameSite attribute provides protection against cross-site request forgery
3. **Transport Security**: The secure flag ensures tokens are only transmitted over encrypted connections in production
4. **No localStorage**: Session tokens are NEVER stored in localStorage to prevent XSS attacks

## Architecture

- **Server-Side**: Session cookies are set by the backend API on successful authentication
- **Client-Side**: Session utilities provide helper functions for session state management
- **Middleware**: Next.js middleware validates session cookies on protected routes

## Available Utilities

### Constants

#### `SESSION_COOKIE_NAME`
The name of the session cookie (`'session_token'`).

#### `SESSION_COOKIE_CONFIG`
Complete cookie configuration object with all security settings.

```typescript
{
  name: 'session_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}
```

### Session Validation Functions

#### `hasSessionCookie(): boolean`
Check if a session token exists in the request cookies (client-side only).

**Example:**
```typescript
if (hasSessionCookie()) {
  console.log('User is authenticated');
}
```

#### `isSessionExpired(session: Session | null): boolean`
Check if a session has expired.

**Example:**
```typescript
if (isSessionExpired(session)) {
  // Redirect to login
}
```

#### `isValidSessionStructure(session: unknown): session is Session`
Validate session object structure before use.

**Example:**
```typescript
if (isValidSessionStructure(data)) {
  // Process session data safely
}
```

### Session Data Extraction

#### `getSessionUser(session: Session | null): UserInfo | null`
Extract user information from a session.

**Example:**
```typescript
const user = getSessionUser(session);
if (user) {
  console.log(`Welcome, ${user.name}`);
}
```

#### `getSessionExpiration(session: Session | null): Date | null`
Get session expiration as a Date object.

**Example:**
```typescript
const expiresAt = getSessionExpiration(session);
if (expiresAt && expiresAt < new Date()) {
  console.log('Session has expired');
}
```

#### `getSessionTimeRemaining(session: Session | null): number`
Get the time remaining until session expires (in milliseconds).

**Example:**
```typescript
const timeRemaining = getSessionTimeRemaining(session);
console.log(`Session expires in ${Math.floor(timeRemaining / 60000)} minutes`);
```

### Session Helpers

#### `createSession(user: UserInfo, expiresAt: string): Session`
Create a properly structured session object.

**Example:**
```typescript
const session = createSession(userInfo, '2024-12-31T23:59:59Z');
```

#### `formatSessionExpiration(session: Session | null): string`
Format session expiration for display.

**Example:**
```typescript
const expirationText = formatSessionExpiration(session);
// Returns: "Expires at 11:30 PM on 12/31/2024"
```

## Usage Examples

### Basic Authentication Flow

```typescript
import { hasSessionCookie, isSessionExpired } from '@/lib/auth';

// Check if user has a session cookie
if (hasSessionCookie()) {
  // User appears to be authenticated
  // Server-side validation still required
}

// Validate session expiration
if (session && !isSessionExpired(session)) {
  // Session is valid
  const user = getSessionUser(session);
  console.log(`Logged in as: ${user?.email}`);
}
```

### Session Validation in Middleware

```typescript
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

### Creating Session Response

```typescript
import { SESSION_COOKIE_CONFIG } from '@/lib/auth';

// In API route after successful authentication
export async function POST(request: Request) {
  // ... authenticate user ...
  
  const response = NextResponse.json({ success: true });
  
  response.cookies.set(
    SESSION_COOKIE_CONFIG.name,
    token, // JWT token from backend
    {
      httpOnly: SESSION_COOKIE_CONFIG.httpOnly,
      secure: SESSION_COOKIE_CONFIG.secure,
      sameSite: SESSION_COOKIE_CONFIG.sameSite,
      path: SESSION_COOKIE_CONFIG.path,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  );
  
  return response;
}
```

### Clearing Session (Logout)

```typescript
import { SESSION_COOKIE_CONFIG } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear session cookie
  response.cookies.set(SESSION_COOKIE_CONFIG.name, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
```

## Security Requirements Validation

### ✅ Requirement 1.4: Session Storage
- Sessions are stored in httpOnly cookies set by the backend API
- Cookie handling is consistent across all authentication flows

### ✅ Requirement 1.8: Token Storage Security
- Session tokens are NEVER stored in localStorage
- httpOnly flag prevents client-side JavaScript access
- sameSite attribute provides CSRF protection
- secure flag ensures HTTPS-only transmission in production

## Type Definitions

The session utilities use the following TypeScript types:

```typescript
// types/auth.ts
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
```

## Best Practices

1. **Always validate session structure** before using session data:
   ```typescript
   if (isValidSessionStructure(data)) {
     const user = getSessionUser(data);
   }
   ```

2. **Check expiration before use**:
   ```typescript
   if (!isSessionExpired(session)) {
     // Session is valid
   }
   ```

3. **Use server-side validation** for protected routes - never rely solely on client-side checks

4. **Handle expired sessions gracefully**:
   ```typescript
   if (isSessionExpired(session)) {
     // Redirect to login or refresh token
   }
   ```

5. **Never log or expose session tokens** in client-side code

## Testing

To test session management utilities:

1. **Cookie Security**: Inspect cookies in browser DevTools
   - Verify httpOnly flag is set
   - Verify secure flag in production
   - Verify sameSite is 'lax'

2. **Session Validation**: Test with various session states
   - Valid future session
   - Expired session
   - Invalid session structure
   - Null/undefined session

3. **Expiration Logic**: Test time-based expiration
   - Sessions expiring in future
   - Sessions that just expired
   - Sessions with invalid dates

## References

- Requirements: 1.4, 1.8 (Authentication System)
- Design Document: Authentication Flow and Session Management section
- Related Files:
  - `types/auth.ts` - Type definitions
  - `app/middleware.ts` - Route protection
  - `app/api/auth/logout/route.ts` - Logout implementation
