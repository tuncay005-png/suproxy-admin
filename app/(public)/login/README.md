# Login Page Implementation

## Overview

This directory contains the public login page for the admin dashboard.

## Structure

```
login/
├── page.tsx           # Login page component
├── page.test.tsx      # Login page tests
└── README.md          # This file
```

## Components

### `page.tsx`

The main login page component that:
- Renders a centered card layout
- Displays the LoginForm component
- Provides proper heading structure (h1) for accessibility
- Uses responsive design with proper spacing

### Route Group

This page is part of the `(public)` route group, which means:
- It's accessible at `/login` (the group name doesn't affect the URL)
- It can have different layouts from the main app
- The middleware allows access without authentication

## Authentication Flow

1. User navigates to `/login`
2. Middleware checks if user is already authenticated
3. If authenticated, redirects to `/admin`
4. If not authenticated, displays the login form
5. On successful login, stores token in httpOnly cookie
6. Redirects to `/admin` (or original destination if specified)

## Testing

Run tests with:
```bash
npm test -- "app/(public)/login/page.test.tsx"
```

## Related Files

- `components/admin/auth/login-form.tsx` - The login form component
- `app/middleware.ts` - Handles authentication routing
- `lib/api/endpoints/auth.ts` - API client for authentication
- `lib/schemas/auth.ts` - Validation schema for login credentials

## Requirements Validated

- **1.1**: Login page displays email and password input fields
- **1.2**: Form validation using Zod schema
- **1.3**: Credentials sent to POST /api/v1/auth/login
- **1.4**: Session token stored in httpOnly cookie
- **1.5**: Redirects to /admin on success
- **1.6**: Displays error messages on failure
- **1.7**: Shows loading state during authentication
- **1.8**: No tokens stored in localStorage
