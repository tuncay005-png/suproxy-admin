/**
 * Tests for Instance Health Card Component
 * 
 * Validates: Requirements 4.7-4.9
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstanceHealthCard } from './instance-health-card';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { toast } from '@/lib/hooks/use-toast';

// Mock the API
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    instances: {
      getHealth: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('@/lib/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock UI components
vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    />
  ),
}));

describe('InstanceHealthCard', () => {
  const mockHealthHealthy = {
    status: 'healthy' as const,
    uptime: 7380, // 2h 3m
    last_check: '2024-01-01T12:00:00Z',
  };

  const mockHealthUnhealthy = {
    status: 'unhealthy' as const,
    uptime: 0,
    last_check: '2024-01-01T12:00:00Z',
    error_message: 'Connection timeout',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Don't use fake timers by default - only for specific tests that need them
  });

  afterEach(() => {
    vi.useRealTimers(); // Ensure clean state
  });

  it('renders health card with initial data', () => {
    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    expect(screen.getByText('Health Status')).toBeInTheDocument();
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('displays health status with green indicator for healthy', () => {
    const { container } = render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const statusBadge = screen.getByText('healthy').closest('div');
    expect(statusBadge).toHaveClass('text-green-600');
    expect(statusBadge).toHaveClass('bg-green-100');
  });

  it('displays health status with red indicator for unhealthy', () => {
    const { container } = render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthUnhealthy}
      />
    );

    const statusBadge = screen.getByText('unhealthy').closest('div');
    expect(statusBadge).toHaveClass('text-red-600');
    expect(statusBadge).toHaveClass('bg-red-100');
  });

  it('displays health status with gray indicator for unknown', () => {
    const unknownHealth = {
      status: 'unknown' as const,
      uptime: 0,
      last_check: '2024-01-01T12:00:00Z',
    };

    const { container } = render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={unknownHealth}
      />
    );

    const statusBadge = screen.getByText('unknown').closest('div');
    expect(statusBadge).toHaveClass('text-gray-600');
    expect(statusBadge).toHaveClass('bg-gray-100');
  });

  it('formats uptime as human-readable duration', () => {
    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    // 7380 seconds = 2 hours 3 minutes
    expect(screen.getByText('2h 3m')).toBeInTheDocument();
  });

  it('displays last check timestamp', () => {
    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const expectedDate = new Date('2024-01-01T12:00:00Z').toLocaleString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('displays error message when unhealthy', () => {
    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthUnhealthy}
      />
    );

    expect(screen.getByText('Error Message')).toBeInTheDocument();
    expect(screen.getByText('Connection timeout')).toBeInTheDocument();
  });

  it('does not display error message when healthy', () => {
    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    expect(screen.queryByText('Error Message')).not.toBeInTheDocument();
  });

  it('refreshes health data when refresh button clicked', async () => {
    const updatedHealth = {
      status: 'healthy' as const,
      uptime: 7500,
      last_check: '2024-01-01T12:05:00Z',
    };

    vi.mocked(xrayApi.instances.getHealth).mockResolvedValue({
      success: true,
      data: updatedHealth,
    } as any);

    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(xrayApi.instances.getHealth).toHaveBeenCalledWith('instance-1');
      expect(toast.success).toHaveBeenCalledWith('Health data refreshed');
    });
  });

  it('handles refresh error gracefully', async () => {
    vi.mocked(xrayApi.instances.getHealth).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('enables auto-refresh when toggle is activated', () => {
    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const autoRefreshSwitch = screen.getByRole('switch', { name: /auto-refresh/i });
    fireEvent.click(autoRefreshSwitch);

    expect(toast.success).toHaveBeenCalledWith('Auto-refresh enabled (30s)');
  });

  it('disables auto-refresh when toggle is deactivated', () => {
    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const autoRefreshSwitch = screen.getByRole('switch', { name: /auto-refresh/i });
    
    // Enable first
    fireEvent.click(autoRefreshSwitch);
    expect(toast.success).toHaveBeenCalledWith('Auto-refresh enabled (30s)');

    // Then disable
    fireEvent.click(autoRefreshSwitch);
    expect(toast.info).toHaveBeenCalledWith('Auto-refresh disabled');
  });

  it('auto-refreshes data every 30 seconds when enabled', async () => {
    vi.useFakeTimers(); // Enable fake timers for this specific test
    
    vi.mocked(xrayApi.instances.getHealth).mockResolvedValue({
      success: true,
      data: mockHealthHealthy,
    } as any);

    render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const autoRefreshSwitch = screen.getByRole('switch', { name: /auto-refresh/i });
    fireEvent.click(autoRefreshSwitch);

    expect(toast.success).toHaveBeenCalledWith('Auto-refresh enabled (30s)');

    // Clear mocks
    vi.clearAllMocks();

    // Advance time by 30 seconds - this triggers the setInterval callback
    vi.advanceTimersByTime(30000);

    // The API call should have been made
    expect(xrayApi.instances.getHealth).toHaveBeenCalledWith('instance-1');
    
    vi.useRealTimers(); // Clean up
  });

  it('cleans up interval on unmount', () => {
    vi.useFakeTimers(); // Enable fake timers for this specific test
    
    const { unmount } = render(
      <InstanceHealthCard
        instanceId="instance-1"
        initialHealth={mockHealthHealthy}
      />
    );

    const autoRefreshSwitch = screen.getByRole('switch', { name: /auto-refresh/i });
    fireEvent.click(autoRefreshSwitch);

    // Unmount should clear interval
    unmount();

    // Advancing timers after unmount should not cause errors
    expect(() => vi.advanceTimersByTime(30000)).not.toThrow();
    
    vi.useRealTimers(); // Clean up
  });
});
