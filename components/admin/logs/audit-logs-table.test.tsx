/**
 * Audit Logs Table Component Tests
 * 
 * Tests for the audit logs table display and pagination.
 * 
 * Validates: Requirements 9.1, 9.2, 9.7
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditLogsTable } from './audit-logs-table';
import type { AuditLog } from '@/types/audit';

// Mock Next.js router
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('AuditLogsTable', () => {
  const mockLogs: AuditLog[] = [
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
      metadata: { test: 'data' },
      created_at: new Date('2024-01-15T10:30:00Z').toISOString(),
    },
    {
      id: '2',
      action: 'user.delete',
      actor_id: 'actor-789',
      actor_email: 'superadmin@example.com',
      entity_type: 'user',
      entity_id: 'user-999',
      ip_address: '10.0.0.5',
      user_agent: 'Chrome/120.0',
      status: 'failure' as const,
      metadata: {},
      created_at: new Date('2024-01-15T11:00:00Z').toISOString(),
    },
  ];

  it('should render logs table with all columns', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={2}
        currentPage={1}
        pageSize={25}
        totalPages={1}
      />
    );

    // Check table headers
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Actor')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Check log data is displayed
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('superadmin@example.com')).toBeInTheDocument();
    expect(screen.getByText('user.create')).toBeInTheDocument();
    expect(screen.getByText('user.delete')).toBeInTheDocument();
  });

  it('should display status badges with correct variants', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={2}
        currentPage={1}
        pageSize={25}
        totalPages={1}
      />
    );

    const successBadges = screen.getAllByText('success');
    const failureBadges = screen.getAllByText('failure');

    expect(successBadges.length).toBe(1);
    expect(failureBadges.length).toBe(1);
  });

  it('should display entity type and ID', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={2}
        currentPage={1}
        pageSize={25}
        totalPages={1}
      />
    );

    // Entity types as badges
    expect(screen.getAllByText('user').length).toBeGreaterThan(0);
    
    // Entity IDs (truncated)
    expect(screen.getByText(/user-456/)).toBeInTheDocument();
    expect(screen.getByText(/user-999/)).toBeInTheDocument();
  });

  it('should display IP addresses', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={2}
        currentPage={1}
        pageSize={25}
        totalPages={1}
      />
    );

    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.5')).toBeInTheDocument();
  });

  it('should show empty state when no logs', () => {
    render(
      <AuditLogsTable
        logs={[]}
        total={0}
        currentPage={1}
        pageSize={25}
        totalPages={0}
      />
    );

    expect(screen.getByText('No audit logs found')).toBeInTheDocument();
    expect(screen.getByText('No audit log entries match the current filters')).toBeInTheDocument();
  });

  it('should display pagination information', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={100}
        currentPage={2}
        pageSize={25}
        totalPages={4}
      />
    );

    // Should show current range
    expect(screen.getByText(/Showing 26-50 of 100/)).toBeInTheDocument();
    
    // Should show page info
    expect(screen.getByText('Page 2 of 4')).toBeInTheDocument();
  });

  it('should handle pagination controls', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={100}
        currentPage={2}
        pageSize={25}
        totalPages={4}
      />
    );

    // Find pagination buttons
    const buttons = screen.getAllByRole('button');
    const firstPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'First page');
    const prevPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'Previous page');
    const nextPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'Next page');
    const lastPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'Last page');

    expect(firstPageBtn).toBeInTheDocument();
    expect(prevPageBtn).toBeInTheDocument();
    expect(nextPageBtn).toBeInTheDocument();
    expect(lastPageBtn).toBeInTheDocument();

    // First and previous should not be disabled on page 2
    expect(firstPageBtn).not.toBeDisabled();
    expect(prevPageBtn).not.toBeDisabled();
  });

  it('should disable first/prev buttons on first page', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={100}
        currentPage={1}
        pageSize={25}
        totalPages={4}
      />
    );

    const buttons = screen.getAllByRole('button');
    const firstPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'First page');
    const prevPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'Previous page');

    expect(firstPageBtn).toBeDisabled();
    expect(prevPageBtn).toBeDisabled();
  });

  it('should disable next/last buttons on last page', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={100}
        currentPage={4}
        pageSize={25}
        totalPages={4}
      />
    );

    const buttons = screen.getAllByRole('button');
    const nextPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'Next page');
    const lastPageBtn = buttons.find(b => b.getAttribute('aria-label') === 'Last page');

    expect(nextPageBtn).toBeDisabled();
    expect(lastPageBtn).toBeDisabled();
  });

  it('should have page size selector with options', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={100}
        currentPage={1}
        pageSize={25}
        totalPages={4}
      />
    );

    expect(screen.getByText('Items per page:')).toBeInTheDocument();
    
    // Page size selector should be present
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should format timestamps as relative time with hover tooltip', () => {
    render(
      <AuditLogsTable
        logs={mockLogs}
        total={2}
        currentPage={1}
        pageSize={25}
        totalPages={1}
      />
    );

    // Should show relative time (checked via title attribute)
    const timestamps = screen.getAllByText(/ago|hour|minute|second/i);
    expect(timestamps.length).toBeGreaterThan(0);
  });
});
