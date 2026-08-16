# Audit Logs Components

This directory contains components for the audit logs module, including the date range picker for filtering logs by date.

## Components

### DateRangePicker

A sophisticated date range selection component that provides an intuitive calendar interface for filtering audit logs.

**Location**: `date-range-picker.tsx`

**Type**: Client Component

#### Features

- **Calendar Popover**: Opens a two-month calendar view for easy date selection
- **Range Selection**: Select start and end dates with visual feedback
- **Smart Formatting**: Automatically sets start date to 00:00:00 and end date to 23:59:59
- **URL State**: Persists selection in URL search params for bookmarking/sharing
- **Clear Function**: Quick button to clear selected dates
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Full keyboard navigation and screen reader support

#### Usage

```tsx
import { DateRangePicker } from '@/components/admin/logs/date-range-picker';

// In your component
<DateRangePicker
  dateRange={{
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2024-01-31T23:59:59.999Z',
  }}
/>
```

#### Props

```typescript
interface DateRangePickerProps {
  dateRange?: {
    start_date?: string;  // ISO date string
    end_date?: string;    // ISO date string
  };
}
```

#### URL Parameters

The component reads from and writes to these URL search params:

- `start_date`: ISO string format (e.g., `2024-01-01T00:00:00.000Z`)
- `end_date`: ISO string format (e.g., `2024-01-31T23:59:59.999Z`)

When dates change, the component also resets `page` to `1` to show filtered results from the beginning.

#### Visual States

1. **Empty State**
   ```
   [📅 Pick a date range]
   ```

2. **Single Date Selected**
   ```
   [📅 Jan 01, 2024]
   ```

3. **Range Selected**
   ```
   [📅 Jan 01, 2024 - Jan 31, 2024] [X]
   ```

#### Implementation Details

**Dependencies**:
- `react-day-picker`: Calendar component
- `date-fns`: Date formatting and manipulation
- `@radix-ui/react-popover`: Accessible popover
- `lucide-react`: Icons

**Date Handling**:
```typescript
// Start date: Beginning of day
const startDate = new Date(range.from);
startDate.setHours(0, 0, 0, 0);

// End date: End of day
const endDate = new Date(range.to);
endDate.setHours(23, 59, 59, 999);
```

**Router Integration**:
```typescript
// Update URL with new dates
const params = new URLSearchParams(searchParams.toString());
params.set('start_date', startDate.toISOString());
params.set('end_date', endDate.toISOString());
params.set('page', '1');
router.push(`/admin/logs?${params.toString()}`);
```

### AuditFilters

Container component that combines action, entity type, and date range filters.

**Location**: `audit-filters.tsx`

**Type**: Client Component

#### Integration

The DateRangePicker is integrated into AuditFilters:

```tsx
<AuditFilters
  currentFilters={{
    action: 'user.create',
    entity_type: 'user',
    start_date: '2024-01-01T00:00:00.000Z',
    end_date: '2024-01-31T23:59:59.999Z',
  }}
/>
```

The filters are arranged in a responsive grid:
- Mobile: 1 column (stacked)
- Tablet: 2 columns
- Desktop: 3 columns (Action | Entity Type | Date Range)

### AuditLogsTable

Displays filtered audit logs with pagination.

**Location**: `audit-logs-table.tsx`

**Type**: Client Component

### AuditStatsCards

Shows statistics about audit log actions.

**Location**: `audit-stats-cards.tsx`

**Type**: Client Component

## File Structure

```
components/admin/logs/
├── README.md                       # This file
├── date-range-picker.tsx          # Date range picker component
├── date-range-picker.test.tsx     # Tests for date range picker
├── audit-filters.tsx              # Filter controls container
├── audit-logs-table.tsx           # Logs table display
├── audit-stats-cards.tsx          # Stats dashboard
└── export-logs-button.tsx         # Export functionality
```

## UI Components Used

The date range picker uses these shadcn/ui components:

- **Calendar** (`components/ui/calendar.tsx`): Date selection interface
- **Popover** (`components/ui/popover.tsx`): Overlay container
- **Button** (`components/ui/button.tsx`): Trigger and clear buttons
- **Label** (`components/ui/label.tsx`): Accessibility labels

## Testing

Run tests for the date range picker:

```bash
npm test -- date-range-picker.test.tsx
```

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- ✅ Keyboard navigation
- ✅ ARIA labels and descriptions
- ✅ Focus indicators
- ✅ Screen reader compatibility
- ✅ Color contrast ratios
- ✅ Touch target sizes (44px minimum)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Documentation

- [Requirements Document](../../../.kiro/specs/full-admin-control-center/requirements.md) - Requirement 9.4
- [Design Document](../../../.kiro/specs/full-admin-control-center/design.md) - Audit Logs Module
- [Task 14.5](../../../.kiro/specs/full-admin-control-center/tasks.md) - Implementation details
