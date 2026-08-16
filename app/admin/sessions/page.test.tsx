/**
 * Sessions Page Tests
 * 
 * Tests for the sessions list page component.
 * 
 * @module app/admin/sessions/page.test
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SessionsPage from './page';
import { sessionsApi } from '@/lib/api/endpoints/sessions';

// Mock the API
vi.mock('@/lib/api/endpoints/sessions', () => ({
  sessionsApi: {
    list: vi.fn(),
  },
}));

// Mock Next.js components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock PageHeader component
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: any) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

// Mock SessionsTable component
vi.mock('@/components/admin/sessions/sessions-table', () => ({
  SessionsTable: ({ sessions }: any) => (
    <div data-testid="sessions-table">
      {sessions.map((session: any) => (
        <div key={session.id} data-testid={`session-${session.id}`}>
          {session.username}
        </div>
      ))}
    </div>
  ),
}));

describe('SessionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title and description', async () => {
    vi.mocked(sessionsApi.list).mockResolvedValue({
      success: true,
      data: {
        sessions: [],
        total: 0,
      },
    } as any);

    render(await SessionsPage());

    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('View and manage active user sessions')).toBeInTheDocument();
  });

  it('fetches and displays sessions data', async () => {
    const mockSessions = [
      {
        id: 'session-1',
        user_id: 'user-1',
        username: 'john.doe',
        email: 'john@example.com',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: '2024-01-01T10:00:00Z',
        last_activity_at: '2024-01-01T11:00:00Z',
        expires_at: '2024-01-02T10:00:00Z',
      },
      {
        id: 'session-2',
        user_id: 'user-2',
        username: 'jane.smith',
        email: 'jane@example.com',
        ip_address: '192.168.1.2',
        user_agent: 'Mozilla/5.0',
        created_at: '2024-01-01T09:00:00Z',
        last_activity_at: '2024-01-01T10:30:00Z',
        expires_at: '2024-01-02T09:00:00Z',
      },
    ];

    vi.mocked(sessionsApi.list).mockResolvedValue({
      success: true,
      data: {
        sessions: mockSessions,
        total: 2,
      },
    } as any);

    render(await SessionsPage());

    // Verify sessions are passed to table
    expect(screen.getByTestId('sessions-table')).toBeInTheDocument();
    expect(screen.getByTestId('session-session-1')).toBeInTheDocument();
    expect(screen.getByTestId('session-session-2')).toBeInTheDocument();
    expect(screen.getByText('john.doe')).toBeInTheDocument();
    expect(screen.getByText('jane.smith')).toBeInTheDocument();
  });

  it('calls sessionsApi.list on render', async () => {
    vi.mocked(sessionsApi.list).mockResolvedValue({
      success: true,
      data: {
        sessions: [],
        total: 0,
      },
    } as any);

    await SessionsPage();

    expect(sessionsApi.list).toHaveBeenCalledTimes(1);
  });

  it('handles empty sessions list', async () => {
    vi.mocked(sessionsApi.list).mockResolvedValue({
      success: true,
      data: {
        sessions: [],
        total: 0,
      },
    } as any);

    render(await SessionsPage());

    expect(screen.getByTestId('sessions-table')).toBeInTheDocument();
  });
});
