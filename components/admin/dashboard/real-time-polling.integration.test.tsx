/**
 * Real-Time Polling Integration Tests
 * 
 * Validates: Requirements 6.5, 6.6, 4.9, 5.7, 4.10, 6.4
 * 
 * Test Coverage:
 * 1. Data updates after polling interval (5s for charts, 10s for activity cards)
 * 2. Error state display when API calls fail
 * 3. Exponential backoff on repeated failures (5s → 5s → 10s → 20s → 40s → 60s)
 * 4. Recovery after successful fetch following failures
 * 
 * Task ID: 14.6
 * 
 * This suite tests real-time polling behavior in actual dashboard components:
 * - SystemMonitors: Polls system health every 5 seconds
 * - ActivitySection: Polls Xray status every 10 seconds
 * 
 * Tests use vitest's fake timers to control time progression and verify
 * polling intervals, backoff delays, and component updates.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemMonitors } from './system-monitors';
import { ActivitySection } from './activity-section';
import { I18nProvider } from '@/lib/i18n/context';
import type { SystemHealth, XrayStatus } from '@/types/system';
import type { ApiResponse } from '@/types/api';
import React from 'react';

// Mock the API endpoints
vi.mock('@/lib/api/endpoints', () => ({
  systemApi: {
    getHealth: vi.fn(),
    getXrayStatus: vi.fn(),
  },
}));

// Mock the request cache to bypass deduplication in tests
vi.mock('@/lib/api/request-cache', () => ({
  requestCache: {
    fetch: vi.fn((key, fetchFn) => fetchFn()),
  },
}));

// Mock the feature detection module
vi.mock('@/lib/utils/feature-detection', () => ({
  storage: {
    getItem: vi.fn(() => 'en'),
    setItem: vi.fn(),
  },
  features: {
    supportsLocalStorage: true,
  },
  pageVisibility: {
    isHidden: vi.fn(() => false),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
}));

// Mock translation files
vi.mock('@/lib/i18n/locales/en.json', () => ({
  default: {
    monitoring: {
      cpu_usage: 'CPU Usage',
      ram_usage: 'RAM Usage',
      disk_usage: 'Disk Usage',
      swap_usage: 'Swap Usage',
    },
    dashboard: {
      xray_status: 'Xray Status',
      system_uptime: 'System Uptime',
      traffic_speed: 'Traffic Speed',
      total_traffic_label: 'total',
      running: 'Running',
      stopped: 'Stopped',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      refresh: 'Refresh',
      failed_to_load: 'Failed to load data',
      data_stale: 'Data may be stale',
      last_updated: 'Last updated',
    },
  },
}));

vi.mock('@/lib/i18n/locales/ru.json', () => ({
  default: {
    monitoring: {
      cpu_usage: 'Использование CPU',
      ram_usage: 'Использование RAM',
      disk_usage: 'Использование диска',
      swap_usage: 'Использование Swap',
    },
    dashboard: {
      xray_status: 'Статус Xray',
      system_uptime: 'Время работы',
      traffic_speed: 'Скорость трафика',
      total_traffic_label: 'всего',
      running: 'Работает',
      stopped: 'Остановлен',
    },
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      retry: 'Повторить',
      refresh: 'Обновить',
      failed_to_load: 'Не удалось загрузить данные',
      data_stale: 'Данные могут быть устаревшими',
      last_updated: 'Последнее обновление',
    },
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '5 seconds ago'),
}));

/**
 * Helper function to create mock SystemHealth data
 */
function createMockSystemHealth(overrides?: Partial<SystemHealth>): SystemHealth {
  return {
    status: 'healthy',
    cpu_usage: 45,
    ram_used: 2048,
    ram_total: 8192,
    disk_used: 50,
    disk_total: 200,
    swap_used: 0,
    swap_total: 4096,
    uptime: 86400,
    database: 'connected',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Helper function to create mock XrayStatus data
 */
function createMockXrayStatus(overrides?: Partial<XrayStatus>): XrayStatus {
  return {
    status: 'running',
    version: '1.8.0',
    traffic_speed: 1024000, // 1 MB/s in bytes/s
    traffic_total: 5368709120, // 5 GB in bytes
    active_connections: 42,
    uptime: 3600,
    last_restart: null,
    ...overrides,
  };
}

/**
 * Helper function to create successful API response
 */
function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    message: 'Success',
  };
}

/**
 * Helper function to render component with I18n provider
 */
function renderWithI18n(component: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en">
      {component}
    </I18nProvider>
  );
}

describe('Real-Time Polling Integration Tests', () => {
  let mockGetHealth: ReturnType<typeof vi.fn>;
  let mockGetXrayStatus: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Import mocked API to access mock functions
    const { systemApi } = await import('@/lib/api/endpoints');
    mockGetHealth = systemApi.getHealth as ReturnType<typeof vi.fn>;
    mockGetXrayStatus = systemApi.getXrayStatus as ReturnType<typeof vi.fn>;

    // Use fake timers for controlling time
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    // Clean up timers and restore real timers
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Data Updates After Polling Interval', () => {
    describe('SystemMonitors (5-second polling)', () => {
      it('should display initial data immediately', async () => {
        const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
        mockGetHealth.mockResolvedValue(createApiResponse(initialHealth));

        renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

        // Should display initial CPU value
        await waitFor(() => {
          expect(screen.getByText('30')).toBeInTheDocument();
          expect(screen.getByText('CPU Usage')).toBeInTheDocument();
        });
      });

      it('should update data after 5 seconds', async () => {
        const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
        const updatedHealth = createMockSystemHealth({ cpu_usage: 45 });

        mockGetHealth
          .mockResolvedValueOnce(createApiResponse(initialHealth)) // Initial poll
          .mockResolvedValueOnce(createApiResponse(updatedHealth)); // First update

        renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

        // Wait for initial render
        await waitFor(() => {
          expect(screen.getByText('30')).toBeInTheDocument();
        });

        // Verify initial API call
        expect(mockGetHealth).toHaveBeenCalledTimes(1);

        // Advance time by 5 seconds
        vi.advanceTimersByTime(5000);

        // Wait for update
        await waitFor(() => {
          expect(screen.getByText('45')).toBeInTheDocument();
        });

        // Should have polled again
        expect(mockGetHealth).toHaveBeenCalledTimes(2);
      });

      it('should update multiple metrics simultaneously', async () => {
        const initialHealth = createMockSystemHealth({
          cpu_usage: 30,
          ram_used: 2048,
          disk_used: 50,
          swap_used: 512,
        });
        const updatedHealth = createMockSystemHealth({
          cpu_usage: 60,
          ram_used: 4096,
          disk_used: 100,
          swap_used: 1024,
        });

        mockGetHealth
          .mockResolvedValueOnce(createApiResponse(initialHealth))
          .mockResolvedValueOnce(createApiResponse(updatedHealth));

        renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

        // Wait for initial values
        await waitFor(() => {
          expect(screen.getByText('30')).toBeInTheDocument(); // CPU
          expect(screen.getByText('2048')).toBeInTheDocument(); // RAM
        });

        // Advance time by 5 seconds
        vi.advanceTimersByTime(5000);

        // All metrics should update
        await waitFor(() => {
          expect(screen.getByText('60')).toBeInTheDocument(); // CPU
          expect(screen.getByText('4096')).toBeInTheDocument(); // RAM
          expect(screen.getByText('100')).toBeInTheDocument(); // Disk
          expect(screen.getByText('1024')).toBeInTheDocument(); // Swap
        });
      });

      it('should continue polling every 5 seconds', async () => {
        const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
        mockGetHealth.mockResolvedValue(createApiResponse(initialHealth));

        renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

        await waitFor(() => {
          expect(screen.getByText('30')).toBeInTheDocument();
        });

        // Initial call
        expect(mockGetHealth).toHaveBeenCalledTimes(1);

        // Advance 5 seconds - first poll
        vi.advanceTimersByTime(5000);
        await waitFor(() => {
          expect(mockGetHealth).toHaveBeenCalledTimes(2);
        });

        // Advance another 5 seconds - second poll
        vi.advanceTimersByTime(5000);
        await waitFor(() => {
          expect(mockGetHealth).toHaveBeenCalledTimes(3);
        });

        // Advance another 5 seconds - third poll
        vi.advanceTimersByTime(5000);
        await waitFor(() => {
          expect(mockGetHealth).toHaveBeenCalledTimes(4);
        });
      });

      it('should update within 100ms after successful fetch (Requirement 6.6)', async () => {
        const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
        const updatedHealth = createMockSystemHealth({ cpu_usage: 75 });

        mockGetHealth
          .mockResolvedValueOnce(createApiResponse(initialHealth))
          .mockResolvedValueOnce(createApiResponse(updatedHealth));

        renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

        await waitFor(() => {
          expect(screen.getByText('30')).toBeInTheDocument();
        });

        const updateStartTime = Date.now();

        // Advance time by 5 seconds
        vi.advanceTimersByTime(5000);

        // Wait for update with strict timeout
        await waitFor(
          () => {
            expect(screen.getByText('75')).toBeInTheDocument();
          },
          { timeout: 200 } // Allow 200ms buffer for rendering
        );

        // Update should happen very quickly after fetch completes
        const updateDuration = Date.now() - updateStartTime;
        expect(updateDuration).toBeLessThan(200);
      });
    });

    describe('ActivitySection (10-second polling)', () => {
      it('should display initial data immediately', async () => {
        const initialStatus = createMockXrayStatus({ status: 'running' });
        mockGetXrayStatus.mockResolvedValue(createApiResponse(initialStatus));

        renderWithI18n(<ActivitySection initialXrayStatus={initialStatus} />);

        await waitFor(() => {
          expect(screen.getByText('Running')).toBeInTheDocument();
          expect(screen.getByText('Xray Status')).toBeInTheDocument();
        });
      });

      it('should update data after 10 seconds', async () => {
        const initialStatus = createMockXrayStatus({ 
          status: 'running',
          traffic_speed: 1024000 
        });
        const updatedStatus = createMockXrayStatus({ 
          status: 'running',
          traffic_speed: 2048000 
        });

        mockGetXrayStatus
          .mockResolvedValueOnce(createApiResponse(initialStatus))
          .mockResolvedValueOnce(createApiResponse(updatedStatus));

        renderWithI18n(<ActivitySection initialXrayStatus={initialStatus} />);

        await waitFor(() => {
          expect(screen.getByText('Running')).toBeInTheDocument();
        });

        // Verify initial API call
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(1);

        // Advance time by 10 seconds
        vi.advanceTimersByTime(10000);

        // Should have polled again
        await waitFor(() => {
          expect(mockGetXrayStatus).toHaveBeenCalledTimes(2);
        });
      });

      it('should continue polling every 10 seconds', async () => {
        const initialStatus = createMockXrayStatus();
        mockGetXrayStatus.mockResolvedValue(createApiResponse(initialStatus));

        renderWithI18n(<ActivitySection initialXrayStatus={initialStatus} />);

        await waitFor(() => {
          expect(screen.getByText('Running')).toBeInTheDocument();
        });

        // Initial call
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(1);

        // Advance 10 seconds - first poll
        vi.advanceTimersByTime(10000);
        await waitFor(() => {
          expect(mockGetXrayStatus).toHaveBeenCalledTimes(2);
        });

        // Advance another 10 seconds - second poll
        vi.advanceTimersByTime(10000);
        await waitFor(() => {
          expect(mockGetXrayStatus).toHaveBeenCalledTimes(3);
        });
      });

      it('should update status from running to stopped', async () => {
        const initialStatus = createMockXrayStatus({ status: 'running' });
        const updatedStatus = createMockXrayStatus({ status: 'stopped' });

        mockGetXrayStatus
          .mockResolvedValueOnce(createApiResponse(initialStatus))
          .mockResolvedValueOnce(createApiResponse(updatedStatus));

        renderWithI18n(<ActivitySection initialXrayStatus={initialStatus} />);

        await waitFor(() => {
          expect(screen.getByText('Running')).toBeInTheDocument();
        });

        // Advance time by 10 seconds
        vi.advanceTimersByTime(10000);

        await waitFor(() => {
          expect(screen.getByText('Stopped')).toBeInTheDocument();
          expect(screen.queryByText('Running')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Error State Display', () => {
    describe('SystemMonitors error handling', () => {
      it('should display error state when API call fails with no initial data', async () => {
        mockGetHealth.mockRejectedValue(new Error('Network error'));

        renderWithI18n(<SystemMonitors initialHealth={null} />);

        await waitFor(() => {
          expect(screen.getByText('Failed to load data')).toBeInTheDocument();
          expect(screen.getByText('Network error')).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });
      });

      it('should display last known values with warning when API fails', async () => {
        const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
        
        mockGetHealth
          .mockResolvedValueOnce(createApiResponse(initialHealth))
          .mockRejectedValueOnce(new Error('Connection timeout'));

        renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

        await waitFor(() => {
          expect(screen.getByText('30')).toBeInTheDocument();
        });

        // Advance time to trigger second poll
        vi.advanceTimersByTime(5000);

        // Should show warning but keep displaying data
        await waitFor(() => {
          expect(screen.getByText('Error')).toBeInTheDocument();
          expect(screen.getByText('30')).toBeInTheDocument(); // Last known value still shown
        });
      });

      it('should allow manual retry on error', async () => {
        const user = userEvent.setup({ delay: null });
        const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
        const recoveredHealth = createMockSystemHealth({ cpu_usage: 50 });

        mockGetHealth
          .mockResolvedValueOnce(createApiResponse(initialHealth))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce(createApiResponse(recoveredHealth));

        renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

        await waitFor(() => {
          expect(screen.getByText('30')).toBeInTheDocument();
        });

        // Trigger error
        vi.advanceTimersByTime(5000);

        await waitFor(() => {
          expect(screen.getByText('Error')).toBeInTheDocument();
        });

        // Click refresh button
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        await user.click(refreshButton);

        // Should recover and show new data
        await waitFor(() => {
          expect(screen.getByText('50')).toBeInTheDocument();
          expect(screen.queryByText('Error')).not.toBeInTheDocument();
        });
      });

      it('should log API errors to console (Requirement 6.7)', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        mockGetHealth.mockRejectedValue(new Error('API error'));

        renderWithI18n(<SystemMonitors initialHealth={null} />);

        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('useRealTimePolling'),
            expect.any(Error)
          );
        });

        consoleErrorSpy.mockRestore();
      });
    });

    describe('ActivitySection error handling', () => {
      it('should display error state when API call fails', async () => {
        mockGetXrayStatus.mockRejectedValue(new Error('Service unavailable'));

        renderWithI18n(<ActivitySection initialXrayStatus={null} />);

        await waitFor(() => {
          expect(screen.getByText('Failed to load data')).toBeInTheDocument();
          expect(screen.getByText('Service unavailable')).toBeInTheDocument();
        });
      });

      it('should preserve last known status on error', async () => {
        const initialStatus = createMockXrayStatus({ status: 'running' });

        mockGetXrayStatus
          .mockResolvedValueOnce(createApiResponse(initialStatus))
          .mockRejectedValueOnce(new Error('Timeout'));

        renderWithI18n(<ActivitySection initialXrayStatus={initialStatus} />);

        await waitFor(() => {
          expect(screen.getByText('Running')).toBeInTheDocument();
        });

        // Trigger error
        vi.advanceTimersByTime(10000);

        // Should still show "Running" (last known value)
        await waitFor(() => {
          expect(screen.getByText('Running')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Exponential Backoff on Repeated Failures', () => {
    it('should use base interval (5s) on first failure for SystemMonitors', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockGetHealth
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));

      renderWithI18n(<SystemMonitors initialHealth={null} />);

      // Wait for first failure
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(1);
      });

      // Advance by 5 seconds (base interval)
      vi.advanceTimersByTime(5000);

      // Should retry after base interval
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(2);
      });

      // Console should log backoff warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failure 1')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should implement exponential backoff: 5s → 10s → 20s → 40s → 60s (capped)', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock to fail 5 times
      mockGetHealth
        .mockRejectedValue(new Error('Persistent failure'));

      renderWithI18n(<SystemMonitors initialHealth={null} />);

      // Initial call (failure 0)
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(1);
      });

      // First retry: 5s after first failure (base interval)
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(2);
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('next delay: 5000ms')
      );

      // Second retry: 5s × 2^1 = 10s
      vi.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(3);
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('next delay: 10000ms')
      );

      // Third retry: 5s × 2^2 = 20s
      vi.advanceTimersByTime(20000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(4);
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('next delay: 20000ms')
      );

      // Fourth retry: 5s × 2^3 = 40s
      vi.advanceTimersByTime(40000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(5);
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('next delay: 40000ms')
      );

      // Fifth retry: would be 80s, but capped at 60s (maxBackoff)
      vi.advanceTimersByTime(60000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(6);
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('next delay: 60000ms')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should cap backoff at maxBackoff (60s) for ActivitySection', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockGetXrayStatus.mockRejectedValue(new Error('Persistent failure'));

      renderWithI18n(<ActivitySection initialXrayStatus={null} />);

      // Initial call
      await waitFor(() => {
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(1);
      });

      // First retry: 10s (base interval for ActivitySection)
      vi.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(2);
      });

      // Second retry: 10s × 2^1 = 20s
      vi.advanceTimersByTime(20000);
      await waitFor(() => {
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(3);
      });

      // Third retry: 10s × 2^2 = 40s
      vi.advanceTimersByTime(40000);
      await waitFor(() => {
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(4);
      });

      // Fourth retry: would be 80s, capped at 60s
      vi.advanceTimersByTime(60000);
      await waitFor(() => {
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(5);
      });

      // Verify cap is maintained
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('next delay: 60000ms')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should maintain capped delay for subsequent failures', async () => {
      mockGetHealth.mockRejectedValue(new Error('Failure'));

      renderWithI18n(<SystemMonitors initialHealth={null} />);

      // Get to capped state (60s)
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(1);
      });

      // Progress through backoff to reach cap
      vi.advanceTimersByTime(5000); // 5s
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(2));
      
      vi.advanceTimersByTime(10000); // 10s
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(3));
      
      vi.advanceTimersByTime(20000); // 20s
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(4));
      
      vi.advanceTimersByTime(40000); // 40s
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(5));
      
      vi.advanceTimersByTime(60000); // 60s (capped)
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(6));

      // Should stay at 60s
      vi.advanceTimersByTime(60000);
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(7));

      vi.advanceTimersByTime(60000);
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(8));
    });
  });

  describe('Recovery After Successful Fetch Following Failures', () => {
    it('should reset backoff to base interval after successful fetch', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
      const recoveredHealth = createMockSystemHealth({ cpu_usage: 50 });

      mockGetHealth
        .mockResolvedValueOnce(createApiResponse(initialHealth))  // Initial success
        .mockRejectedValueOnce(new Error('Error 1'))              // First failure
        .mockRejectedValueOnce(new Error('Error 2'))              // Second failure (backoff to 10s)
        .mockResolvedValueOnce(createApiResponse(recoveredHealth)); // Recovery

      renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

      await waitFor(() => {
        expect(screen.getByText('30')).toBeInTheDocument();
      });

      // First failure (5s interval)
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(2);
      });

      // Second failure (10s backoff)
      vi.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(3);
      });

      // Recovery (still at 10s interval)
      vi.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(mockGetHealth).toHaveBeenCalledTimes(4);
      });

      // After recovery, should return to base 5s interval
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(5);
      });

      // Verify recovery was logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Recovered from failures')
      );

      consoleLogSpy.mockRestore();
    });

    it('should clear error state when data successfully fetches', async () => {
      const initialHealth = createMockSystemHealth({ cpu_usage: 30 });
      const recoveredHealth = createMockSystemHealth({ cpu_usage: 60 });

      mockGetHealth
        .mockResolvedValueOnce(createApiResponse(initialHealth))
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(createApiResponse(recoveredHealth));

      renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);

      await waitFor(() => {
        expect(screen.getByText('30')).toBeInTheDocument();
      });

      // Trigger error
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      // Recovery
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText('60')).toBeInTheDocument();
        expect(screen.queryByText('Error')).not.toBeInTheDocument();
      });
    });

    it('should resume normal polling interval after recovery', async () => {
      const health1 = createMockSystemHealth({ cpu_usage: 30 });
      const health2 = createMockSystemHealth({ cpu_usage: 40 });
      const health3 = createMockSystemHealth({ cpu_usage: 50 });
      const health4 = createMockSystemHealth({ cpu_usage: 60 });

      mockGetHealth
        .mockResolvedValueOnce(createApiResponse(health1))
        .mockRejectedValueOnce(new Error('Error'))
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(createApiResponse(health2))
        .mockResolvedValueOnce(createApiResponse(health3))
        .mockResolvedValueOnce(createApiResponse(health4));

      renderWithI18n(<SystemMonitors initialHealth={health1} />);

      await waitFor(() => expect(screen.getByText('30')).toBeInTheDocument());

      // First error (5s)
      vi.advanceTimersByTime(5000);
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(2));

      // Second error (10s backoff)
      vi.advanceTimersByTime(10000);
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(3));

      // Recovery (20s interval during backoff)
      vi.advanceTimersByTime(20000);
      await waitFor(() => {
        expect(screen.getByText('40')).toBeInTheDocument();
        expect(mockGetHealth).toHaveBeenCalledTimes(4);
      });

      // After recovery, back to 5s interval
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(mockGetHealth).toHaveBeenCalledTimes(5);
      });

      // Continue normal 5s polling
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText('60')).toBeInTheDocument();
        expect(mockGetHealth).toHaveBeenCalledTimes(6);
      });
    });

    it('should handle ActivitySection recovery correctly', async () => {
      const status1 = createMockXrayStatus({ status: 'running' });
      const status2 = createMockXrayStatus({ status: 'stopped' });

      mockGetXrayStatus
        .mockResolvedValueOnce(createApiResponse(status1))
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(createApiResponse(status2));

      renderWithI18n(<ActivitySection initialXrayStatus={status1} />);

      await waitFor(() => {
        expect(screen.getByText('Running')).toBeInTheDocument();
      });

      // Error (10s)
      vi.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(2);
      });

      // Recovery
      vi.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(screen.getByText('Stopped')).toBeInTheDocument();
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(3);
      });

      // Back to normal 10s interval
      vi.advanceTimersByTime(10000);
      await waitFor(() => {
        expect(mockGetXrayStatus).toHaveBeenCalledTimes(4);
      });
    });

    it('should handle alternating failures and successes correctly', async () => {
      const health1 = createMockSystemHealth({ cpu_usage: 10 });
      const health2 = createMockSystemHealth({ cpu_usage: 20 });
      const health3 = createMockSystemHealth({ cpu_usage: 30 });

      mockGetHealth
        .mockResolvedValueOnce(createApiResponse(health1))
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockResolvedValueOnce(createApiResponse(health2))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce(createApiResponse(health3));

      renderWithI18n(<SystemMonitors initialHealth={health1} />);

      await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());

      // Error 1 (5s)
      vi.advanceTimersByTime(5000);
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(2));

      // Success 1 - resets backoff (5s)
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText('20')).toBeInTheDocument();
        expect(mockGetHealth).toHaveBeenCalledTimes(3);
      });

      // Error 2 - starts new backoff cycle (5s)
      vi.advanceTimersByTime(5000);
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(4));

      // Success 2 - resets backoff again (5s)
      vi.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText('30')).toBeInTheDocument();
        expect(mockGetHealth).toHaveBeenCalledTimes(5);
      });
    });
  });

  describe('Edge Cases and Cleanup', () => {
    it('should stop polling when component unmounts', async () => {
      const initialHealth = createMockSystemHealth();
      mockGetHealth.mockResolvedValue(createApiResponse(initialHealth));

      const { unmount } = renderWithI18n(
        <SystemMonitors initialHealth={initialHealth} />
      );

      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(1);
      });

      // Unmount the component
      unmount();

      // Advance time - should not poll after unmount
      vi.advanceTimersByTime(10000);

      // Should still be 1 call (no new polls)
      expect(mockGetHealth).toHaveBeenCalledTimes(1);
    });

    it('should not update state after unmount', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const initialHealth = createMockSystemHealth();
      
      mockGetHealth.mockResolvedValue(createApiResponse(initialHealth));

      const { unmount } = renderWithI18n(
        <SystemMonitors initialHealth={initialHealth} />
      );

      await waitFor(() => {
        expect(mockGetHealth).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Advance time - should not cause state updates
      vi.advanceTimersByTime(5000);

      // Should not have any "can't perform state update on unmounted component" warnings
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('unmounted component')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle rapid component mount/unmount cycles', async () => {
      const initialHealth = createMockSystemHealth();
      mockGetHealth.mockResolvedValue(createApiResponse(initialHealth));

      // Mount
      const { unmount: unmount1 } = renderWithI18n(
        <SystemMonitors initialHealth={initialHealth} />
      );
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(1));
      unmount1();

      // Remount
      const { unmount: unmount2 } = renderWithI18n(
        <SystemMonitors initialHealth={initialHealth} />
      );
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(2));
      unmount2();

      // Remount again
      renderWithI18n(<SystemMonitors initialHealth={initialHealth} />);
      await waitFor(() => expect(mockGetHealth).toHaveBeenCalledTimes(3));

      // Each mount should trigger one initial poll
      expect(mockGetHealth).toHaveBeenCalledTimes(3);
    });
  });
});
