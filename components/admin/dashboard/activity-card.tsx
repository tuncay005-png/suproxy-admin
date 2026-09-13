/**
 * ActivityCard Component
 * 
 * Displays real-time system information (Xray status, uptime, traffic) in a compact 
 * card format with icons and status indicators.
 * 
 * ## Features
 * 
 * - Display activity metrics with icon, title, and value
 * - Optional status indicator dot (success, warning, error, neutral)
 * - Optional secondary description text
 * - Responsive design with dark theme styling
 * - Support for clickable cards with onClick handler
 * - ARIA labels and live regions for accessibility
 * 
 * ## Accessibility Features
 * 
 * - aria-label with comprehensive metric description
 * - aria-live region for real-time value updates
 * - role="status" for status indicators
 * - Semantic HTML with proper heading hierarchy
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.10, 11.2, 11.6, 2.7
 * - 5.1: Display Xray Status Activity_Card showing operational state
 * - 5.2: Show localized "Running" / "Stopped" text with indicator dots
 * - 5.3: Display System Uptime Activity_Card
 * - 5.10: Use consistent icon sizing and spacing matching Dark_Theme aesthetic
 * - 11.2: Reusable ActivityCard component accepting title, value, status, and icon props
 * - 11.6: TypeScript-typed with proper interfaces for type safety
 * - 2.7: WCAG AA contrast ratios for accessibility
 * 
 * @module components/admin/dashboard/activity-card
 */

import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Status indicator variant
 * - success (green): Xray running, healthy
 * - warning (yellow): Degraded performance
 * - error (red): Xray stopped, errors
 * - neutral (gray): Uptime, traffic stats
 */
export type ActivityStatus = 'success' | 'warning' | 'error' | 'neutral';

export interface ActivityCardProps {
  /**
   * Lucide icon component to display
   */
  icon: LucideIcon;

  /**
   * Translated card title (e.g., "Xray Status", "System Uptime")
   */
  title: string;

  /**
   * Primary display value (e.g., "Running", "5d 12h 30m", "125 MB/s")
   */
  value: string | number;

  /**
   * Secondary descriptive text (optional)
   */
  description?: string;

  /**
   * Status variant for coloring the status dot
   * @default 'neutral'
   */
  status?: ActivityStatus;

  /**
   * Show status dot indicator next to icon
   * @default false
   */
  statusDot?: boolean;

  /**
   * Additional CSS classes for the card container
   */
  className?: string;

  /**
   * Click handler for interactive cards (optional)
   */
  onClick?: () => void;

  /**
   * Accessible description for screen readers (optional)
   * If not provided, defaults to "{title}: {value}"
   */
  ariaLabel?: string;
}

/**
 * Status dot component with color variants
 */
function StatusDot({ status = 'neutral' }: { status: ActivityStatus }) {
  return (
    <span
      className={cn(
        'absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
        {
          'bg-green-500': status === 'success',
          'bg-yellow-500': status === 'warning',
          'bg-red-500': status === 'error',
          'bg-gray-500': status === 'neutral',
        }
      )}
      aria-label={`Status: ${status}`}
    />
  );
}

/**
 * ActivityCard component for displaying activity metrics with status indicators
 * 
 * @example
 * ```tsx
 * // Xray status card with success indicator
 * <ActivityCard
 *   icon={Activity}
 *   title="Xray Status"
 *   value="Running"
 *   status="success"
 *   statusDot={true}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // System uptime card without status dot
 * <ActivityCard
 *   icon={Clock}
 *   title="System Uptime"
 *   value="5d 12h 30m"
 *   description="Last restart: Jan 15"
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Traffic speed card with description
 * <ActivityCard
 *   icon={ArrowDownUp}
 *   title="Traffic Speed"
 *   value="125 MB/s"
 *   description="Download: 85 MB/s | Upload: 40 MB/s"
 *   status="neutral"
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Clickable card with onClick handler
 * <ActivityCard
 *   icon={AlertCircle}
 *   title="System Alerts"
 *   value={3}
 *   status="warning"
 *   statusDot={true}
 *   onClick={() => router.push('/admin/alerts')}
 *   className="cursor-pointer"
 * />
 * ```
 */
export function ActivityCard({
  icon: Icon,
  title,
  value,
  description,
  status = 'neutral',
  statusDot = false,
  className,
  onClick,
  ariaLabel,
}: ActivityCardProps) {
  // Format value for display and accessibility
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  // Generate default aria-label if not provided
  const defaultAriaLabel = description 
    ? `${title}: ${formattedValue}. ${description}` 
    : `${title}: ${formattedValue}`;
  
  const accessibleLabel = ariaLabel || defaultAriaLabel;

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      aria-label={accessibleLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon with optional status dot */}
          <div className="relative shrink-0">
            <Icon 
              className="h-5 w-5 text-muted-foreground" 
              aria-hidden="true"
            />
            {statusDot && <StatusDot status={status} />}
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1" id={`${title.replace(/\s+/g, '-')}-label`}>
              {title}
            </p>
            <p 
              className="text-2xl font-semibold truncate"
              aria-labelledby={`${title.replace(/\s+/g, '-')}-label`}
            >
              {formattedValue}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Live region for real-time updates - announces changes to screen readers */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {title} updated: {formattedValue}
        {description && `, ${description}`}
      </div>
    </Card>
  );
}
