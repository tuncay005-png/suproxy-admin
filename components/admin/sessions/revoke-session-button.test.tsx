/**
 * Revoke Session Button Component Tests
 * 
 * Tests for the session revocation functionality with confirmation dialog.
 * 
 * Validates: Requirements 2.3, 2.4, 2.8, 16.1-16.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RevokeSessionButton } from './revoke-session-button';
import { sessionsApi } from '@/lib/api/endpoints/sessions';
import * as useToastModule from '@/lib/hooks/use-toast';

// Mock the API
vi.mock('@/lib/api/endpoints/sessions', () => ({
  sessionsApi: {
    revoke: vi.fn(),
  },
}));

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock the toast hook
vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}));

describe('RevokeSessionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display - Requirement 2.3', () => {
    it('renders revoke button', () => {
      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument();
    });

    it('opens confirmation dialog when clicked', async () => {
      const user = userEvent.setup();
      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });
    });
  });

  describe('Confirmation Dialog - Requirement 16.1-16.3', () => {
    it('displays confirmation message with username', async () => {
      const user = userEvent.setup();
      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/john.doe/i)).toBeInTheDocument();
      });
    });

    it('displays warning when revoking own session - Requirement 2.8', async () => {
      const user = userEvent.setup();
      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={true}
        />
      );

      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/your current session/i)).toBeInTheDocument();
      });
    });

    it('has cancel and confirm buttons', async () => {
      const user = userEvent.setup();
      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /revoke session/i })).toBeInTheDocument();
      });
    });
  });

  describe('Session Revocation - Requirement 2.4', () => {
    it('calls API to revoke session when confirmed', async () => {
      const user = userEvent.setup();
      const mockRevoke = vi.mocked(sessionsApi.revoke);
      mockRevoke.mockResolvedValue({ success: true, data: { message: 'Session revoked' } });

      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      // Confirm revocation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /revoke session/i })).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /revoke session/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockRevoke).toHaveBeenCalledWith('session-123');
      });
    });

    it('displays success toast after revoking session', async () => {
      const user = userEvent.setup();
      const mockRevoke = vi.mocked(sessionsApi.revoke);
      mockRevoke.mockResolvedValue({ success: true, data: { message: 'Session revoked' } });

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
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      // Confirm revocation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /revoke session/i })).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /revoke session/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringContaining('john.doe'));
      });
    });

    it('displays error toast when revocation fails', async () => {
      const user = userEvent.setup();
      const mockRevoke = vi.mocked(sessionsApi.revoke);
      mockRevoke.mockRejectedValue(new Error('Network error'));

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
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      // Confirm revocation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /revoke session/i })).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /revoke session/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('does not revoke when cancelled', async () => {
      const user = userEvent.setup();
      const mockRevoke = vi.mocked(sessionsApi.revoke);

      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      // Cancel
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // API should not be called
      expect(mockRevoke).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator during revocation', async () => {
      const user = userEvent.setup();
      const mockRevoke = vi.mocked(sessionsApi.revoke);
      
      // Create a promise that we can resolve later
      let resolveRevoke: (value: any) => void;
      const revokePromise = new Promise((resolve) => {
        resolveRevoke = resolve;
      });
      mockRevoke.mockReturnValue(revokePromise as any);

      render(
        <RevokeSessionButton
          sessionId="session-123"
          username="john.doe"
          isCurrentSession={false}
        />
      );

      // Open dialog
      const button = screen.getByRole('button', { name: /revoke/i });
      await user.click(button);

      // Confirm revocation
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /revoke session/i })).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /revoke session/i });
      await user.click(confirmButton);

      // Should show loading state
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /revoke session/i });
        expect(loadingButton).toBeDisabled();
      });

      // Resolve the promise
      resolveRevoke!({ success: true, data: { message: 'Session revoked' } });
    });
  });
});
