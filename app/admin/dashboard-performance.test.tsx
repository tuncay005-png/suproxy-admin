/**
 * Performance Tests for Dashboard Data Fetching
 * 
 * Tests the parallel data fetching optimization in getDashboardData
 * 
 * Validates: Requirements 6.8, 12.4
 * - 6.8: Dashboard executes multiple API calls in parallel for optimal performance
 * - 12.4: Uses React Server Components for initial page load optimization
 * 
 * Task 11.2: Optimize Server Components data fetching
 * - Uses Promise.allSettled for parallel API calls
 * - Handles partial failures gracefully
 * - Logs fetch timing for performance monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock API endpoints before importing the module
vi.mock('@/lib/api/endpoints', () => ({
  systemApi: {
    getStats: vi.fn(),
    getHealth: vi.fn(),
    getXrayStatus: vi.fn(),
  },
  serversApi: {
    list: vi.fn(),
  },
  plansApi: {
    list: vi.fn(),
  },
  auditApi: {
    getLogs: vi.fn(),
  },
}));

import { systemApi, serversApi, plansApi, auditApi } from '@/lib/api/endpoints';

// We can't directly test getDashboardData since it's not exported,
// but we can test the parallel execution behavior through the mocks

describe('Dashboard Data Fetching Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should execute all API calls in parallel using Promise.allSettled', async () => {
    // Setup mocks with delays to test parallelism
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await delay(50);
      return { data: { total_users: 100, active_users: 50 } };
    });
    
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await delay(50);
      return { data: { status: 'healthy' } };
    });
    
    (systemApi.getXrayStatus as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await delay(50);
      return { data: { status: 'running' } };
    });
    
    (serversApi.list as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await delay(50);
      return { data: { servers: [] } };
    });
    
    (plansApi.list as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await delay(50);
      return { data: { plans: [] } };
    });
    
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      await delay(50);
      return { data: { logs: [], total: 0 } };
    });

    // Import and render the dashboard page
    const DashboardPage = (await import('./page')).default;
    
    const startTime = performance.now();
    await DashboardPage();
    const endTime = performance.now();
    
    // If calls were parallel, total time should be ~50ms (one batch)
    // If sequential, it would be ~300ms (6 × 50ms)
    // Allow some overhead for execution
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(200); // Much less than 300ms sequential time
    
    // Verify all API calls were made
    expect(systemApi.getStats).toHaveBeenCalledTimes(1);
    expect(systemApi.getHealth).toHaveBeenCalledTimes(1);
    expect(systemApi.getXrayStatus).toHaveBeenCalledTimes(1);
    expect(serversApi.list).toHaveBeenCalledTimes(1);
    expect(plansApi.list).toHaveBeenCalledTimes(1);
    expect(auditApi.getLogs).toHaveBeenCalledTimes(1);
  });

  it('should handle partial API failures gracefully', async () => {
    // Setup mocks where some succeed and some fail
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { total_users: 100, active_users: 50 },
    });
    
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Health API unavailable')
    );
    
    (systemApi.getXrayStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { status: 'running' },
    });
    
    (serversApi.list as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Servers API unavailable')
    );
    
    (plansApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { plans: [{ id: '1', name: 'Basic', active: true }] },
    });
    
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Audit API unavailable')
    );

    // Import and render the dashboard page - should not throw
    const DashboardPage = (await import('./page')).default;
    
    await expect(DashboardPage()).resolves.toBeDefined();
    
    // Verify error logging occurred for failed calls
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[DASHBOARD] Failed to fetch system health'),
      expect.any(Error)
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[DASHBOARD] Failed to fetch servers'),
      expect.any(Error)
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[DASHBOARD] Failed to fetch audit logs'),
      expect.any(Error)
    );
  });

  it('should log performance timing information', async () => {
    // Setup basic mocks
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { total_users: 100 },
    });
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { status: 'healthy' },
    });
    (systemApi.getXrayStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { status: 'running' },
    });
    (serversApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { servers: [] },
    });
    (plansApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { plans: [] },
    });
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { logs: [], total: 0 },
    });

    // Import and render the dashboard page
    const DashboardPage = (await import('./page')).default;
    await DashboardPage();
    
    // Verify timing logs are present
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[DASHBOARD-TIMING] Starting data fetch')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/\[DASHBOARD-TIMING\] Parallel fetch completed in \d+\.\d+ms/)
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/\[DASHBOARD-TIMING\] Total getDashboardData time: \d+\.\d+ms/)
    );
  });

  it('should handle complete API failure gracefully', async () => {
    // Setup mocks to all fail
    const error = new Error('Complete backend unavailable');
    
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    (systemApi.getXrayStatus as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    (serversApi.list as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    (plansApi.list as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    // Import and render the dashboard page - should not throw
    const DashboardPage = (await import('./page')).default;
    
    await expect(DashboardPage()).resolves.toBeDefined();
    
    // Verify all errors were logged
    expect(console.error).toHaveBeenCalledTimes(6); // One for each API call
    
    // Verify timing log still occurs
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/\[DASHBOARD-TIMING\] Total getDashboardData time: \d+\.\d+ms/)
    );
  });

  it('should use auditApi.getLogs with correct parameters', async () => {
    // Setup mocks
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });
    (systemApi.getXrayStatus as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });
    (serversApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { servers: [] } });
    (plansApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { plans: [] } });
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { logs: [], total: 0 } });

    // Import and render the dashboard page
    const DashboardPage = (await import('./page')).default;
    await DashboardPage();
    
    // Verify auditApi.getLogs was called with correct pagination
    expect(auditApi.getLogs).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });
});
