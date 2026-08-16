/**
 * Plans Table Component
 * 
 * Displays subscription plans in a responsive table format.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays plan name, price, duration, data limit, active status, and active subscriptions count
 * - Status indicators with appropriate visual styling
 * - Empty state when no plans exist
 * - Formatted price with currency
 * - Human-readable duration
 * - Data limit in GB
 * 
 * Validates: Requirements 8.1, 8.2, 8.10, 12.1
 * 
 * @module components/admin/plans/plans-table
 */

'use client';

import * as React from 'react';
import type { Plan } from '@/types/plan';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { CreditCard } from 'lucide-react';
import { PlanStatusBadge } from './plan-status-badge';
import { Badge } from '@/components/ui/badge';
import { DeletePlanDialog } from './delete-plan-dialog';

export interface PlansTableProps {
  /**
   * Array of plans to display
   */
  plans: Plan[];
}

/**
 * Format duration in days to human-readable format
 * 
 * @param days - Duration in days
 * @returns Formatted duration string
 * 
 * @example
 * formatDuration(1) // "1 day"
 * formatDuration(30) // "30 days"
 * formatDuration(365) // "1 year"
 */
function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days === 30) return '1 month';
  if (days === 365) return '1 year';
  
  const months = Math.floor(days / 30);
  if (days % 30 === 0 && months < 12) {
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  const years = Math.floor(days / 365);
  if (days % 365 === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  
  return `${days} days`;
}

/**
 * Format price with currency symbol
 * 
 * @param price - Price value
 * @param currency - Currency code (e.g., "USD", "EUR")
 * @returns Formatted price string
 * 
 * @example
 * formatPrice(29.99, "USD") // "$29.99"
 * formatPrice(19.99, "EUR") // "€19.99"
 */
function formatPrice(price: number, currency: string): string {
  // Map common currency codes to symbols
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'Fr',
    RUB: '₽',
    BRL: 'R$',
    TRY: '₺',
  };

  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  
  // Format price with 2 decimal places
  const formattedPrice = price.toFixed(2);
  
  return `${symbol}${formattedPrice}`;
}

/**
 * Format data limit in GB
 * 
 * @param gb - Data limit in GB
 * @returns Formatted data limit string
 * 
 * @example
 * formatDataLimit(10) // "10 GB"
 * formatDataLimit(100) // "100 GB"
 * formatDataLimit(1000) // "1 TB"
 */
function formatDataLimit(gb: number): string {
  if (gb >= 1000) {
    const tb = gb / 1000;
    return `${tb.toFixed(tb % 1 === 0 ? 0 : 1)} TB`;
  }
  return `${gb} GB`;
}

/**
 * Plans table component
 * 
 * Renders plans in a table with columns for key plan information.
 * On mobile (< 768px): Shows only name, price, and status
 * On tablet (≥ 768px): Shows name, price, duration, and status
 * On desktop (≥ 1024px): Shows all columns including data limit and active subscriptions
 * 
 * @example
 * ```tsx
 * <PlansTable plans={plansData} />
 * ```
 */
export function PlansTable({ plans }: PlansTableProps) {
  // Show empty state if no plans exist
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={CreditCard}
            title="No plans found"
            description="No subscription plans configured yet"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans</CardTitle>
        <CardDescription>
          {plans.length} plan{plans.length !== 1 ? 's' : ''} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Name</TableHead>
                <TableHead className="min-w-[100px]">Price</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Duration</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[100px]">Data Limit</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="hidden xl:table-cell min-w-[120px]">Active Subs</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => {
                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(plan.price, plan.currency)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDuration(plan.duration_days)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDataLimit(plan.data_limit_gb)}
                    </TableCell>
                    <TableCell>
                      <PlanStatusBadge active={plan.active} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant="outline">
                        {plan.active_subscriptions}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeletePlanDialog plan={plan} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
