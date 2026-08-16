/**
 * Audit Logs Page Tests
 * 
 * Tests for the audit logs list page including filtering and pagination.
 * 
 * Validates: Requirements 9.1-9.5, 9.7, 9.9
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuditLogsPage from './page';
import { auditApi } from '@/lib/api/endpoints/audit';
import type { AuditLogsListResponse } from '@/types/audit';

// Mock the audit API
vi.mock('@/lib/api/endpoints/audit', () => ({
  auditApi: {
    getLogs: vi.fn(),
    getStats: vi.fn(),
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: () => '',
  }),
}));

describe('AuditLogsPage', () => {
  const mockLogsResponse: AuditLogsListResponse = {
    logs: [
      {
        id: '1',
        action: 'user.create',
        actor_id: 'actor-123',
        actor_email: 'admin@example.com',
        entity_type: 'user',
        entity_id: 'user-456',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        status: 'success' as const,
        metadata: {},
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        action: 'user.delete',
        actor_id: 'actor-123',
        actor_email: 'admin@example.com',
        entity_type: 'user',
        entity_id: 'user-789',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        status: 'success' as const,
        metadata: {},
        created_at: new Date().toISOString(),
      },
    ],
    total: 2,
    offset: 0,
    limit: 25,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auditApi.getLogs).mockResolvedValue({
      success: true,
      data: mockLogsResponse,
    });
    vi.mocked(auditApi.getStats).mockResolvedValue({
      success: true,
      data: {
        total_actions: 150,
        actions_by_type: {
          'user.create': 50,
          'user.update': 30,
          'user.delete': 20,
        },
        recent_activity_count: 25,
      },
    });
  });

  it('should render audit logs page with heading', async () => {
    const page = await AuditLogsPage({ searchParams: {} });
    render(page);

    expect(screen.getAllByText('Audit Logs')[0]).toBeInTheDocument();
    expect(screen.getByText('Track and monitor administrative actions')).toBeInTheDocument();
  });

  it('should fetch logs with default filters', async () => {
    await AuditLogsPage({ searchParams: {} });

    expect(auditApi.getLogs).toHaveBeenCalledWith({
      page: 1,
      limit: 25,
      action: undefined,
      entity_type: undefined,
      start_date: undefined,
      end_date: undefined,
    });
  });

  it('should parse search params and fetch logs with filters', async () => {
    await AuditLogsPage({
      searchParams: {
        page: '2',
        limit: '50',
        action: 'user.create',
        entity_type: 'user',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
      },
    });

    expect(auditApi.getLogs).toHaveBeenCalledWith({
      page: 2,
      limit: 50,
      action: 'user.create',
      entity_type: 'user',
      start_date: '2024-01-01T00:00:00Z',
      end_date: '2024-01-31T23:59:59Z',
    });
  });

  it('should render audit logs table with data', async () => {
    const page = await AuditLogsPage({ searchParams: {} });
    render(page);

    // Table should be rendered with logs (we have 2 logs with same actor)
    expect(screen.getAllByText('admin@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('user.create')).toBeInTheDocument();
  });

  it('should pass pagination data to table component', async () => {
    const page = await AuditLogsPage({
      searchParams: { page: '2', limit: '10' },
    });
    
    vi.mocked(auditApi.getLogs).mockResolvedValue({
      success: true,
      data: {
        ...mockLogsResponse,
        total: 50,
        offset: 10,
        limit: 10,
      },
    });

    render(page);

    // Should show pagination info
    expect(screen.getByText(/Page 2 of/i)).toBeInTheDocument();
  });

  it('should render filters component with current filter values', async () => {
    const page = await AuditLogsPage({
      searchParams: {
        action: 'user.create',
        entity_type: 'user',
      },
    });
    render(page);

    // Filter component should be present
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should render audit stats cards component', async () => {
    const page = await AuditLogsPage({ searchParams: {} });
    render(page);

    // Stats cards component should be rendered
    // The component will fetch stats on mount, so we wait for it
    await screen.findByText('Total Actions');
    await screen.findByText('Recent Activity');
    // Should display top action types
    await screen.findByText('User Create');
  });
});
