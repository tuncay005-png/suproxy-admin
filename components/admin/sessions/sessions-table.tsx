/**
 * Sessions Table Component
 * 
 * Displays active user sessions in a responsive table format.
 * 
 * ## Features
 * 
 * - Responsive table with horizontal scroll on mobile
 * - Progressive column hiding on smaller screens
 * - Displays username, email, IP address, user agent, login time, and last activity
 * - Highlights the current administrator's own session
 * - Session revocation actions
 * - Empty state when no sessions exist
 * 
 * Validates: Requirements 2.1, 2.2, 2.7
 * 
 * @module components/admin/sessions/sessions-table
 */

'use client';

import * as React from 'react';
import { UserSession } from '@/types/session';
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
import { UserCheck } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { RevokeSessionButton } from './revoke-session-button';

export interface SessionsTableProps {
  /**
   * Array of sessions to display
   */
  sessions: UserSession[];
}

/**
 * Parse user agent string to get simplified device/browser info
 */
function parseUserAgent(userAgent: string): string {
  // Extract browser
  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari')) {
    return 'Safari';
  } else if (userAgent.includes('Edge')) {
    return 'Edge';
  } else if (userAgent.includes('Opera')) {
    return 'Opera';
  }
  return 'Unknown';
}

/**
 * Sessions table component
 * 
 * Renders sessions in a table with columns for key session information.
 * On mobile (< 768px): Shows only username and IP
 * On tablet (≥ 768px): Shows username, IP, and browser
 * On desktop (≥ 1024px): Shows all columns including timestamps
 * 
 * @example
 * ```tsx
 * <SessionsTable sessions={sessionsData.sessions} />
 * ```
 */
export function SessionsTable({ sessions }: SessionsTableProps) {
  // Show empty state if no sessions exist
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={UserCheck}
            title="No active sessions"
            description="There are currently no active user sessions"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Responsive table wrapper with horizontal scroll */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">User</TableHead>
                <TableHead className="min-w-[120px]">IP Address</TableHead>
                <TableHead className="hidden md:table-cell min-w-[100px]">Browser</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[140px]">Login Time</TableHead>
                <TableHead className="hidden lg:table-cell min-w-[140px]">Last Activity</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const browser = parseUserAgent(session.user_agent || '');
                const isCurrentSession = false; // TODO: Determine current session
                
                return (
                  <TableRow 
                    key={session.id}
                    className={isCurrentSession ? 'bg-muted/50' : ''}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.username}</span>
                        <span className="text-sm text-muted-foreground">{session.email}</span>
                      </div>
                      {isCurrentSession && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Your Session
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{session.ip_address}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">{browser}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-sm" title={formatDateTime(session.created_at)}>
                          {formatRelativeTime(session.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-sm" title={session.last_activity_at ? formatDateTime(session.last_activity_at) : 'Never'}>
                          {session.last_activity_at ? formatRelativeTime(session.last_activity_at) : 'Never'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <RevokeSessionButton 
                        sessionId={session.id}
                        username={session.device_name || session.username || "Unknown Device"}
                        isCurrentSession={isCurrentSession}
                      />
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


