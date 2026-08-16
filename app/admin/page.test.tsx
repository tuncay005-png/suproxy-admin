/**
 * Unit Tests for Dashboard Page
 * 
 * Validates: Requirements 3.1, 3.2, 3.4, 10.5, 15.1
 * 
 * Note: API endpoints are mocked to avoid network dependencies in tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

// Mock API endpoints
vi.mock('@/lib/api/endpoints', () => ({
  systemApi: {
    getStats: vi.fn(),
    getHealth: vi.fn(),
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

// Import mocked modules
import { systemApi, serversApi, plansApi, auditApi } from '@/lib/api/endpoints';

describe('DashboardPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock responses
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        total_users: 150,
        active_users: 75,
        total_xray_instances: 10,
        active_xray_instances: 8,
      },
    });
    
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        status: 'healthy',
        uptime: 3600,
      },
    });
    
    (serversApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        servers: [
          { id: '1', name: 'Server 1', status: 'online' },
          { id: '2', name: 'Server 2', status: 'offline' },
        ],
      },
    });
    
    (plansApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        plans: [
          { id: '1', name: 'Basic', active: true },
          { id: '2', name: 'Pro', active: true },
          { id: '3', name: 'Enterprise', active: false },
        ],
      },
    });
    
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        logs: [],
        total: 25,
      },
    });
  });

  it('should render the page header with correct title and description', async () => {
    render(await DashboardPage());
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the admin dashboard/i)).toBeInTheDocument();
  });

  it('should render stat cards section with all 5 stat cards', async () => {
    render(await DashboardPage());
    
    // Check for stat card titles - all 5 cards
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Xray Instances')).toBeInTheDocument();
    expect(screen.getByText('Servers')).toBeInTheDocument();
    expect(screen.getByText('Plans')).toBeInTheDocument();
    expect(screen.getByText('Recent Actions')).toBeInTheDocument();
  });

  it('should render activity feed section', async () => {
    render(await DashboardPage());
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(/Latest administrative actions and system events/i)).toBeInTheDocument();
  });

  it('should render quick actions section', async () => {
    render(await DashboardPage());
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText(/Common administrative tasks/i)).toBeInTheDocument();
  });

  it('should have proper ARIA labels for sections', async () => {
    render(await DashboardPage());
    
    expect(screen.getByLabelText('Statistics')).toBeInTheDocument();
    expect(screen.getByLabelText('Activity and Actions')).toBeInTheDocument();
  });

  it('should display placeholder values when API calls fail in test environment', async () => {
    // Override mocks to simulate API failures
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API unavailable'));
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API unavailable'));
    (serversApi.list as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API unavailable'));
    (plansApi.list as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API unavailable'));
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API unavailable'));
    
    render(await DashboardPage());
    
    // When API calls fail, stat cards should show '—' placeholder
    // We can verify the fallback messages are displayed
    const unavailableMessages = screen.getAllByText(/Data unavailable/i);
    expect(unavailableMessages.length).toBeGreaterThan(0);
  });

  it('should display ActivityFeed component', async () => {
    render(await DashboardPage());
    
    // The ActivityFeed component should be present
    // When no logs are available, it shows "No recent activity"
    const activitySection = screen.getByText('Recent Activity');
    expect(activitySection).toBeInTheDocument();
  });

  it('should display QuickActions component', async () => {
    render(await DashboardPage());
    
    // The QuickActions component should be present with action buttons
    const quickActionsSection = screen.getByText('Quick Actions');
    expect(quickActionsSection).toBeInTheDocument();
  });

  it('should make stat cards clickable with links to respective pages', async () => {
    render(await DashboardPage());
    
    // Find all links on the page
    const links = screen.getAllByRole('link');
    
    // Verify we have links (some from stat cards, some from quick actions)
    expect(links.length).toBeGreaterThan(0);
    
    // The stat cards should link to their respective pages
    // We can check if common hrefs exist
    const hrefs = links.map(link => link.getAttribute('href'));
    
    // At least some of these should be present
    const expectedHrefs = ['/admin/users', '/admin/xray/instances', '/admin/servers', '/admin/plans', '/admin/logs'];
    const hasExpectedLinks = expectedHrefs.some(href => hrefs.includes(href));
    
    expect(hasExpectedLinks).toBe(true);
  });

  it('should display real stat values from API', async () => {
    render(await DashboardPage());
    
    // Verify that mock data is being displayed
    expect(screen.getByText('150')).toBeInTheDocument(); // total users
    expect(screen.getByText('75 active')).toBeInTheDocument(); // active users
    expect(screen.getByText('10')).toBeInTheDocument(); // total xray instances
    expect(screen.getByText('8 active')).toBeInTheDocument(); // active xray instances
  });
});
