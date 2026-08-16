/**
 * Date Range Picker Component
 * 
 * A client component that provides a date range selection interface for filtering audit logs.
 * Uses shadcn/ui Calendar and Popover components for a user-friendly date selection experience.
 * 
 * ## Features
 * 
 * - Select start and end dates using calendar popover
 * - Display selected date range in filter controls
 * - Update URL search params when dates are selected
 * - Clear dates functionality
 * - Accessible keyboard navigation
 * - Responsive design
 * 
 * ## URL State Management
 * 
 * - Updates `start_date` and `end_date` query parameters
 * - Formats dates as ISO strings for API compatibility
 * - Resets to page 1 when date range changes
 * 
 * Validates: Requirements 9.4
 * 
 * @module components/admin/logs/date-range-picker
 */

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DateRangePickerProps {
  /**
   * Current date range from URL params
   */
  dateRange?: {
    start_date?: string;
    end_date?: string;
  };
}

/**
 * Date Range Picker component
 * 
 * Provides a popover-based calendar interface for selecting date ranges.
 * Updates URL search params when dates are selected.
 * 
 * @example
 * ```tsx
 * <DateRangePicker 
 *   dateRange={{
 *     start_date: '2024-01-01T00:00:00',
 *     end_date: '2024-01-31T23:59:59'
 *   }}
 * />
 * ```
 */
export function DateRangePicker({ dateRange }: DateRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse date range from props
  const parsedDateRange: DateRange | undefined = React.useMemo(() => {
    if (!dateRange?.start_date && !dateRange?.end_date) {
      return undefined;
    }

    return {
      from: dateRange.start_date ? new Date(dateRange.start_date) : undefined,
      to: dateRange.end_date ? new Date(dateRange.end_date) : undefined,
    };
  }, [dateRange]);

  // Handle date range selection
  const handleDateRangeSelect = React.useCallback(
    (range: DateRange | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      if (range?.from) {
        // Set start of day for start_date
        const startDate = new Date(range.from);
        startDate.setHours(0, 0, 0, 0);
        params.set('start_date', startDate.toISOString());
      } else {
        params.delete('start_date');
      }

      if (range?.to) {
        // Set end of day for end_date
        const endDate = new Date(range.to);
        endDate.setHours(23, 59, 59, 999);
        params.set('end_date', endDate.toISOString());
      } else {
        params.delete('end_date');
      }

      // Reset to first page when dates change
      params.set('page', '1');

      router.push(`/admin/logs?${params.toString()}`);

      // Close popover if both dates are selected
      if (range?.from && range?.to) {
        setIsOpen(false);
      }
    },
    [router, searchParams]
  );

  // Clear date range
  const clearDateRange = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const params = new URLSearchParams(searchParams.toString());
      params.delete('start_date');
      params.delete('end_date');
      params.set('page', '1');
      router.push(`/admin/logs?${params.toString()}`);
      setIsOpen(false);
    },
    [router, searchParams]
  );

  // Format display text
  const displayText = React.useMemo(() => {
    if (!parsedDateRange?.from) {
      return 'Pick a date range';
    }

    if (!parsedDateRange.to) {
      return format(parsedDateRange.from, 'LLL dd, y');
    }

    return `${format(parsedDateRange.from, 'LLL dd, y')} - ${format(parsedDateRange.to, 'LLL dd, y')}`;
  }, [parsedDateRange]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range-picker"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !parsedDateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={parsedDateRange?.from}
            selected={parsedDateRange}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {parsedDateRange?.from && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearDateRange}
          className="h-10 px-3"
          aria-label="Clear date range"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
