/**
 * Sessions List Page
 * 
 * Server Component that fetches and displays all active user sessions.
 * 
 * ## Features
 * 
 * - Server-side data fetching for optimal performance
 * - Graceful error handling — displays error state when backend unavailable
 * - Displays all active sessions with user info and activity
 * - Highlights the current administrator's own session
 * - Session revocation capabilities
 * 
 * ## Data Flow
 * 
 * 1. Server Component fetches sessions data via sessionsApi.list()
 * 2. Data is passed to client components for rendering
 * 3. On fetch failure, displays ErrorState with retry option
 * 4. Loading state shows skeleton UI during data fetch
 * 
 * Validates: Requirements 2.1, 2.2, 2.7
 * 
 * @module app/admin/sessions/page
 */

// Force dynamic rendering - requires authentication and real-time backend data
export const dynamic = 'force-dynamic';

import { sessionsApi } from '@/lib/api/endpoints/sessions';
import type { UserSession } from '@/types/session';
import { PageHeader } from '@/components/admin/page-header';
import { SessionsTable } from '@/components/admin/sessions/sessions-table';
import { ErrorState } from '@/components/ui/error-state';

/**
 * Sessions list page - Server Component
 * 
 * Fetches sessions data server-side and renders the session management interface.
 * Displays error state if backend is unavailable.
 */
export default async function SessionsPage() {
  let sessions: UserSession[] = [];
  let error: Error | null = null;

  try {
    // Fetch sessions data server-side
    // Backend returns: {success: true, data: {sessions: [...], total}}
    const response = await sessionsApi.list();
    sessions = response.data.sessions;
  } catch (err) {
    console.error('[SESSIONS-PAGE] Failed to fetch sessions:', err);
    error = err as Error;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        heading="Active Sessions"
        description="View and manage active user sessions"
      />

      {/* Error state or sessions table */}
      {error ? (
        <ErrorState
          title="Unable to load sessions"
          description="Backend service is temporarily unavailable. Please try again later."
          onRetry={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      ) : (
        <SessionsTable sessions={sessions} />
      )}
    </div>
  );
}
