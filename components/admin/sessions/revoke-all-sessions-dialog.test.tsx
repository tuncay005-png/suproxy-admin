/**
 * Tests for Revoke All Sessions Dialog Component
 * 
 * Validates: Requirements 2.5-2.6, 16.1-16.3, 16.6-16.9
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RevokeAllSessionsDialog } from './revoke-all-sessions-dialog';
import { sessionsApi } from '@/lib/api/endpoints/sessions';
import * as useToastModule from '@/lib/hooks/use-toast';

// Mock dependencies
vi.mock('@/lib/api/endpoints/sessions', () => ({
  sessionsApi: {
    revokeAll: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}));

describe('RevokeAllSessionsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render trigger button', () => {
    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={3}
      />
    );

    expect(screen.getByText('Revoke All Sessions')).toBeInTheDocument();
  });

  it('should display session count in confirmation message', async () => {
    const user = userEvent.setup();
    
    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={3}
      />
    );

    // Open dialog
    await user.click(screen.getByText('Revoke All Sessions'));

    // Check confirmation message displays count
    await waitFor(() => {
      expect(screen.getByText(/3 sessions/)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });
  });

  it('should call sessionsApi.revokeAll on confirmation', async () => {
    const user = userEvent.setup();
    const mockRevokeAll = vi.mocked(sessionsApi.revokeAll);
    mockRevokeAll.mockResolvedValue({
      success: true,
      data: { message: 'Sessions revoked' },
    });

    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={3}
      />
    );

    // Open dialog
    await user.click(screen.getByText('Revoke All Sessions'));

    // Confirm
    const confirmButtons = screen.getAllByText('Revoke All Sessions');
    await user.click(confirmButtons[confirmButtons.length - 1]);

    // Verify API was called with correct user ID
    await waitFor(() => {
      expect(mockRevokeAll).toHaveBeenCalledWith('user-123');
    });
  });

  it('should show success toast and refresh after successful revocation', async () => {
    const user = userEvent.setup();
    const mockRevokeAll = vi.mocked(sessionsApi.revokeAll);
    mockRevokeAll.mockResolvedValue({
      success: true,
      data: { message: 'Sessions revoked' },
    });

    const mockToastSuccess = vi.fn();
    vi.spyOn(useToastModule, 'useToast').mockReturnValue({
      toast: {
        success: mockToastSuccess,
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        message: vi.fn(),
      },
    });

    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={3}
      />
    );

    // Open dialog and confirm
    await user.click(screen.getByText('Revoke All Sessions'));
    const confirmButtons = screen.getAllByText('Revoke All Sessions');
    await user.click(confirmButtons[confirmButtons.length - 1]);

    // Verify success feedback
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining('test@example.com')
      );
    });
  });

  it('should show error toast on failure', async () => {
    const user = userEvent.setup();
    const mockRevokeAll = vi.mocked(sessionsApi.revokeAll);
    mockRevokeAll.mockRejectedValue(
      new Error('Failed to revoke sessions')
    );

    const mockToastError = vi.fn();
    vi.spyOn(useToastModule, 'useToast').mockReturnValue({
      toast: {
        success: vi.fn(),
        error: mockToastError,
        info: vi.fn(),
        warning: vi.fn(),
        message: vi.fn(),
      },
    });

    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={3}
      />
    );

    // Open dialog and confirm
    await user.click(screen.getByText('Revoke All Sessions'));
    const confirmButtons = screen.getAllByText('Revoke All Sessions');
    await user.click(confirmButtons[confirmButtons.length - 1]);

    // Verify error feedback
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it('should fetch session count if not provided', async () => {
    const user = userEvent.setup();
    const mockList = vi.mocked(sessionsApi.list);
    mockList.mockResolvedValue({
      success: true,
      data: {
        sessions: [
          { id: '1', user_id: 'user-123', email: 'test@example.com', username: 'test', ip_address: '127.0.0.1', user_agent: 'Chrome', created_at: '2024-01-01', last_activity_at: '2024-01-01', expires_at: '2024-01-02' },
          { id: '2', user_id: 'user-123', email: 'test@example.com', username: 'test', ip_address: '127.0.0.1', user_agent: 'Chrome', created_at: '2024-01-01', last_activity_at: '2024-01-01', expires_at: '2024-01-02' },
          { id: '3', user_id: 'other-user', email: 'other@example.com', username: 'other', ip_address: '127.0.0.1', user_agent: 'Chrome', created_at: '2024-01-01', last_activity_at: '2024-01-01', expires_at: '2024-01-02' },
        ],
        total: 3,
      },
    });

    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
      />
    );

    // Open dialog
    await user.click(screen.getByText('Revoke All Sessions'));

    // Should show loading state then count
    await waitFor(() => {
      expect(screen.getByText(/2 sessions/)).toBeInTheDocument();
    });

    expect(mockList).toHaveBeenCalled();
  });

  it('should disable confirmation button when no sessions exist', async () => {
    const user = userEvent.setup();

    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={0}
      />
    );

    // Open dialog
    await user.click(screen.getByText('Revoke All Sessions'));

    // Check that confirm button is disabled
    await waitFor(() => {
      const confirmButtons = screen.getAllByText('Revoke All Sessions');
      const confirmButton = confirmButtons[confirmButtons.length - 1];
      expect(confirmButton).toBeDisabled();
    });
  });

  it('should show loading state during revocation', async () => {
    const user = userEvent.setup();
    let resolveRevoke: (value: any) => void;
    const revokePromise = new Promise<any>((resolve) => {
      resolveRevoke = resolve;
    });
    const mockRevokeAll = vi.mocked(sessionsApi.revokeAll);
    mockRevokeAll.mockReturnValue(revokePromise);

    const mockToastSuccess = vi.fn();
    vi.spyOn(useToastModule, 'useToast').mockReturnValue({
      toast: {
        success: mockToastSuccess,
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        message: vi.fn(),
      },
    });

    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={3}
      />
    );

    // Open dialog and confirm
    await user.click(screen.getByText('Revoke All Sessions'));
    const confirmButtons = screen.getAllByText('Revoke All Sessions');
    await user.click(confirmButtons[confirmButtons.length - 1]);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeDisabled();
    });

    // Resolve the promise
    resolveRevoke!({ success: true, data: { message: 'Success' } });
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled();
    });
  });

  it('should render custom trigger when provided', () => {
    const customTrigger = <button>Custom Trigger</button>;

    render(
      <RevokeAllSessionsDialog
        userId="user-123"
        userEmail="test@example.com"
        sessionCount={3}
        trigger={customTrigger}
      />
    );

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
  });
});
