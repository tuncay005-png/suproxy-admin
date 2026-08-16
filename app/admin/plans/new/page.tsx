/**
 * Plan Creation Page
 * 
 * Route: /admin/plans/new
 * 
 * This page provides the interface for creating new subscription plans.
 * It renders the PlanCreationForm component within the admin layout.
 * 
 * Validates: Requirements 8.3-8.4, 8.9, 13.1-13.3
 */

import { PageHeader } from '@/components/admin/page-header';
import { PlanCreationForm } from '@/components/admin/plans/plan-creation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Plan Creation Page Component
 * 
 * Server component that renders the plan creation interface.
 * Uses the Admin Layout (via app/admin/layout.tsx).
 * 
 * Validates:
 * - Requirement 8.3: Display form for creating subscription plans
 * - Requirement 8.4: Send data to POST /api/v1/plans
 * - Requirement 8.9: Validate required fields before submission
 * - Requirement 13.1: Use Zod schemas for form validation
 * - Requirement 13.2: Display inline field-level error messages
 * - Requirement 13.3: Map backend validation errors to form fields
 */
export default function NewPlanPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page header with title and description */}
      <PageHeader
        heading="Create Plan"
        description="Add a new subscription plan"
      />

      {/* Plan creation form card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            Define the pricing, duration, and limits for this subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanCreationForm />
        </CardContent>
      </Card>
    </div>
  );
}
