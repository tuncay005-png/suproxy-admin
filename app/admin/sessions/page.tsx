/**
 * Sessions List Page
 * 
 * Server Component that fetches and displays all active user sessions.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Displays all active sessions with user info and activity
 * - Highlights the current administrator's own session
 * - Session revocation capabilities
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches sessions data via sessionsApi.list()
 * 2. Data is passed to client components for rendering
 * 3. Error boundary handles fetch failures
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 2.1, 2.2, 2.7
 * 
 * @module app/admin/sessions/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { sessionsApi } from '@/lib/api/endpoints/sessions';
import { PageHeader } from '@/components/admin/page-header';
import { SessionsTable } from '@/components/admin/sessions/sessions-table';

/**
 * Sessions list page - Server Component
 * 
 * Fetches sessions data server-side and renders the session management interface.
 */
export default async function SessionsPage() {
  // Fetch sessions data server-side
  // Backend returns: {success: true, data: {sessions: [...], total}}
  const response = await sessionsApi.list();
  const sessions = response.data.sessions;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Active Sessions"
        description="View and manage active user sessions"
      />

      {/* Sessions table */}
      <SessionsTable sessions={sessions} />
    </div>
  );
}
