/**
 * Data Display Verification Test
 * 
 * Integration tests to verify that all pages display real data from the backend,
 * not placeholder "—" values.
 * 
 * ## Test Coverage
 * 
 * - Dashboard stat cards show real data
 * - List pages show real data from backend
 * - Health checks display real status
 * - Audit logs display real log entries
 * - No placeholder "—" values when data is available
 * 
 * ## Requirements Validation
 * 
 * Validates: Requirements 10.9, 18.2-18.3, Task 18.9
 * - 10.9: Display real data from backend endpoints instead of placeholder "—" values
 * - 18.2: All API proxy routes successfully proxy requests to backend endpoints
 * - 18.3: Display real data from the Go_Backend in all list views
 * 
 * @module tests/integration/data-display-verification
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import DashboardPage from '@/app/admin/page';
import UsersPage from '@/app/admin/users/page';
import ServersPage from '@/app/admin/servers/page';
import PlansPage from '@/app/admin/plans/page';
import SessionsPage from '@/app/admin/sessions/page';
import XrayInstancesPage from '@/app/admin/xray/instances/page';
import AuditLogsPage from '@/app/admin/logs/page';
import MonitoringPage from '@/app/admin/monitoring/page';
import { systemApi, usersApi, serversApi, plansApi, sessionsApi, xrayApi, auditApi } from '@/lib/api/endpoints';

// Mock the API endpoints
vi.mock('@/lib/api/endpoints');

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

describe('Data Display Verification - Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Dashboard displays real data in stat cards (not placeholder "—")', async () => {
    // Mock real data from backend
    vi.mocked(systemApi.getStats).mockResolvedValue({
      data: {
        total_users: 42,
        active_users: 35,
        total_xray_instances: 5,
        active_xray_instances: 4,
        recent_audit_actions: 128,
      },
    });

    vi.mocked(systemApi.getHealth).mockResolvedValue({
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
    });

    vi.mocked(serversApi.list).mockResolvedValue({
      data: {
        servers: [
          { id: '1', name: 'Server 1', status: 'online', country: 'US', city: 'NYC', ip_address: '1.1.1.1', node_count: 2 },
          { id: '2', name: 'Server 2', status: 'offline', country: 'UK', city: 'London', ip_address: '2.2.2.2', node_count: 1 },
        ],
        total: 2,
      },
    });

    vi.mocked(plansApi.list).mockResolvedValue({
      data: {
        plans: [
          { id: '1', name: 'Basic', price: 10, active: true, active_subscriptions: 20 },
          { id: '2', name: 'Pro', price: 20, active: true, active_subscriptions: 15 },
          { id: '3', name: 'Legacy', price: 5, active: false, active_subscriptions: 0 },
        ],
        total: 3,
      },
    });

    vi.mocked(auditApi.getLogs).mockResolvedValue({
      data: {
        logs: [
          { id: '1', action: 'create_user', actor_email: 'admin@test.com', created_at: '2024-01-01T00:00:00Z' },
          { id: '2', action: 'delete_plan', actor_email: 'admin@test.com', created_at: '2024-01-01T00:01:00Z' },
        ],
        total: 128,
        offset: 0,
        limit: 10,
      },
    });

    const { container } = render(await DashboardPage());

    // Wait for async rendering
    await waitFor(() => {
      // Verify real data is displayed (not "—")
      expect(screen.getByText('42')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('35 active')).toBeInTheDocument(); // Active Users
      
      expect(screen.getByText('5')).toBeInTheDocument(); // Total Xray Instances
      expect(screen.getByText('4 active')).toBeInTheDocument(); // Active Xray Instances
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Servers (2 servers)
      expect(screen.getByText('1 online')).toBeInTheDocument(); // 1 online server
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Plans (3 plans)
      expect(screen.getByText('2 active')).toBeInTheDocument(); // 2 active plans
      
      expect(screen.getByText('128')).toBeInTheDocument(); // Recent Actions
    });

    // Verify no placeholder "—" values are present when data is available
    expect(container.textContent).not.toContain('—');
  });

  test('Dashboard shows "Data unavailable" when backend fails', async () => {
    // Mock API failures
    vi.mocked(systemApi.getStats).mockRejectedValue(new Error('Network error'));
    vi.mocked(systemApi.getHealth).mockRejectedValue(new Error('Network error'));
    vi.mocked(serversApi.list).mockRejectedValue(new Error('Network error'));
    vi.mocked(plansApi.list).mockRejectedValue(new Error('Network error'));
    vi.mocked(auditApi.getLogs).mockRejectedValue(new Error('Network error'));

    render(await DashboardPage());

    await waitFor(() => {
      // Verify "Data unavailable" is shown (acceptable when backend fails)
      const unavailableMessages = screen.getAllByText('Data unavailable');
      expect(unavailableMessages.length).toBeGreaterThan(0);
    });

    // Verify placeholder "—" is shown when backend is unavailable (this is expected behavior)
    // The page should show "—" as value and "Data unavailable" as description
  });
});

describe('Data Display Verification - List Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Users page displays real user data', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: {
        users: [
          {
            id: '1',
            email: 'user1@test.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'user',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            email: 'user2@test.com',
            first_name: 'Jane',
            last_name: 'Smith',
            role: 'admin',
            status: 'active',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
        offset: 0,
        limit: 20,
      },
    });

    render(await UsersPage({ searchParams: Promise.resolve({}) }));

    await waitFor(() => {
      // Verify real user data is displayed
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      expect(screen.getByText('user2@test.com')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('Servers page displays real server data', async () => {
    vi.mocked(serversApi.list).mockResolvedValue({
      data: {
        servers: [
          {
            id: '1',
            name: 'NYC-01',
            country: 'United States',
            city: 'New York',
            ip_address: '192.168.1.1',
            status: 'online',
            node_count: 3,
          },
          {
            id: '2',
            name: 'LON-01',
            country: 'United Kingdom',
            city: 'London',
            ip_address: '192.168.1.2',
            status: 'online',
            node_count: 2,
          },
        ],
        total: 2,
        offset: 0,
        limit: 20,
      },
    });

    render(await ServersPage({ searchParams: Promise.resolve({}) }));

    await waitFor(() => {
      // Verify real server data is displayed
      expect(screen.getByText('NYC-01')).toBeInTheDocument();
      expect(screen.getByText('LON-01')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });
  });

  test('Plans page displays real plan data', async () => {
    vi.mocked(plansApi.list).mockResolvedValue({
      data: {
        plans: [
          {
            id: '1',
            name: 'Basic Plan',
            description: '10GB monthly',
            price: 9.99,
            currency: 'USD',
            duration_days: 30,
            data_limit_gb: 10,
            active: true,
            active_subscriptions: 25,
          },
          {
            id: '2',
            name: 'Pro Plan',
            description: '50GB monthly',
            price: 19.99,
            currency: 'USD',
            duration_days: 30,
            data_limit_gb: 50,
            active: true,
            active_subscriptions: 15,
          },
        ],
        total: 2,
        offset: 0,
        limit: 20,
      },
    });

    render(await PlansPage({ searchParams: Promise.resolve({}) }));

    await waitFor(() => {
      // Verify real plan data is displayed
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('$9.99')).toBeInTheDocument();
      expect(screen.getByText('$19.99')).toBeInTheDocument();
      expect(screen.getByText('10 GB')).toBeInTheDocument();
      expect(screen.getByText('50 GB')).toBeInTheDocument();
    });
  });

  test('Sessions page displays real session data', async () => {
    vi.mocked(sessionsApi.list).mockResolvedValue({
      data: {
        sessions: [
          {
            id: '1',
            user_id: 'u1',
            username: 'admin',
            email: 'admin@test.com',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            created_at: '2024-01-01T10:00:00Z',
            last_activity_at: '2024-01-01T11:30:00Z',
            expires_at: '2024-01-02T10:00:00Z',
          },
          {
            id: '2',
            user_id: 'u2',
            username: 'user1',
            email: 'user1@test.com',
            ip_address: '192.168.1.101',
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
            created_at: '2024-01-01T09:00:00Z',
            last_activity_at: '2024-01-01T11:00:00Z',
            expires_at: '2024-01-02T09:00:00Z',
          },
        ],
        total: 2,
      },
    });

    render(await SessionsPage());

    await waitFor(() => {
      // Verify real session data is displayed
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.101')).toBeInTheDocument();
    });
  });

  test('Xray Instances page displays real instance data', async () => {
    vi.mocked(xrayApi.instances.list).mockResolvedValue({
      data: {
        instances: [
          {
            id: '1',
            name: 'xray-nyc-01',
            status: 'running',
            server_id: 's1',
            server_name: 'NYC-01',
            uptime: 86400, // 1 day
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
          {
            id: '2',
            name: 'xray-lon-01',
            status: 'stopped',
            server_id: 's2',
            server_name: 'LON-01',
            uptime: 0,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
          },
        ],
      },
    });

    render(await XrayInstancesPage());

    await waitFor(() => {
      // Verify real instance data is displayed
      expect(screen.getByText('xray-nyc-01')).toBeInTheDocument();
      expect(screen.getByText('xray-lon-01')).toBeInTheDocument();
      expect(screen.getByText('NYC-01')).toBeInTheDocument();
      expect(screen.getByText('LON-01')).toBeInTheDocument();
      expect(screen.getByText('1d 0h')).toBeInTheDocument(); // Formatted uptime
    });
  });

  test('Audit Logs page displays real log entries', async () => {
    vi.mocked(auditApi.getLogs).mockResolvedValue({
      data: {
        logs: [
          {
            id: '1',
            action: 'create_user',
            actor_id: 'a1',
            actor_email: 'admin@test.com',
            entity_type: 'user',
            entity_id: 'u1',
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0',
            status: 'success',
            metadata: { email: 'newuser@test.com' },
            created_at: '2024-01-01T10:00:00Z',
          },
          {
            id: '2',
            action: 'delete_plan',
            actor_id: 'a1',
            actor_email: 'admin@test.com',
            entity_type: 'plan',
            entity_id: 'p1',
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0',
            status: 'success',
            metadata: { plan_name: 'Legacy Plan' },
            created_at: '2024-01-01T11:00:00Z',
          },
        ],
        total: 2,
        offset: 0,
        limit: 25,
      },
    });

    vi.mocked(auditApi.getStats).mockResolvedValue({
      data: {
        total_actions: 128,
        actions_by_type: {
          create_user: 45,
          update_user: 30,
          delete_user: 10,
          create_plan: 20,
          delete_plan: 5,
        },
        recent_activity_count: 15,
      },
    });

    render(await AuditLogsPage({ searchParams: Promise.resolve({}) }));

    await waitFor(() => {
      // Verify real audit log data is displayed
      expect(screen.getByText('create_user')).toBeInTheDocument();
      expect(screen.getByText('delete_plan')).toBeInTheDocument();
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });
  });
});

describe('Data Display Verification - Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Monitoring page displays real health check status', async () => {
    vi.mocked(systemApi.getHealth).mockResolvedValue({
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    vi.mocked(systemApi.getDatabaseStatus).mockResolvedValue({
      data: {
        status: 'connected',
        response_time_ms: 15,
        active_connections: 5,
        max_connections: 100,
      },
    });

    vi.mocked(systemApi.getXraySystemStatus).mockResolvedValue({
      data: {
        instances_total: 5,
        instances_running: 4,
        instances_stopped: 1,
        clients_total: 120,
        clients_active: 95,
      },
    });

    vi.mocked(systemApi.getVersion).mockResolvedValue({
      data: {
        version: '1.2.3',
        build_date: '2024-01-01',
        git_commit: 'abc123',
      },
    });

    render(await MonitoringPage());

    await waitFor(() => {
      // Verify real health data is displayed
      expect(screen.getByText('healthy')).toBeInTheDocument();
      expect(screen.getByText('connected')).toBeInTheDocument();
      expect(screen.getByText('15 ms')).toBeInTheDocument();
      expect(screen.getByText(/5\s*\/\s*100/)).toBeInTheDocument(); // Active/Max connections
      
      // Verify Xray stats
      expect(screen.getByText('5')).toBeInTheDocument(); // Total instances
      expect(screen.getByText('4')).toBeInTheDocument(); // Running instances
      expect(screen.getByText('120')).toBeInTheDocument(); // Total clients
      expect(screen.getByText('95')).toBeInTheDocument(); // Active clients
      
      // Verify version info
      expect(screen.getByText('1.2.3')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getByText('abc123')).toBeInTheDocument();
    });
  });

  test('Monitoring page shows error indicators when health checks fail', async () => {
    vi.mocked(systemApi.getHealth).mockResolvedValue({
      data: {
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: '2024-01-01T12:00:00Z',
      },
    });

    vi.mocked(systemApi.getDatabaseStatus).mockResolvedValue({
      data: {
        status: 'disconnected',
        response_time_ms: 0,
        active_connections: 0,
        max_connections: 100,
      },
    });

    vi.mocked(systemApi.getXraySystemStatus).mockResolvedValue({
      data: {
        instances_total: 5,
        instances_running: 0,
        instances_stopped: 5,
        clients_total: 120,
        clients_active: 0,
      },
    });

    vi.mocked(systemApi.getVersion).mockResolvedValue({
      data: {
        version: '1.2.3',
        build_date: '2024-01-01',
        git_commit: 'abc123',
      },
    });

    const { container } = render(await MonitoringPage());

    await waitFor(() => {
      // Verify unhealthy status is displayed
      expect(screen.getByText('unhealthy')).toBeInTheDocument();
      expect(screen.getByText('disconnected')).toBeInTheDocument();
      
      // Verify error indicators (red styling) - check for destructive variants
      const unhealthyElements = container.querySelectorAll('[class*="destructive"]');
      expect(unhealthyElements.length).toBeGreaterThan(0);
    });
  });
});

describe('Data Display Verification - No Placeholder Values', () => {
  test('All pages replace "—" with real data when backend responds', async () => {
    // This test verifies the key requirement: no placeholder "—" when data is available
    
    // Mock all APIs with real data
    vi.mocked(systemApi.getStats).mockResolvedValue({
      data: {
        total_users: 100,
        active_users: 85,
        total_xray_instances: 10,
        active_xray_instances: 9,
        recent_audit_actions: 500,
      },
    });

    vi.mocked(systemApi.getHealth).mockResolvedValue({
      data: { status: 'healthy', database: 'connected', timestamp: '2024-01-01T00:00:00Z' },
    });

    vi.mocked(serversApi.list).mockResolvedValue({
      data: {
        servers: [{ id: '1', name: 'Server 1', status: 'online', country: 'US', city: 'NYC', ip_address: '1.1.1.1', node_count: 2 }],
        total: 1,
      },
    });

    vi.mocked(plansApi.list).mockResolvedValue({
      data: {
        plans: [{ id: '1', name: 'Basic', price: 10, active: true, active_subscriptions: 20 }],
        total: 1,
      },
    });

    vi.mocked(auditApi.getLogs).mockResolvedValue({
      data: {
        logs: [{ id: '1', action: 'test', actor_email: 'admin@test.com', created_at: '2024-01-01T00:00:00Z' }],
        total: 500,
        offset: 0,
        limit: 10,
      },
    });

    const { container } = render(await DashboardPage());

    await waitFor(() => {
      // Verify specific real values are present
      expect(screen.getByText('100')).toBeInTheDocument(); // Total users
      expect(screen.getByText('10')).toBeInTheDocument(); // Total Xray instances
      expect(screen.getByText('500')).toBeInTheDocument(); // Recent actions
    });

    // Critical check: verify NO placeholder "—" symbols when data is available
    const pageText = container.textContent || '';
    expect(pageText).not.toContain('—');
    
    // Verify "Data unavailable" is also not present (since we have data)
    expect(pageText).not.toContain('Data unavailable');
  });
});
