# Logout API Route

## Endpoint

`POST /api/auth/logout`

## Description

This endpoint handles user logout by clearing the session cookie. It ensures secure logout by setting the `session_token` cookie to an empty value with an expired date.

## Usage

### Client-Side JavaScript

```typescript
// Example: Logout function
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Important: Send cookies
    });

    const data = await response.json();
    
    if (data.success) {
      // Redirect to login page
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

### React Component

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Logged out successfully');
        router.push('/login');
      }
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

## Response

### Success Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Status Code:** `200 OK`

## Security

The endpoint implements the following security measures:

- **httpOnly Cookie**: Prevents client-side JavaScript from accessing the session token
- **Secure Flag**: In production, ensures cookies are only sent over HTTPS
- **SameSite Protection**: Prevents CSRF attacks with `sameSite: lax` attribute
- **Immediate Expiration**: Sets cookie expiration to epoch (Jan 1, 1970) to invalidate immediately
- **Consistent Configuration**: Uses the same cookie configuration as login for consistency

## Cookie Details

The endpoint clears the following cookie:

- **Name:** `session_token`
- **Value:** Empty string
- **httpOnly:** `true`
- **secure:** `true` (in production)
- **sameSite:** `lax`
- **path:** `/`
- **expires:** `Thu, 01 Jan 1970 00:00:00 GMT`

## Testing

Run the test suite with:

```bash
npm test -- app/api/auth/logout/route.test.ts
```

## Integration

This endpoint is used by:

1. **Admin Header Component** - Logout button in the header
2. **Navigation Components** - User menu logout option
3. **Session Timeout Handlers** - Automatic logout on session expiration

## Related Files

- `lib/auth/session.ts` - Session management utilities and cookie configuration
- `app/middleware.ts` - Authentication middleware that checks for session cookies
- `types/auth.ts` - Authentication type definitions

## Requirements

This implementation satisfies:

- **Requirement 2.4**: THE Authentication_System SHALL provide a logout function that clears the Session
- **Requirement 2.5**: WHEN the user invokes logout, THE Authentication_System SHALL redirect them to /admin/login
