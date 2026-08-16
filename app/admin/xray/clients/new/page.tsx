/**
 * Create Xray Client Page
 * 
 * Server Component page for creating a new Xray client configuration.
 * 
 * ## Features
 * 
 * - Server-side rendering for optimal performance
 * - Form validation with React Hook Form and Zod
 * - Displays generated client configuration after creation
 * - Automatic error handling
 * 
 * ## Data Flow
 * 
 * 1. Server Component renders the page layout
 * 2. ClientForm (Client Component) handles user interaction
 * 3. On submit, creates client via xrayApi.clients.create
 * 4. Displays generated config (connection URL and QR code) on success
 * 
 * Validates: Requirements 6.3-6.4, 6.9, 13.1-13.3, 10.2
 * 
 * @module app/admin/xray/clients/new/page
 */

import { PageHeader } from '@/components/admin/page-header';
import { ClientForm } from '@/components/admin/xray/clients/client-form';

/**
 * Create Xray Client page - Server Component
 * 
 * Renders the client creation interface with form and instructions.
 * Implements task 10.2: Create Client creation page and form.
 */
export default function NewClientPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Create Xray Client"
        description="Create a new client configuration for individual user access"
      />

      {/* Client creation form */}
      {/* Requirement 6.3-6.4, 6.9, 10.2: Client form with email and inbound fields */}
      <div className="mx-auto max-w-2xl">
        <ClientForm />
      </div>
    </div>
  );
}
