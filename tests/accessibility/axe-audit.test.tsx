/**
 * Axe-Core Accessibility Audit
 * 
 * Comprehensive accessibility testing using axe-core for automated WCAG compliance checking.
 * Tests critical pages and components for accessibility violations.
 * 
 * Validates: Requirements 2.7, 12.3
 * - 2.7: WCAG AA contrast ratios maintained
 * - 12.3: Run axe-core accessibility audit
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { run as axe, AxeResults } from 'axe-core';
import React from 'react';

// Helper function to run axe on a container
async function runAxe(container: HTMLElement): Promise<AxeResults> {
  return await axe(container);
}

// Custom matcher for accessibility violations
function toHaveNoViolations(results: AxeResults) {
  const violations = results.violations;
  
  if (violations.length === 0) {
    return {
      pass: true,
      message: () => 'Expected to have accessibility violations, but found none',
    };
  }

  const violationMessages = violations.map(violation => {
    const nodeMessages = violation.nodes.map(node => 
      `    - ${node.html}\n      ${node.failureSummary}`
    ).join('\n');
    
    return `  ${violation.id} (${violation.impact}): ${violation.description}\n${nodeMessages}`;
  }).join('\n\n');

  return {
    pass: false,
    message: () => `Expected no accessibility violations but found ${violations.length}:\n\n${violationMessages}`,
  };
}

// Extend expect with custom matcher
expect.extend({ toHaveNoViolations });

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock i18n context
vi.mock('@/lib/i18n/context', () => ({
  useTranslations: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dashboard.title': 'Dashboard',
        'dashboard.description': 'Welcome to the admin dashboard',
        'dashboard.total_users': 'Total Users',
        'dashboard.active_users': 'active',
        'dashboard.xray_status': 'Xray Status',
        'dashboard.running': 'Running',
        'dashboard.stopped': 'Stopped',
        'dashboard.system_uptime': 'System Uptime',
        'dashboard.traffic_speed': 'Traffic Speed',
        'dashboard.total_traffic': 'Total Traffic',
        'monitoring.cpu_usage': 'CPU Usage',
        'monitoring.ram_usage': 'RAM Usage',
        'monitoring.disk_usage': 'Disk Usage',
        'monitoring.swap_usage': 'Swap Usage',
      };
      return translations[key] || key;
    },
    locale: 'en',
    changeLanguage: vi.fn(),
  }),
}));

// Import components after mocks
import { CircularProgressChart } from '@/components/admin/dashboard/circular-progress-chart';
import { ActivityCard } from '@/components/admin/dashboard/activity-card';
import { SystemMonitors } from '@/components/admin/dashboard/system-monitors';
import { ActivitySection } from '@/components/admin/dashboard/activity-section';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { LanguageSelector } from '@/components/admin/layout/language-selector';
import { Activity, Clock, Users } from 'lucide-react';

describe('Axe-Core Accessibility Audit', () => {
  beforeAll(() => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('Dashboard Components', () => {
    it('CircularProgressChart should have no accessibility violations', async () => {
      const { container } = render(
        <CircularProgressChart
          value={75}
          max={100}
          label="CPU Usage"
          unit="%"
          size={120}
        />
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('CircularProgressChart with different values should have no violations', async () => {
      const { container } = render(
        <div>
          <CircularProgressChart value={50} max={100} label="Low Usage" unit="%" />
          <CircularProgressChart value={75} max={100} label="Medium Usage" unit="%" />
          <CircularProgressChart value={95} max={100} label="High Usage" unit="%" />
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('ActivityCard should have no accessibility violations', async () => {
      const { container } = render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          description="System operational"
          status="success"
          statusDot={true}
        />
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('ActivityCard with different status variants should have no violations', async () => {
      const { container } = render(
        <div>
          <ActivityCard icon={Activity} title="Success" value="OK" status="success" />
          <ActivityCard icon={Clock} title="Warning" value="Check" status="warning" />
          <ActivityCard icon={Activity} title="Error" value="Failed" status="error" />
          <ActivityCard icon={Clock} title="Neutral" value="Info" status="neutral" />
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('StatCard should have no accessibility violations', async () => {
      const { container } = render(
        <StatCard
          title="Total Users"
          value="1,234"
          description="56 active"
          icon={Users}
          href="/admin/users"
        />
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('SystemMonitors component should have no accessibility violations', async () => {
      const mockHealth = {
        status: 'healthy' as const,
        cpu_usage: 45.5,
        ram_used: 4096,
        ram_total: 8192,
        disk_used: 50,
        disk_total: 100,
        swap_used: 0,
        swap_total: 2048,
        uptime: 86400,
        database: 'connected' as const,
        timestamp: new Date().toISOString(),
      };

      const { container } = render(<SystemMonitors initialHealth={mockHealth} />);

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('ActivitySection component should have no accessibility violations', async () => {
      const mockXrayStatus = {
        status: 'running' as const,
        version: '1.8.0',
        traffic_speed: 1024000,
        traffic_total: 1073741824,
        active_connections: 42,
        uptime: 86400,
        last_restart: null,
      };

      const { container } = render(<ActivitySection initialXrayStatus={mockXrayStatus} />);

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Navigation Components', () => {
    it('LanguageSelector should have no accessibility violations', async () => {
      const { container } = render(<LanguageSelector />);

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast Validation', () => {
    it('should validate dark theme color combinations', async () => {
      // Test dark theme card with content
      const { container } = render(
        <div className="bg-background text-foreground p-4">
          <div className="bg-card text-card-foreground p-4 border border-border rounded-lg">
            <h2 className="text-lg font-semibold">Card Title</h2>
            <p className="text-muted-foreground">Muted description text</p>
            <p className="text-sm">Regular body text</p>
          </div>
        </div>
      );

      const results = await axe(container, {
        rules: {
          // Focus on color contrast rules
          'color-contrast': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });

    it('should validate chart colors have sufficient contrast', async () => {
      const { container } = render(
        <div className="bg-card p-4">
          {/* Test all threshold colors */}
          <div className="text-chart-green">Green text (0-69%)</div>
          <div className="text-chart-yellow">Yellow text (70-89%)</div>
          <div className="text-chart-red">Red text (90-100%)</div>
        </div>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML Validation', () => {
    it('should use proper heading hierarchy', async () => {
      const { container } = render(
        <div>
          <h1>Main Dashboard</h1>
          <section aria-label="Statistics">
            <h2>Statistics</h2>
            <StatCard
              title="Users"
              value="100"
              description="Total users"
              icon={Users}
              href="/admin/users"
            />
          </section>
          <section aria-label="Activity">
            <h2>Recent Activity</h2>
            <p>Activity content here</p>
          </section>
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark regions', async () => {
      const { container } = render(
        <main>
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="/admin">Dashboard</a></li>
              <li><a href="/admin/users">Users</a></li>
            </ul>
          </nav>
          <section aria-label="Main content">
            <h1>Dashboard</h1>
            <p>Dashboard content</p>
          </section>
        </main>
      );

      const results = await axe(container, {
        rules: {
          region: { enabled: true },
          landmark: { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements', () => {
    it('should have accessible form controls', async () => {
      const { container } = render(
        <form aria-label="Test form">
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" type="text" name="username" />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" />
          </div>
          <button type="submit">Submit</button>
        </form>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible buttons with proper labels', async () => {
      const { container } = render(
        <div>
          <button aria-label="Close dialog">×</button>
          <button>Save Changes</button>
          <button disabled>Disabled Button</button>
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible links with descriptive text', async () => {
      const { container } = render(
        <nav aria-label="Main navigation">
          <a href="/admin">Dashboard</a>
          <a href="/admin/users">User Management</a>
          <a href="/admin/settings" aria-label="Settings page">
            <span aria-hidden="true">⚙️</span>
          </a>
        </nav>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have proper ARIA attributes on progress elements', async () => {
      const { container } = render(
        <div>
          <div
            role="progressbar"
            aria-valuenow={75}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="CPU Usage: 75%"
          >
            75%
          </div>
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA live regions for real-time updates', async () => {
      const { container } = render(
        <div>
          <div aria-live="polite" aria-atomic="true">
            System status: Running
          </div>
          <div aria-live="polite" aria-atomic="false">
            <p>CPU: 45%</p>
            <p>RAM: 60%</p>
          </div>
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Images and Icons', () => {
    it('should have proper alt text for images', async () => {
      const { container } = render(
        <div>
          <img src="/logo.png" alt="Suproxy Admin Logo" />
          <img src="/avatar.png" alt="User profile avatar" />
          {/* Decorative image */}
          <img src="/decoration.png" alt="" role="presentation" />
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('should properly hide decorative icons from screen readers', async () => {
      const { container } = render(
        <div>
          <button>
            <span aria-hidden="true">🚀</span>
            <span>Launch Application</span>
          </button>
          <div>
            <Activity aria-hidden="true" />
            <span>System Active</span>
          </div>
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have proper focus indicators', async () => {
      const { container } = render(
        <div>
          <button className="focus:ring-2 focus:ring-primary">Focusable Button</button>
          <input type="text" className="focus:ring-2 focus:ring-primary" />
          <a href="/test" className="focus:ring-2 focus:ring-primary">
            Focusable Link
          </a>
        </div>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper tab order', async () => {
      const { container } = render(
        <form>
          <input type="text" placeholder="First" tabIndex={1} aria-label="First input" />
          <input type="text" placeholder="Second" tabIndex={2} aria-label="Second input" />
          <button type="submit" tabIndex={3}>Submit</button>
        </form>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tables', () => {
    it('should have accessible table structure', async () => {
      const { container } = render(
        <table>
          <caption>User Statistics</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john@example.com</td>
              <td>Active</td>
            </tr>
            <tr>
              <td>Jane Smith</td>
              <td>jane@example.com</td>
              <td>Inactive</td>
            </tr>
          </tbody>
        </table>
      );

      const results = await runAxe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
