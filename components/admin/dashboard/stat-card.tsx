/**
 * StatCard Component
 * 
 * A reusable card component for displaying key metrics on the dashboard.
 * Supports icons, trend indicators, and customizable styling.
 * 
 * ## Features
 * 
 * - Display metric title, value, and description
 * - Optional icon display
 * - Optional trend indicator (up/down with percentage)
 * - Responsive design
 * - Consistent styling with shadcn/ui Card component
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 3.1, 9.2
 * - 3.1: Reusable component for displaying statistics on dashboard
 * - 9.2: Separation of UI components from business logic
 * 
 * @module components/admin/dashboard/stat-card
 */

import * as React from 'react';
import Link from 'next/link';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  /**
   * Title of the statistic (e.g., "Total Users", "Active Servers")
   */
  title: string;

  /**
   * Main value to display (e.g., "1,234", "98%", "Active")
   */
  value: string | number;

  /**
   * Optional description or subtitle text
   */
  description?: string;

  /**
   * Optional icon component from lucide-react
   */
  icon?: LucideIcon;

  /**
   * Optional trend data showing change percentage
   */
  trend?: {
    /**
     * Direction of the trend
     */
    direction: 'up' | 'down';
    /**
     * Percentage value (without % sign)
     */
    value: number;
    /**
     * Optional label for the trend (e.g., "from last month")
     */
    label?: string;
  };

  /**
   * Additional CSS classes for the card container
   */
  className?: string;

  /**
   * Optional link URL to make the card clickable
   */
  href?: string;
}

/**
 * StatCard component for displaying key metrics
 * 
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Users"
 *   value={1234}
 *   description="Registered users"
 *   icon={Users}
 *   trend={{ direction: 'up', value: 12.5, label: 'from last month' }}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // Clickable stat card linking to a page
 * <StatCard
 *   title="Active Servers"
 *   value={42}
 *   description="View all servers"
 *   icon={Server}
 *   href="/admin/servers"
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  href,
}: StatCardProps) {
  const cardContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && (
          <Icon 
            className="h-4 w-4 text-muted-foreground" 
            aria-hidden="true"
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {/* Description or trend indicator */}
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              )}
              aria-label={`Trend ${trend.direction} ${trend.value}%`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
              )}
              <span>{trend.value}%</span>
              {trend.label && (
                <span className="text-muted-foreground ml-1">{trend.label}</span>
              )}
            </div>
          )}
          
          {description && !trend && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {description && trend && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform hover:scale-105">
        <Card className={cn('cursor-pointer hover:shadow-md', className)}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn('', className)}>
      {cardContent}
    </Card>
  );
}
