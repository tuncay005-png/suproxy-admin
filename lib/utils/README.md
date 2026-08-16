# Utility Functions

This directory contains reusable utility functions and application constants for the Admin Dashboard.

## Files

### `cn.ts`
Class name utility for merging Tailwind CSS classes with proper precedence.

**Function:** `cn(...inputs: ClassValue[])`

Combines `clsx` for conditional classes and `tailwind-merge` for deduplication.

**Examples:**
```typescript
import { cn } from '@/lib/utils';

// Merge classes
cn("px-2 py-1", "px-4") // "py-1 px-4"

// Conditional classes
cn("text-red-500", isActive && "text-blue-500") // "text-blue-500" if isActive
```

### `format.ts`
Formatting helpers for dates, text, numbers, and file sizes.

**Functions:**

#### Date Formatting
- `formatDate(date, options?)` - Format dates to human-readable strings
- `formatDateTime(date)` - Format dates with time
- `formatRelativeTime(date)` - Format relative time (e.g., "2 hours ago")

#### Text Formatting
- `truncateText(text, maxLength, suffix?)` - Truncate text with ellipsis
- `capitalize(text)` - Capitalize first letter
- `toTitleCase(text)` - Convert to title case

#### Number Formatting
- `formatNumber(value, options?)` - Format numbers with thousands separators
- `formatBytes(bytes, decimals?)` - Format bytes to human-readable sizes

**Examples:**
```typescript
import { formatDate, truncateText, formatBytes } from '@/lib/utils';

formatDate("2024-01-15T10:30:00Z") // "Jan 15, 2024"
truncateText("This is a long text", 10) // "This is a..."
formatBytes(1024) // "1 KB"
```

### `constants.ts`
Application-wide constants for routes, API endpoints, messages, and configuration values.

**Exports:**
- `ROUTES` - Application route paths
- `API_ENDPOINTS` - API endpoint paths
- `COOKIE_NAMES` - Cookie names for session management
- `TOAST_DURATION` - Toast notification durations
- `PAGINATION` - Pagination defaults
- `USER_TABLE_COLUMNS` - Table column identifiers
- `LOADING_STATES` - Loading state constants
- `USER_ROLES` - User role constants
- `USER_STATUSES` - User status constants
- `ERROR_MESSAGES` - Standard error messages
- `SUCCESS_MESSAGES` - Standard success messages
- `FORM_LIMITS` - Form field limits
- `HTTP_STATUS` - HTTP status codes
- `STORAGE_KEYS` - Local storage keys

**Examples:**
```typescript
import { ROUTES, ERROR_MESSAGES, PAGINATION } from '@/lib/utils';

// Navigate to user list
router.push(ROUTES.USERS);

// Display error message
toast.error(ERROR_MESSAGES.NETWORK_ERROR);

// Use pagination defaults
const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
```

### `index.ts`
Barrel export file that re-exports all utilities for convenient imports.

## Testing

All utility functions have comprehensive unit tests. Run tests with:

```bash
npm test                 # Run all tests once
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Open Vitest UI
```

## Usage

Import utilities from the barrel export:

```typescript
import { cn, formatDate, ROUTES, ERROR_MESSAGES } from '@/lib/utils';
```

Or import specific files:

```typescript
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/utils/constants';
```

## Requirements

**Validates: Requirement 9.2** - Separates UI components from business logic by providing reusable utility functions.

## Maintenance

When adding new utilities:
1. Add the function to the appropriate file (`cn.ts`, `format.ts`, or `constants.ts`)
2. Add comprehensive JSDoc comments
3. Export the function in `index.ts`
4. Add unit tests
5. Update this README
