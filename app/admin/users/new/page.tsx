/**
 * User Creation Page
 * 
 * Route: /admin/users/new
 * 
 * This page provides the interface for creating new users.
 * It renders the UserCreationForm component within the admin layout.
 * 
 * Validates: Requirements 5.1, 5.8, 3.5, 7.6
 */

import { PageHeader } from '@/components/admin/page-header';
import { UserCreationForm } from '@/components/admin/users/user-creation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * User Creation Page Component
 * 
 * Server component that renders the user creation interface.
 * Uses the Admin Layout (via app/admin/layout.tsx).
 * 
 * Validates:
 * - Requirement 5.1: Display form with fields required by POST /api/v1/users
 * - Requirement 5.8: Use Admin_Layout component (inherited from /admin layout)
 * - Requirement 3.5: Responsive design across mobile, tablet, desktop
 * - Requirement 7.6: TailwindCSS applied for responsive styling
 */
export default function NewUserPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page header with title and description */}
      <PageHeader
        heading="Create User"
        description="Add a new user to the system"
      />

      {/* User creation form card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Enter the information for the new user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserCreationForm />
        </CardContent>
      </Card>
    </div>
  );
}
