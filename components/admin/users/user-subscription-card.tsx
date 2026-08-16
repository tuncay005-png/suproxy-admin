/**
 * User Subscription Card Component
 * 
 * Displays user subscription information including plan details,
 * status, expiry date, and remaining days for active subscriptions.
 * 
 * Features:
 * - Shows plan name, start date, and expiry date
 * - Visual status indicators (active, expired, suspended, cancelled)
 * - Countdown of remaining days for active subscriptions
 * - Expired subscriptions highlighted in red
 * - "No Subscription" state with link to plans
 * - Loading and error states
 * 
 * Validates: Requirements 3.1-3.6
 * 
 * @module components/admin/users/user-subscription-card
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, AlertCircle, TrendingUp, ExternalLink } from 'lucide-react';
import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/subscription';

interface UserSubscriptionCardProps {
  userId: string;
}

/**
 * Calculate remaining days until expiry
 */
function calculateRemainingDays(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get status badge variant and label
 */
function getStatusConfig(status: Subscription['status'], expiryDate: string) {
  const remainingDays = calculateRemainingDays(expiryDate);
  const isExpired = remainingDays < 0;

  switch (status) {
    case 'active':
      if (isExpired) {
        return {
          variant: 'destructive' as const,
          label: 'Expired',
          textColor: 'text-destructive',
        };
      }
      return {
        variant: 'default' as const,
        label: 'Active',
        textColor: 'text-green-600 dark:text-green-400',
      };
    case 'expired':
      return {
        variant: 'destructive' as const,
        label: 'Expired',
        textColor: 'text-destructive',
      };
    case 'suspended':
      return {
        variant: 'secondary' as const,
        label: 'Suspended',
        textColor: 'text-yellow-600 dark:text-yellow-400',
      };
    case 'cancelled':
      return {
        variant: 'outline' as const,
        label: 'Cancelled',
        textColor: 'text-muted-foreground',
      };
    default:
      return {
        variant: 'outline' as const,
        label: status,
        textColor: 'text-muted-foreground',
      };
  }
}

/**
 * User Subscription Card Component
 * 
 * Fetches and displays subscription information for a user
 */
export function UserSubscriptionCard({ userId }: UserSubscriptionCardProps) {
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await subscriptionsApi.getForUser(userId);
        setSubscription(response.data);
      } catch (err) {
        console.error('[USER-SUBSCRIPTION-CARD] Failed to fetch subscription:', err);
        setError('Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>User subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No subscription state
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>User subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
              <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Subscription</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                This user does not have an active subscription plan.
              </p>
              <Button variant="outline" asChild>
                <Link href="/admin/plans">
                  View Available Plans
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active subscription state
  const statusConfig = getStatusConfig(subscription.status, subscription.expiry_date);
  const remainingDays = calculateRemainingDays(subscription.expiry_date);
  const isExpired = remainingDays < 0 || subscription.status === 'expired';
  const dataUsagePercent = (subscription.data_used_gb / subscription.data_limit_gb) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Active subscription plan and usage</CardDescription>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Plan Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Plan Name
            </div>
            <p className="text-lg font-semibold">{subscription.plan_name}</p>
          </div>

          {/* Date Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <p className="text-sm">{formatDate(subscription.start_date)}</p>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Expiry Date
              </div>
              <p className={cn('text-sm font-medium', isExpired && 'text-destructive')}>
                {formatDate(subscription.expiry_date)}
              </p>
            </div>
          </div>

          {/* Remaining Days (for active subscriptions) */}
          {subscription.status === 'active' && !isExpired && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium">Remaining Time</p>
                    <p className="text-xs text-muted-foreground">Until expiry</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {remainingDays}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {remainingDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expired Badge (for expired subscriptions) */}
          {isExpired && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Subscription Expired</p>
                <p className="text-xs text-destructive/80">
                  This subscription expired on {formatDate(subscription.expiry_date)}
                </p>
              </div>
            </div>
          )}

          {/* Data Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Data Usage</span>
              <span className="font-medium">
                {subscription.data_used_gb.toFixed(2)} GB / {subscription.data_limit_gb} GB
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full transition-all',
                  dataUsagePercent >= 90
                    ? 'bg-destructive'
                    : dataUsagePercent >= 75
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                )}
                style={{ width: `${Math.min(dataUsagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {dataUsagePercent.toFixed(1)}% used
            </p>
          </div>

          {/* Link to Plans */}
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/plans">
                View All Plans
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
