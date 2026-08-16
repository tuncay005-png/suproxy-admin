/**
 * Plan Edit Page
 * 
 * Route: /admin/plans/[id]
 * 
 * This page provides the interface for editing existing subscription plans.
 * It fetches the plan by ID and renders the PlanEditForm component with the plan data.
 * 
 * Validates: Requirements 8.5-8.6, 13.1-13.3
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/page-header';
import { PlanEditForm } from '@/components/admin/plans/plan-edit-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { plansApi } from '@/lib/api/endpoints/plans';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PlanEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Fetch plan by ID
 * 
 * @param id - Plan UUID
 * @returns Plan data or null if not found
 */
async function getPlanById(id: string) {
  try {
    const response = await plansApi.getById(id);
    return response.data;
  } catch (error) {
    console.error('[PLAN-EDIT-PAGE] Failed to fetch plan:', error);
    return null;
  }
}

/**
 * Plan Edit Page Component
 * 
 * Server component that fetches plan data and renders the edit interface.
 * Uses the Admin Layout (via app/admin/layout.tsx).
 * 
 * Validates:
 * - Requirement 8.5: Display form pre-populated with current plan data
 * - Requirement 8.6: Send PUT request to /api/v1/plans/:id on submit
 * - Requirement 8.6: Show success toast and redirect to plans list
 * - Requirement 13.1: Use Zod schemas for form validation
 * - Requirement 13.2: Display inline field-level error messages
 * - Requirement 13.3: Map backend validation errors to form fields
 */
export default async function PlanEditPage({ params }: PlanEditPageProps) {
  const { id } = await params;
  const plan = await getPlanById(id);

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/plans">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          heading="Edit Plan"
          description={`Update settings for ${plan.name}`}
        />
      </div>

      {/* Plan edit form card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            Modify the pricing, duration, and limits for this subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanEditForm plan={plan} />
        </CardContent>
      </Card>
    </div>
  );
}
