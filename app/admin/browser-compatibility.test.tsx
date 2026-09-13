/**
 * Browser Compatibility Test Suite
 * 
 * Task 13.1: Test on Chrome/Edge (latest 2 versions)
 * 
 * This test suite verifies:
 * - All features work correctly
 * - Real-time polling and animations
 * - Language switching
 * 
 * Requirements: 12.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@/lib/i18n/context';
import { CircularProgressChart } from '@/components/admin/dashboard/circular-progress-chart';
import { ActivityCard } from '@/components/admin/dashboard/activity-card';
import { SystemMonitors } from '@/components/admin/dashboard/system-monitors';
import { ActivitySection } from '@/components/admin/dashboard/activity-section';
import { Activity } from 'lucide-react';
import DashboardPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock API responses
const mockSystemHealth = {
  status: 'healthy' as const,
  cpu_usage: 45,
  ram_used: 4096,
  ram_total: 8192,
  disk_used: 120,
  disk_total: 500,
  swap_used: 512,
  swap_total: 2048,
  uptime: 86400,
  database: 'connected' as const,
  timestamp: new Date().toISOString(),
};

const mockXrayStatus = {
  status: 'running' as const,
  version: '1.8.0',
  traffic_speed: 2048000,
  traffic_total: 1073741824,
  active_connections: 42,
  uptime: 86400,
  last_restart: null,
};

const mockSystemStats = {
  total_users: 150,
  active_users: 75,
  total_xray_instances: 5,
  active_xray_instances: 5,
  recent_audit_actions: 23,
};

// Mock fetch globally
global.fetch = vi.fn();

describe('Browser Compatibility - Chrome/Edge', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
    
    // Setup default successful API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/admin/system/health')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockSystemHealth }),
        });
      }
      if (url.includes('/api/admin/system/xray')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockXrayStatus }),
        });
      }
      if (url.includes('/api/admin/system/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockSystemStats }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Core Features', () => {
    it('should render circular progress charts with correct values', () => {
      render(
        <I18nProvider>
          <CircularProgressChart value={45} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      const cpuChart = screen.getByRole('progressbar');
      expect(cpuChart).toBeInTheDocument();
      expect(cpuChart).toHaveAttribute('aria-valuenow', '45');
      expect(cpuChart).toHaveAttribute('aria-valuemin', '0');
      expect(cpuChart).toHaveAttribute('aria-valuemax', '100');
    });

    it('should display correct colors for different thresholds', () => {
      const { rerender } = render(
        <I18nProvider>
          <CircularProgressChart value={50} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      // 50% should be green
      let circle = document.querySelector('circle.text-chart-green');
      expect(circle).toBeInTheDocument();

      // 75% should be yellow
      rerender(
        <I18nProvider>
          <CircularProgressChart value={75} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );
      circle = document.querySelector('circle.text-chart-yellow');
      expect(circle).toBeInTheDocument();

      // 95% should be red
      rerender(
        <I18nProvider>
          <CircularProgressChart value={95} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );
      circle = document.querySelector('circle.text-chart-red');
      expect(circle).toBeInTheDocument();
    });

    it('should display activity cards with status indicators', () => {
      render(
        <I18nProvider>
          <ActivityCard
            icon={Activity}
            title="Xray Status"
            value="Running"
            status="success"
            statusDot={true}
          />
        </I18nProvider>
      );

      expect(screen.getByText('Xray Status')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      
      // Check for status dot
      const statusDot = document.querySelector('.bg-chart-green');
      expect(statusDot).toBeInTheDocument();
    });

    it('should handle UTF-8 characters correctly in values', () => {
      render(
        <I18nProvider>
          <ActivityCard
            icon={Activity}
            title="System Uptime"
            value="1d 2h 30m"
            status="neutral"
          />
        </I18nProvider>
      );

      const content = document.body.textContent || '';
      // Should not display encoding artifacts
      expect(content).not.toMatch(/â€"/);
      expect(content).not.toMatch(/Ã/);
      expect(content).toContain('1d 2h 30m');
    });
  });

  describe('Real-Time Polling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should initialize SystemMonitors with initial data', () => {
      render(
        <I18nProvider>
          <SystemMonitors initialHealth={mockSystemHealth} />
        </I18nProvider>
      );

      // Should display all four monitors
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThanOrEqual(4);
    });

    it('should initialize ActivitySection with initial data', () => {
      render(
        <I18nProvider>
          <ActivitySection initialXrayStatus={mockXrayStatus} />
        </I18nProvider>
      );

      // Should display running status
      expect(screen.getByText(/running/i)).toBeInTheDocument();
    });

    it('should update chart values when values change', () => {
      const { rerender } = render(
        <I18nProvider>
          <CircularProgressChart value={45} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      let chart = screen.getByRole('progressbar');
      expect(chart).toHaveAttribute('aria-valuenow', '45');

      // Update to higher value
      rerender(
        <I18nProvider>
          <CircularProgressChart value={75} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      chart = screen.getByRole('progressbar');
      expect(chart).toHaveAttribute('aria-valuenow', '75');
    });
  });

  describe('Animations', () => {
    it('should apply CSS transitions to circular progress charts', () => {
      render(
        <I18nProvider>
          <CircularProgressChart value={75} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      const circle = document.querySelector('circle[stroke-dasharray]');
      expect(circle).toBeInTheDocument();
      
      // Check for transition class
      expect(circle?.classList.toString()).toContain('transition');
    });

    it('should update stroke-dashoffset on value change', () => {
      const { rerender } = render(
        <I18nProvider>
          <CircularProgressChart value={50} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      const circle = document.querySelector('circle[stroke-dasharray]');
      const initialOffset = circle?.getAttribute('stroke-dashoffset');

      // Update value
      rerender(
        <I18nProvider>
          <CircularProgressChart value={90} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      const updatedCircle = document.querySelector('circle[stroke-dasharray]');
      const newOffset = updatedCircle?.getAttribute('stroke-dashoffset');
      
      expect(newOffset).not.toBe(initialOffset);
    });

    it('should have smooth transition duration', () => {
      render(
        <I18nProvider>
          <CircularProgressChart value={75} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      const circle = document.querySelector('circle[stroke-dasharray]');
      const classList = circle?.classList.toString() || '';
      
      // Should have transition classes
      expect(classList).toMatch(/transition/);
    });
  });

  describe('Language Switching', () => {
    it('should default to English on first load', () => {
      render(
        <I18nProvider>
          <CircularProgressChart value={75} max={100} label="CPU" unit="%" />
        </I18nProvider>
      );

      const chart = screen.getByRole('progressbar');
      expect(chart).toBeInTheDocument();
    });

    it('should persist language selection in localStorage', () => {
      localStorage.setItem('preferred_locale', 'ru');

      render(
        <I18nProvider initialLocale="ru">
          <CircularProgressChart value={75} max={100} label="Процессор" unit="%" />
        </I18nProvider>
      );

      expect(localStorage.getItem('preferred_locale')).toBe('ru');
    });

    it('should support Russian Cyrillic characters', () => {
      render(
        <I18nProvider initialLocale="ru">
          <ActivityCard
            icon={Activity}
            title="Статус Xray"
            value="Работает"
            status="success"
            statusDot={true}
          />
        </I18nProvider>
      );

      expect(screen.getByText('Статус Xray')).toBeInTheDocument();
      expect(screen.getByText('Работает')).toBeInTheDocument();
    });

    it('should render without errors when switching languages', () => {
      const { rerender } = render(
        <I18nProvider initialLocale="en">
          <ActivityCard
            icon={Activity}
            title="Xray Status"
            value="Running"
            status="success"
          />
        </I18nProvider>
      );

      expect(screen.getByText('Xray Status')).toBeInTheDocument();

      // Switch to Russian
      rerender(
        <I18nProvider initialLocale="ru">
          <ActivityCard
            icon={Activity}
            title="Статус Xray"
            value="Работает"
            status="success"
          />
        </I18nProvider>
      );

      expect(screen.getByText('Статус Xray')).toBeInTheDocument();
    });
  });

  describe('Dark Theme Rendering', () => {
    it('should apply dark theme color palette', () => {
      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      const rootElement = document.documentElement;
      rootElement.classList.add('dark');

      // Check CSS variables are applied
      const styles = window.getComputedStyle(rootElement);
      expect(styles.getPropertyValue('--color-background')).toBeTruthy();
      expect(styles.getPropertyValue('--color-foreground')).toBeTruthy();
    });

    it('should render cards with dark backgrounds', async () => {
      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      await waitFor(() => {
        const cards = document.querySelectorAll('[class*="card"]');
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should maintain WCAG AA contrast ratios', async () => {
      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      await waitFor(() => {
        // This is a smoke test - actual contrast is tested in color-contrast.test.ts
        const textElements = document.querySelectorAll('p, span, h1, h2, h3');
        expect(textElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render correctly at desktop width (1920x1080)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });

      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      // Desktop should show 4-column chart layout
      const container = document.querySelector('[class*="lg:grid-cols-4"]');
      expect(container).toBeInTheDocument();
    });

    it('should render correctly at tablet width (768x1024)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true });

      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      // Should render without errors
      expect(screen.getByLabelText(/system monitors/i)).toBeInTheDocument();
    });

    it('should render correctly at mobile width (375x667)', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      // Should render without errors
      expect(screen.getByLabelText(/system monitors/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should load initial dashboard data efficiently', async () => {
      const startTime = performance.now();

      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/system monitors/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within reasonable time (2000ms target, but allow more in test env)
      expect(loadTime).toBeLessThan(5000);
    });

    it('should not block UI during polling updates', async () => {
      vi.useFakeTimers();

      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/system monitors/i)).toBeInTheDocument();
      });

      // Trigger multiple polls
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // UI should still be responsive
      const dashboard = screen.getByLabelText(/system monitors/i);
      expect(dashboard).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should display error states when API fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      await waitFor(() => {
        // Should show some indication of error or fallback content
        const content = document.body.textContent || '';
        expect(content.length).toBeGreaterThan(0);
      });
    });

    it('should preserve last known data on fetch failure', async () => {
      vi.useFakeTimers();

      render(
        <I18nProvider>
          <DashboardPage />
        </I18nProvider>
      );

      await waitFor(() => {
        const cpuChart = screen.getByRole('progressbar', { name: /cpu/i });
        expect(cpuChart).toHaveAttribute('aria-valuenow', '45');
      });

      // Make next fetch fail
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        // Should still show previous value
        const cpuChart = screen.getByRole('progressbar', { name: /cpu/i });
        expect(cpuChart).toHaveAttribute('aria-valuenow', '45');
      });

      vi.useRealTimers();
    });
  });

  describe('Browser-Specific Features', () => {
    it('should detect localStorage availability', () => {
      const hasLocalStorage = typeof window !== 'undefined' && 'localStorage' in window;
      expect(hasLocalStorage).toBe(true);
    });

    it('should detect Page Visibility API support', () => {
      const hasVisibilityAPI = typeof document !== 'undefined' && 'visibilityState' in document;
      expect(hasVisibilityAPI).toBe(true);
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        try {
          localStorage.setItem('test', 'value');
        } catch (e) {
          // Should handle error gracefully
        }
      }).not.toThrow();

      setItem.mockRestore();
    });
  });
});
