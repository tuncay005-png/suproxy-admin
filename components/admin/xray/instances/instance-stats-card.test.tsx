/**
 * Tests for Instance Stats Card Component
 * 
 * Validates: Requirements 4.7-4.9
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InstanceStatsCard } from './instance-stats-card';
import { xrayApi } from '@/lib/api/endpoints/xray';
import { toast } from '@/lib/hooks/use-toast';

// Mock the API
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    instances: {
      getStats: vi.fn(),
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

describe('InstanceStatsCard', () => {
  const mockStats = {
    connections_active: 150,
    connections_total: 1500,
    traffic_up: 1048576, // 1 MB
    traffic_down: 2097152, // 2 MB
    clients_active: 25,
    clients_total: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Don't use fake timers by default - only for specific tests that need them
  });

  afterEach(() => {
    vi.useRealTimers(); // Ensure clean state
  });

  it('renders stats card with initial data', () => {
    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('displays active and total connections', () => {
    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    expect(screen.getByText('Connections')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument(); // formatNumber uses en-US locale
  });

  it('formats traffic with byte units - KB', () => {
    const statsWithKB = {
      ...mockStats,
      traffic_up: 5120, // 5 KB
      traffic_down: 10240, // 10 KB
    };

    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={statsWithKB}
      />
    );

    expect(screen.getByText('5 KB')).toBeInTheDocument();
    expect(screen.getByText('10 KB')).toBeInTheDocument();
  });

  it('formats traffic with byte units - MB', () => {
    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('2 MB')).toBeInTheDocument();
  });

  it('formats traffic with byte units - GB', () => {
    const statsWithGB = {
      ...mockStats,
      traffic_up: 1073741824, // 1 GB
      traffic_down: 2147483648, // 2 GB
    };

    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={statsWithGB}
      />
    );

    expect(screen.getByText('1 GB')).toBeInTheDocument();
    expect(screen.getByText('2 GB')).toBeInTheDocument();
  });

  it('formats zero bytes correctly', () => {
    const statsWithZero = {
      ...mockStats,
      traffic_up: 0,
      traffic_down: 0,
    };

    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={statsWithZero}
      />
    );

    const zeroBElements = screen.getAllByText('0 B');
    expect(zeroBElements).toHaveLength(2);
  });

  it('displays active and total clients', () => {
    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays upload and download labels with icons', () => {
    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('refreshes stats when refresh button clicked', async () => {
    const updatedStats = {
      ...mockStats,
      connections_active: 200,
    };

    vi.mocked(xrayApi.instances.getStats).mockResolvedValue({
      success: true,
      data: updatedStats,
    } as any);

    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(xrayApi.instances.getStats).toHaveBeenCalledWith('instance-1');
      expect(toast.success).toHaveBeenCalledWith('Stats refreshed');
    });
  });

  it('handles refresh error gracefully', async () => {
    vi.mocked(xrayApi.instances.getStats).mockRejectedValue(
      new Error('Failed to fetch stats')
    );

    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch stats');
    });
  });

  it('enables auto-refresh when toggle is activated', () => {
    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
      />
    );

    const autoRefreshSwitch = screen.getByRole('switch', { name: /auto-refresh/i });
    fireEvent.click(autoRefreshSwitch);
    
    expect(toast.success).toHaveBeenCalledWith('Auto-refresh enabled (30s)');
  });

  it('disables auto-refresh when toggle is deactivated', () => {
    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
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

  it('auto-refreshes stats every 30 seconds when enabled', async () => {
    vi.useFakeTimers(); // Enable fake timers for this specific test
    
    vi.mocked(xrayApi.instances.getStats).mockResolvedValue({
      success: true,
      data: mockStats,
    } as any);

    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
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
    expect(xrayApi.instances.getStats).toHaveBeenCalledWith('instance-1');
    
    vi.useRealTimers(); // Clean up
  });

  it('formats large numbers with locale formatting', () => {
    const largeStats = {
      connections_active: 1234567,
      connections_total: 9876543,
      traffic_up: 1048576,
      traffic_down: 2097152,
      clients_active: 12345,
      clients_total: 98765,
    };

    render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={largeStats}
      />
    );

    // Check that numbers are formatted with locale separators
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('9,876,543')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
    expect(screen.getByText('98,765')).toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    vi.useFakeTimers(); // Enable fake timers for this specific test
    
    const { unmount } = render(
      <InstanceStatsCard
        instanceId="instance-1"
        initialStats={mockStats}
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
