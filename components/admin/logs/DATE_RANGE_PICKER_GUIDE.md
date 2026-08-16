# Date Range Picker - User Guide

## Visual Overview

The Date Range Picker provides an intuitive calendar interface for filtering audit logs by date range.

## Component Appearance

### Default State (No dates selected)
```
┌─────────────────────────────────────────────┐
│ 📅 Pick a date range                       │
└─────────────────────────────────────────────┘
```

### Date Range Selected
```
┌─────────────────────────────────────────────┬─────┐
│ 📅 Jan 01, 2024 - Jan 31, 2024            │  ✕  │
└─────────────────────────────────────────────┴─────┘
```

### Calendar Popover (When opened)
```
┌────────────────────────────────────────────────────────────┐
│  December 2024            │  January 2025                   │
├────────────────────────────────────────────────────────────┤
│ Su Mo Tu We Th Fr Sa      │ Su Mo Tu We Th Fr Sa           │
│  1  2  3  4  5  6  7      │           1  2  3  4           │
│  8  9 10 11 12 13 14      │  5  6  7  8  9 10 11           │
│ 15 16 17 18 19 20 21      │ 12 13 14 15 16 17 18           │
│ 22 23 24 25 26 27 28      │ 19 20 21 22 23 24 25           │
│ 29 30 31                  │ 26 27 28 29 30 31              │
└────────────────────────────────────────────────────────────┘
```

## How to Use

### Step 1: Click the Date Range Button
Click the button showing "Pick a date range" or the current date range to open the calendar popover.

### Step 2: Select Start Date
Click on any date in the calendar to set the start date. The selected date will be highlighted in blue.

### Step 3: Select End Date
Click on another date to set the end date. All dates between start and end will be highlighted to show the range.

### Step 4: Verify Selection
The button will now show your selected range (e.g., "Jan 01, 2024 - Jan 31, 2024"). The calendar popover closes automatically.

### Step 5: Clear Selection (Optional)
Click the "✕" button next to the date range to clear your selection and remove the date filter.

## Features

### ✅ Two-Month View
- See two months side-by-side for easier range selection
- Navigate between months using arrow buttons
- Quickly select ranges spanning multiple months

### ✅ Smart Date Handling
- Start date automatically set to 00:00:00 (beginning of day)
- End date automatically set to 23:59:59 (end of day)
- Ensures complete daily data capture

### ✅ URL State Persistence
- Selected dates are saved in the URL
- Share filtered views with colleagues
- Bookmarks preserve your date filters
- Browser back/forward buttons work correctly

### ✅ Keyboard Accessible
- Tab to focus the date range button
- Enter/Space to open calendar
- Arrow keys to navigate dates
- Enter to select dates
- Esc to close calendar

### ✅ Touch Friendly
- Large touch targets for mobile devices
- Smooth popover animations
- Responsive layout for all screen sizes

## Integration with Other Filters

The Date Range Picker works seamlessly with other audit log filters:

```
┌─────────────────────────────────────────────────────────────────┐
│ Filters                                               [Clear]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│ │ Action         │  │ Entity Type    │  │ Date Range       │  │
│ │ All actions ▼  │  │ All entities ▼ │  │ 📅 Pick dates ▼ │  │
│ └────────────────┘  └────────────────┘  └──────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

All filters work together:
1. Select an action type (e.g., "User Create")
2. Select an entity type (e.g., "User")
3. Select a date range (e.g., "Last 7 days")
4. Results update automatically

## Use Cases

### View Last Week's Activity
1. Click date range button
2. Select today's date as end date
3. Count back 7 days for start date
4. View all logs from the past week

### Audit a Specific Day
1. Click date range button
2. Select the same date for both start and end
3. View all activity from that specific day

### Monthly Reports
1. Click date range button
2. Select first day of month as start
3. Select last day of month as end
4. Export filtered logs for reporting

### Investigate Incidents
1. Note the time of the incident
2. Select date range around incident time
3. Filter by relevant action/entity types
4. Review detailed logs to understand what happened

## Technical Details

### Date Format
- **Display**: "Jan 01, 2024 - Jan 31, 2024" (user-friendly)
- **URL**: `2024-01-01T00:00:00.000Z` (ISO 8601 format)
- **API**: ISO string format for backend compatibility

### URL Parameters
```
?start_date=2024-01-01T00:00:00.000Z&end_date=2024-01-31T23:59:59.999Z
```

### Behavior
- Popover opens below button (or above if no space)
- Clicking outside calendar closes popover
- Selection persists across page refreshes
- Results reset to page 1 when dates change

## Tips & Tricks

### Quick Ranges
**Last 7 Days**: Click today, then click 7 days back  
**This Month**: Select 1st of month, then today  
**Last Month**: Select 1st of previous month, then last day of previous month  
**Custom Quarter**: Select start of quarter, then end of quarter  

### Keyboard Shortcuts
- `Tab` → Focus date picker
- `Space/Enter` → Open calendar
- `Arrow Keys` → Navigate dates
- `Enter` → Select date
- `Esc` → Close calendar

### Mobile Usage
- Tap date range button to open
- Scroll months if needed
- Tap dates to select
- Automatic close after selection

## Troubleshooting

### Calendar Won't Open
- Check if button is enabled
- Verify JavaScript is running
- Try refreshing the page

### Dates Not Filtering
- Verify both start and end dates are selected
- Check if other filters are too restrictive
- Ensure backend API is responding

### Range Not Displaying
- Clear browser cache
- Check for URL parameter corruption
- Try selecting dates again

## Accessibility

The Date Range Picker is fully accessible:

- ✅ **Screen Readers**: Announces date selection and range
- ✅ **Keyboard Navigation**: Full keyboard control
- ✅ **ARIA Labels**: Proper labeling for assistive tech
- ✅ **Focus Management**: Logical focus flow
- ✅ **Color Contrast**: Meets WCAG AA standards

## Browser Support

Tested and working on:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+

## Related Documentation

- [Audit Logs Page](../../../app/admin/logs/README.md)
- [Audit Filters Component](./audit-filters.tsx)
- [Requirements 9.4](../../../.kiro/specs/full-admin-control-center/requirements.md)
