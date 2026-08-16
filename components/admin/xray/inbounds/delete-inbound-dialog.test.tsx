/**
 * Delete Inbound Dialog Component Tests
 * 
 * Tests the delete inbound dialog functionality including:
 * - Rendering and display of inbound information
 * - Client count fetching and display
 * - Warning messages for inbounds with active clients
 * - Deletion confirmation flow
 * - Error handling
 * 
 * @module components/admin/xray/inbounds/delete-inbound-dialog.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteInboundDialog } from './delete-inbound-dialog';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { toast } from '@/lib/hooks/use-toast';
import type { XrayInbound, XrayClient } from '@/types/xray';

// Mock dependencies
vi.mock('@/lib/api/endpoints/xray');
vi.mock('@/lib/hooks/use-toast');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockXrayApi = xrayApi as any;
const mockToast = toast as any;

describe('DeleteInboundDialog', () => {
  const mockInbound: XrayInbound = {
    id: 'inbound-123',
    instance_id: 'instance-456',
    protocol: 'vless',
    port: 443,
    tag: 'main-inbound',
    enabled: true,
    settings: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.success = vi.fn();
    mockToast.error = vi.fn();
  });

  describe('Rendering', () => {
    it('should render delete button', () => {
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should display inbound tag and port in confirmation dialog', async () => {
      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: [] },
        message: 'Success',
      });

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/main-inbound/i)).toBeInTheDocument();
        expect(screen.getByText(/port 443/i)).toBeInTheDocument();
      });
    });
  });

  describe('Client Count Fetching', () => {
    it('should fetch and display client count when dialog opens', async () => {
      const mockClients: XrayClient[] = [
        {
          id: 'client-1',
          email: 'user1@example.com',
          uuid: 'uuid-1',
          inbound_id: 'inbound-123',
          inbound_tag: 'main-inbound',
          enabled: true,
          traffic_up: 0,
          traffic_down: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'client-2',
          email: 'user2@example.com',
          uuid: 'uuid-2',
          inbound_id: 'inbound-123',
          inbound_tag: 'main-inbound',
          enabled: true,
          traffic_up: 0,
          traffic_down: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: mockClients },
        message: 'Success',
      });

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      // Should display client count after loading (text is split across elements)
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText(/active/i)).toBeInTheDocument();
        expect(screen.getByText(/deleting this inbound will affect/i)).toBeInTheDocument();
      });
    });

    it('should display warning when inbound has active clients', async () => {
      const mockClients: XrayClient[] = [
        {
          id: 'client-1',
          email: 'user1@example.com',
          uuid: 'uuid-1',
          inbound_id: 'inbound-123',
          inbound_tag: 'main-inbound',
          enabled: true,
          traffic_up: 0,
          traffic_down: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: mockClients },
        message: 'Success',
      });

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/deleting this inbound will affect/i)).toBeInTheDocument();
      });
    });

    it('should display message when inbound has no active clients', async () => {
      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: [] },
        message: 'Success',
      });

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/this inbound has no active clients/i)).toBeInTheDocument();
      });
    });

    it('should handle client fetch errors gracefully', async () => {
      mockXrayApi.clients.list.mockRejectedValue(new Error('Failed to fetch clients'));

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      // Should still allow deletion even if fetch fails
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete inbound/i })).toBeEnabled();
      });
    });
  });

  describe('Deletion', () => {
    it('should call delete API and show success message on confirmation', async () => {
      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: [] },
        message: 'Success',
      });

      mockXrayApi.inbounds.delete.mockResolvedValue({
        success: true,
        data: { message: 'Inbound deleted successfully' },
        message: 'Success',
      });

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      // Wait for dialog to load
      await waitFor(() => {
        expect(screen.getByText(/this inbound has no active clients/i)).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete inbound$/i });
      await user.click(confirmButton);

      // Verify API call
      await waitFor(() => {
        expect(mockXrayApi.inbounds.delete).toHaveBeenCalledWith('inbound-123');
      });

      // Verify success toast
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          expect.stringContaining('main-inbound')
        );
      });
    });

    it('should display error message when deletion fails', async () => {
      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: [] },
        message: 'Success',
      });

      mockXrayApi.inbounds.delete.mockRejectedValue(
        new Error('Failed to delete inbound')
      );

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      // Wait for dialog to load
      await waitFor(() => {
        expect(screen.getByText(/this inbound has no active clients/i)).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete inbound$/i });
      await user.click(confirmButton);

      // Verify error toast
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to delete inbound')
        );
      });

      // Dialog should remain open - check for the dialog title specifically
      expect(screen.getByRole('heading', { name: /delete inbound/i })).toBeInTheDocument();
    });

    it('should disable buttons during deletion', async () => {
      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: [] },
        message: 'Success',
      });

      mockXrayApi.inbounds.delete.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      // Wait for dialog to load
      await waitFor(() => {
        expect(screen.getByText(/this inbound has no active clients/i)).toBeInTheDocument();
      });

      // Start deletion
      const confirmButton = screen.getByRole('button', { name: /delete inbound$/i });
      await user.click(confirmButton);

      // Buttons should be disabled during deletion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
      });
    });
  });

  describe('Cancellation', () => {
    it('should close dialog when cancel button is clicked', async () => {
      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: [] },
        message: 'Success',
      });

      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} />);
      
      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText(/this inbound has no active clients/i)).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should close - the sr-only text should not be visible after close
      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Callback', () => {
    it('should call onSuccess callback after successful deletion', async () => {
      mockXrayApi.clients.list.mockResolvedValue({
        success: true,
        data: { clients: [] },
        message: 'Success',
      });

      mockXrayApi.inbounds.delete.mockResolvedValue({
        success: true,
        data: { message: 'Inbound deleted successfully' },
        message: 'Success',
      });

      const onSuccess = vi.fn();
      const user = userEvent.setup();
      render(<DeleteInboundDialog inbound={mockInbound} onSuccess={onSuccess} />);
      
      // Open dialog
      const deleteButton = screen.getByRole('button', { name: /delete inbound/i });
      await user.click(deleteButton);

      // Wait for dialog to load
      await waitFor(() => {
        expect(screen.getByText(/this inbound has no active clients/i)).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete inbound$/i });
      await user.click(confirmButton);

      // Verify callback was called
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });
});
