/**
 * Plans List Page
 * 
 * Server Component that fetches and displays the list of subscription plans.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Automatic loading and error states
 * - Responsive plans table display
 * - Display plan name, price, duration, data limit, active status, and active subscriptions count
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches plans data via plansApi.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 8.1, 8.2, 8.10, 12.1
 * 
 * @module app/admin/plans/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { plansApi } from '@/lib/api/endpoints/plans';
import { PageHeader } from '@/components/admin/page-header';
import { PlansTable } from '@/components/admin/plans/plans-table';

/**
 * Plans list page - Server Component
 * 
 * Fetches plans data server-side and renders the plan management interface.
 */
export default async function PlansPage() {
  // Fetch plans data server-side
  // Backend returns: {success: true, data: {plans: [...], total: number}}
  const response = await plansApi.list();
  const plans = response.data.plans;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Subscription Plans"
        description="Manage subscription plans and pricing tiers"
      />

      {/* Plans table */}
      <PlansTable plans={plans} />
    </div>
  );
}
