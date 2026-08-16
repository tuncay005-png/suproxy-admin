/**
 * Instance Control Buttons Component Tests
 * 
 * Tests for Xray instance control operations: start, stop, restart, and reload.
 * 
 * Validates: Requirements 4.3-4.6, 4.10, 16.3, 7.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstanceControlButtons } from './instance-control-buttons';
import { xrayApi } from '@/lib/api/endpoints/xray';
import type { XrayInstance } from '@/types/xray';
import * as toastModule from '@/lib/hooks/use-toast';

// Mock the API
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    instances: {
      start: vi.fn(),
      stop: vi.fn(),
      restart: vi.fn(),
      reload: vi.fn(),
    },
  },
}));

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock the toast module
vi.mock('@/lib/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('InstanceControlButtons', () => {
  const mockStoppedInstance: XrayInstance = {
    id: 'inst-123',
    name: 'Test Instance',
    status: 'stopped',
    server_id: 'server-1',
    server_name: 'Test Server',
    uptime: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockRunningInstance: XrayInstance = {
    ...mockStoppedInstance,
    status: 'running',
    uptime: 3600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Button Visibility - Requirements 4.3-4.6', () => {
    it('shows only Start button when instance is stopped', () => {
      render(<InstanceControlButtons instance={mockStoppedInstance} />);

      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /stop/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /restart/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /reload config/i })).not.toBeInTheDocument();
    });

    it('shows Stop, Restart, and Reload buttons when instance is running', () => {
      render(<InstanceControlButtons instance={mockRunningInstance} />);

      expect(screen.queryByRole('button', { name: /^start$/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload config/i })).toBeInTheDocument();
    });
  });

  describe('Start Operation - Requirement 4.3', () => {
    it('calls API to start instance when Start button clicked', async () => {
      const user = userEvent.setup();
      const mockStart = vi.mocked(xrayApi.instances.start);
      mockStart.mockResolvedValue({ success: true, data: { message: 'Instance started' } });

      render(<InstanceControlButtons instance={mockStoppedInstance} />);

      const startButton = screen.getByRole('button', { name: /start/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(mockStart).toHaveBeenCalledWith('inst-123');
      });
    });

    it('displays success toast after starting instance - Requirement 4.10', async () => {
      const user = userEvent.setup();
      const mockStart = vi.mocked(xrayApi.instances.start);
      mockStart.mockResolvedValue({ success: true, data: { message: 'Instance started' } });

      render(<InstanceControlButtons instance={mockStoppedInstance} />);

      const startButton = screen.getByRole('button', { name: /start/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(toastModule.toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Test Instance')
        );
        expect(toastModule.toast.success).toHaveBeenCalledWith(
          expect.stringContaining('started')
        );
      });
    });

    it('displays error toast when start fails - Requirement 4.10', async () => {
      const user = userEvent.setup();
      const mockStart = vi.mocked(xrayApi.instances.start);
      mockStart.mockRejectedValue(new Error('Failed to start instance'));

      render(<InstanceControlButtons instance={mockStoppedInstance} />);

      const startButton = screen.getByRole('button', { name: /start/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(toastModule.toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to start instance')
        );
      });
    });

    it('shows loading state during start operation', async () => {
      const user = userEvent.setup();
      const mockStart = vi.mocked(xrayApi.instances.start);
      
      // Create a promise that we can resolve later
      let resolveStart: (value: any) => void;
      const startPromise = new Promise((resolve) => {
        resolveStart = resolve;
      });
      mockStart.mockReturnValue(startPromise as any);

      render(<InstanceControlButtons instance={mockStoppedInstance} />);

      const startButton = screen.getByRole('button', { name: /start/i });
      await user.click(startButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/starting/i)).toBeInTheDocument();
        expect(startButton).toBeDisabled();
      });

      // Resolve the promise
      resolveStart!({ success: true, data: { message: 'Instance started' } });
    });
  });

  describe('Stop Operation - Requirement 4.4, 16.3', () => {
    it('shows confirmation dialog when Stop button clicked - Requirement 16.3', async () => {
      const user = userEvent.setup();
      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const stopButton = screen.getByRole('button', { name: /stop/i });
      await user.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText(/stop xray instance/i)).toBeInTheDocument();
        expect(screen.getByText(/test instance/i)).toBeInTheDocument();
        expect(screen.getByText(/interrupt proxy service/i)).toBeInTheDocument();
      });
    });

    it('calls API to stop instance when confirmed', async () => {
      const user = userEvent.setup();
      const mockStop = vi.mocked(xrayApi.instances.stop);
      mockStop.mockResolvedValue({ success: true, data: { message: 'Instance stopped' } });

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      // Open dialog
      const stopButton = screen.getByRole('button', { name: /stop/i });
      await user.click(stopButton);

      // Confirm stop
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop instance/i })).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /stop instance/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockStop).toHaveBeenCalledWith('inst-123');
      });
    });

    it('does not stop when cancelled', async () => {
      const user = userEvent.setup();
      const mockStop = vi.mocked(xrayApi.instances.stop);

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      // Open dialog
      const stopButton = screen.getByRole('button', { name: /stop/i });
      await user.click(stopButton);

      // Cancel
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // API should not be called
      expect(mockStop).not.toHaveBeenCalled();
    });

    it('displays success toast after stopping instance', async () => {
      const user = userEvent.setup();
      const mockStop = vi.mocked(xrayApi.instances.stop);
      mockStop.mockResolvedValue({ success: true, data: { message: 'Instance stopped' } });

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      // Open and confirm dialog
      const stopButton = screen.getByRole('button', { name: /stop/i });
      await user.click(stopButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop instance/i })).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByRole('button', { name: /stop instance/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toastModule.toast.success).toHaveBeenCalledWith(
          expect.stringContaining('stopped')
        );
      });
    });
  });

  describe('Restart Operation - Requirement 4.5', () => {
    it('calls API to restart instance when Restart button clicked', async () => {
      const user = userEvent.setup();
      const mockRestart = vi.mocked(xrayApi.instances.restart);
      mockRestart.mockResolvedValue({ success: true, data: { message: 'Instance restarted' } });

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const restartButton = screen.getByRole('button', { name: /restart/i });
      await user.click(restartButton);

      await waitFor(() => {
        expect(mockRestart).toHaveBeenCalledWith('inst-123');
      });
    });

    it('displays success toast after restarting instance', async () => {
      const user = userEvent.setup();
      const mockRestart = vi.mocked(xrayApi.instances.restart);
      mockRestart.mockResolvedValue({ success: true, data: { message: 'Instance restarted' } });

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const restartButton = screen.getByRole('button', { name: /restart/i });
      await user.click(restartButton);

      await waitFor(() => {
        expect(toastModule.toast.success).toHaveBeenCalledWith(
          expect.stringContaining('restarted')
        );
      });
    });

    it('shows loading state during restart operation', async () => {
      const user = userEvent.setup();
      const mockRestart = vi.mocked(xrayApi.instances.restart);
      
      let resolveRestart: (value: any) => void;
      const restartPromise = new Promise((resolve) => {
        resolveRestart = resolve;
      });
      mockRestart.mockReturnValue(restartPromise as any);

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const restartButton = screen.getByRole('button', { name: /restart/i });
      await user.click(restartButton);

      await waitFor(() => {
        expect(screen.getByText(/restarting/i)).toBeInTheDocument();
        expect(restartButton).toBeDisabled();
      });

      resolveRestart!({ success: true, data: { message: 'Instance restarted' } });
    });
  });

  describe('Reload Config Operation - Requirement 4.6', () => {
    it('calls API to reload config when Reload button clicked', async () => {
      const user = userEvent.setup();
      const mockReload = vi.mocked(xrayApi.instances.reload);
      mockReload.mockResolvedValue({ success: true, data: { message: 'Config reloaded' } });

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const reloadButton = screen.getByRole('button', { name: /reload config/i });
      await user.click(reloadButton);

      await waitFor(() => {
        expect(mockReload).toHaveBeenCalledWith('inst-123');
      });
    });

    it('displays success toast after reloading config', async () => {
      const user = userEvent.setup();
      const mockReload = vi.mocked(xrayApi.instances.reload);
      mockReload.mockResolvedValue({ success: true, data: { message: 'Config reloaded' } });

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const reloadButton = screen.getByRole('button', { name: /reload config/i });
      await user.click(reloadButton);

      await waitFor(() => {
        expect(toastModule.toast.success).toHaveBeenCalledWith(
          expect.stringContaining('reloaded')
        );
      });
    });

    it('shows loading state during reload operation', async () => {
      const user = userEvent.setup();
      const mockReload = vi.mocked(xrayApi.instances.reload);
      
      let resolveReload: (value: any) => void;
      const reloadPromise = new Promise((resolve) => {
        resolveReload = resolve;
      });
      mockReload.mockReturnValue(reloadPromise as any);

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const reloadButton = screen.getByRole('button', { name: /reload config/i });
      await user.click(reloadButton);

      await waitFor(() => {
        expect(screen.getByText(/reloading/i)).toBeInTheDocument();
        expect(reloadButton).toBeDisabled();
      });

      resolveReload!({ success: true, data: { message: 'Config reloaded' } });
    });
  });

  describe('Mutual Exclusion - Requirement 7.2', () => {
    it('disables other buttons during an operation', async () => {
      const user = userEvent.setup();
      const mockRestart = vi.mocked(xrayApi.instances.restart);
      
      let resolveRestart: (value: any) => void;
      const restartPromise = new Promise((resolve) => {
        resolveRestart = resolve;
      });
      mockRestart.mockReturnValue(restartPromise as any);

      render(<InstanceControlButtons instance={mockRunningInstance} />);

      const restartButton = screen.getByRole('button', { name: /restart/i });
      await user.click(restartButton);

      await waitFor(() => {
        const stopButton = screen.getByRole('button', { name: /stop/i });
        const reloadButton = screen.getByRole('button', { name: /reload config/i });
        
        expect(stopButton).toBeDisabled();
        expect(reloadButton).toBeDisabled();
        expect(restartButton).toBeDisabled();
      });

      resolveRestart!({ success: true, data: { message: 'Instance restarted' } });
    });
  });
});
