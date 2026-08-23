/**
 * Backend Data Display Verification Tests
 * 
 * This test suite verifies that all pages display real data from the backend
 * instead of placeholder "—" values.
 * 
 * Task: 18.9 Verify data display from backend
 * Requirements: 10.9, 18.2-18.3
 * 
 * What this tests:
 * - Dashboard displays real data (not placeholder "—" values)
 * - All stat cards show real counts from backend
 * - All list pages show real data
 * - Health checks display real status
 * - Audit logs display real log entries
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { AuditLog } from '@/types/audit';

// Mock API responses with real data
const mockSystemStats = {
  data: {
    total_users: 150,
    active_users: 120,
    total_xray_instances: 5,
    active_xray_instances: 4,
    recent_audit_actions: 45,
  }
};

const mockSystemHealth = {
  data: {
    status: 'healthy' as const,
    database: 'connected' as const,
    timestamp: new Date().toISOString(),
  }
};

const mockAuditLogs = {
  data: {
    logs: [
      {
        id: '1',
        action: 'create_user',
        actor_id: 'admin1',
        actor_email: 'admin@example.com',
        entity_type: 'user',
        entity_id: 'user123',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        status: 'success' as const,
        metadata: {},
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        action: 'update_plan',
        actor_id: 'admin1',
        actor_email: 'admin@example.com',
        entity_type: 'plan',
        entity_id: 'plan456',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        status: 'success' as const,
        metadata: {},
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ] as AuditLog[],
    total: 45,
    offset: 0,
    limit: 10,
  }
};

const mockServers = {
  data: {
    servers: [
      {
        id: 'server1',
        name: 'US-East-1',
        country: 'United States',
        city: 'New York',
        ip_address: '203.0.113.1',
        status: 'online' as const,
        node_count: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'server2',
        name: 'EU-West-1',
        country: 'Germany',
        city: 'Frankfurt',
        ip_address: '203.0.113.2',
        status: 'online' as const,
        node_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'server3',
        name: 'Asia-East-1',
        country: 'Japan',
        city: 'Tokyo',
        ip_address: '203.0.113.3',
        status: 'maintenance' as const,
        node_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    total: 3,
  }
};

const mockPlans = {
  data: {
    plans: [
      {
        id: 'plan1',
        name: 'Basic',
        description: 'Basic plan',
        price: 9.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
        active_subscriptions: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'plan2',
        name: 'Pro',
        description: 'Professional plan',
        price: 19.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 500,
        active: true,
        active_subscriptions: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'plan3',
        name: 'Enterprise',
        description: 'Enterprise plan',
        price: 49.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 2000,
        active: false,
        active_subscriptions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    total: 3,
  }
};

const mockDatabaseStatus = {
  data: {
    status: 'connected' as const,
    response_time_ms: 12,
    active_connections: 5,
    max_connections: 100,
  }
};

const mockXraySystemStatus = {
  data: {
    instances_total: 5,
    instances_running: 4,
    instances_stopped: 1,
    clients_total: 200,
    clients_active: 180,
  }
};

describe('Backend Data Display Verification', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('Dashboard Data Display', () => {
    it('should display real user count instead of placeholder', async () => {
      // Mock the API calls
      const mockGetStats = vi.fn().mockResolvedValue(mockSystemStats);
      const mockGetHealth = vi.fn().mockResolvedValue(mockSystemHealth);
      const mockGetAuditLogs = vi.fn().mockResolvedValue(mockAuditLogs);
      const mockGetServers = vi.fn().mockResolvedValue(mockServers);
      const mockGetPlans = vi.fn().mockResolvedValue(mockPlans);

      // Mock the API modules
      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getStats: mockGetStats,
          getHealth: mockGetHealth,
        },
        auditApi: {
          getLogs: mockGetAuditLogs,
        },
        serversApi: {
          list: mockGetServers,
        },
        plansApi: {
          list: mockGetPlans,
        },
      }));

      // Dynamically import the dashboard page after mocking
      const { default: DashboardPage } = await import('@/app/admin/page');

      // Render the dashboard
      render(await DashboardPage());

      // Verify real data is displayed (not "—")
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Total users
        expect(screen.queryByText('—')).not.toBeInTheDocument(); // No placeholders
      });
    });

    it('should display correct stat card values from backend', async () => {
      const mockGetStats = vi.fn().mockResolvedValue(mockSystemStats);
      const mockGetHealth = vi.fn().mockResolvedValue(mockSystemHealth);
      const mockGetAuditLogs = vi.fn().mockResolvedValue(mockAuditLogs);
      const mockGetServers = vi.fn().mockResolvedValue(mockServers);
      const mockGetPlans = vi.fn().mockResolvedValue(mockPlans);

      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getStats: mockGetStats,
          getHealth: mockGetHealth,
        },
        auditApi: {
          getLogs: mockGetAuditLogs,
        },
        serversApi: {
          list: mockGetServers,
        },
        plansApi: {
          list: mockGetPlans,
        },
      }));

      const { default: DashboardPage } = await import('@/app/admin/page');
      render(await DashboardPage());

      await waitFor(() => {
        // Users card
        expect(screen.getByText('150')).toBeInTheDocument();
        expect(screen.getByText('120 active')).toBeInTheDocument();

        // Xray Instances card
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('4 active')).toBeInTheDocument();

        // Servers card
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('2 online')).toBeInTheDocument();

        // Plans card
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('2 active')).toBeInTheDocument();

        // Recent Actions card
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });

    it('should display real audit logs in activity feed', async () => {
      const mockGetStats = vi.fn().mockResolvedValue(mockSystemStats);
      const mockGetHealth = vi.fn().mockResolvedValue(mockSystemHealth);
      const mockGetAuditLogs = vi.fn().mockResolvedValue(mockAuditLogs);
      const mockGetServers = vi.fn().mockResolvedValue(mockServers);
      const mockGetPlans = vi.fn().mockResolvedValue(mockPlans);

      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getStats: mockGetStats,
          getHealth: mockGetHealth,
        },
        auditApi: {
          getLogs: mockGetAuditLogs,
        },
        serversApi: {
          list: mockGetServers,
        },
        plansApi: {
          list: mockGetPlans,
        },
      }));

      const { default: DashboardPage } = await import('@/app/admin/page');
      render(await DashboardPage());

      await waitFor(() => {
        // Check that audit log entries are displayed
        expect(screen.getByText(/create_user/i)).toBeInTheDocument();
        expect(screen.getByText(/update_plan/i)).toBeInTheDocument();
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Monitoring Page Data Display', () => {
    it('should display real database status', async () => {
      const mockGetHealth = vi.fn().mockResolvedValue(mockSystemHealth);
      const mockGetDatabaseStatus = vi.fn().mockResolvedValue(mockDatabaseStatus);
      const mockGetXraySystemStatus = vi.fn().mockResolvedValue(mockXraySystemStatus);
      const mockGetVersion = vi.fn().mockResolvedValue({
        data: {
          version: '1.0.0',
          build_date: '2024-01-01',
          git_commit: 'abc123',
        }
      });

      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getHealth: mockGetHealth,
          getDatabaseStatus: mockGetDatabaseStatus,
          getXraySystemStatus: mockGetXraySystemStatus,
          getVersion: mockGetVersion,
        },
      }));

      const { default: MonitoringPage } = await import('@/app/admin/monitoring/page');
      render(await MonitoringPage());

      await waitFor(() => {
        // Database status should show real values
        expect(screen.getByText('connected')).toBeInTheDocument();
        expect(screen.getByText(/12.*ms/i)).toBeInTheDocument(); // Response time
        expect(screen.getByText(/5.*100/i)).toBeInTheDocument(); // Active/Max connections
      });
    });

    it('should display real Xray system status', async () => {
      const mockGetHealth = vi.fn().mockResolvedValue(mockSystemHealth);
      const mockGetDatabaseStatus = vi.fn().mockResolvedValue(mockDatabaseStatus);
      const mockGetXraySystemStatus = vi.fn().mockResolvedValue(mockXraySystemStatus);
      const mockGetVersion = vi.fn().mockResolvedValue({
        data: {
          version: '1.0.0',
          build_date: '2024-01-01',
          git_commit: 'abc123',
        }
      });

      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getHealth: mockGetHealth,
          getDatabaseStatus: mockGetDatabaseStatus,
          getXraySystemStatus: mockGetXraySystemStatus,
          getVersion: mockGetVersion,
        },
      }));

      const { default: MonitoringPage } = await import('@/app/admin/monitoring/page');
      render(await MonitoringPage());

      await waitFor(() => {
        // Xray system status should show real values
        expect(screen.getByText('5')).toBeInTheDocument(); // Total instances
        expect(screen.getByText('4')).toBeInTheDocument(); // Running instances
        expect(screen.getByText('200')).toBeInTheDocument(); // Total clients
        expect(screen.getByText('180')).toBeInTheDocument(); // Active clients
      });
    });

    it('should display healthy status indicators', async () => {
      const mockGetHealth = vi.fn().mockResolvedValue(mockSystemHealth);
      const mockGetDatabaseStatus = vi.fn().mockResolvedValue(mockDatabaseStatus);
      const mockGetXraySystemStatus = vi.fn().mockResolvedValue(mockXraySystemStatus);
      const mockGetVersion = vi.fn().mockResolvedValue({
        data: {
          version: '1.0.0',
          build_date: '2024-01-01',
          git_commit: 'abc123',
        }
      });

      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getHealth: mockGetHealth,
          getDatabaseStatus: mockGetDatabaseStatus,
          getXraySystemStatus: mockGetXraySystemStatus,
          getVersion: mockGetVersion,
        },
      }));

      const { default: MonitoringPage } = await import('@/app/admin/monitoring/page');
      render(await MonitoringPage());

      await waitFor(() => {
        // Health status should show "healthy"
        expect(screen.getByText('healthy')).toBeInTheDocument();
        expect(screen.queryByText('unhealthy')).not.toBeInTheDocument();
        expect(screen.queryByText('degraded')).not.toBeInTheDocument();
      });
    });
  });

  describe('List Pages Data Display', () => {
    it('servers list should display real server data', async () => {
      const mockGetServers = vi.fn().mockResolvedValue(mockServers);

      vi.mock('@/lib/api/endpoints', () => ({
        serversApi: {
          list: mockGetServers,
        },
      }));

      const { default: ServersPage } = await import('@/app/admin/servers/page');
      render(await ServersPage());

      await waitFor(() => {
        // Check server names are displayed
        expect(screen.getByText('US-East-1')).toBeInTheDocument();
        expect(screen.getByText('EU-West-1')).toBeInTheDocument();
        expect(screen.getByText('Asia-East-1')).toBeInTheDocument();

        // Check server locations
        expect(screen.getByText(/New York/i)).toBeInTheDocument();
        expect(screen.getByText(/Frankfurt/i)).toBeInTheDocument();

        // Check server status
        expect(screen.getAllByText(/online/i).length).toBeGreaterThan(0);
      });
    });

    it('plans list should display real plan data', async () => {
      const mockGetPlans = vi.fn().mockResolvedValue(mockPlans);

      vi.mock('@/lib/api/endpoints', () => ({
        plansApi: {
          list: mockGetPlans,
        },
      }));

      const { default: PlansPage } = await import('@/app/admin/plans/page');
      render(await PlansPage());

      await waitFor(() => {
        // Check plan names are displayed
        expect(screen.getByText('Basic')).toBeInTheDocument();
        expect(screen.getByText('Pro')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();

        // Check prices are displayed
        expect(screen.getByText(/9.99/i)).toBeInTheDocument();
        expect(screen.getByText(/19.99/i)).toBeInTheDocument();

        // Check subscription counts
        expect(screen.getByText(/50.*subscriptions/i)).toBeInTheDocument();
        expect(screen.getByText(/30.*subscriptions/i)).toBeInTheDocument();
      });
    });

    it('audit logs should display real log entries', async () => {
      const mockGetLogs = vi.fn().mockResolvedValue(mockAuditLogs);
      const mockGetStats = vi.fn().mockResolvedValue({
        data: {
          total_actions: 45,
          actions_by_type: {
            create_user: 10,
            update_plan: 5,
            delete_client: 3,
          },
          recent_activity_count: 45,
        }
      });

      vi.mock('@/lib/api/endpoints', () => ({
        auditApi: {
          getLogs: mockGetLogs,
          getStats: mockGetStats,
        },
      }));

      const { default: AuditLogsPage } = await import('@/app/admin/logs/page');
      render(await AuditLogsPage({ searchParams: {} }));

      await waitFor(() => {
        // Check log actions are displayed
        expect(screen.getByText(/create_user/i)).toBeInTheDocument();
        expect(screen.getByText(/update_plan/i)).toBeInTheDocument();

        // Check actor email is displayed
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();

        // Check entity types and IDs
        expect(screen.getByText(/user/i)).toBeInTheDocument();
        expect(screen.getByText('user123')).toBeInTheDocument();
      });
    });
  });

  describe('No Placeholder Values', () => {
    it('should not display "—" placeholders when data is available', async () => {
      const mockGetStats = vi.fn().mockResolvedValue(mockSystemStats);
      const mockGetHealth = vi.fn().mockResolvedValue(mockSystemHealth);
      const mockGetAuditLogs = vi.fn().mockResolvedValue(mockAuditLogs);
      const mockGetServers = vi.fn().mockResolvedValue(mockServers);
      const mockGetPlans = vi.fn().mockResolvedValue(mockPlans);

      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getStats: mockGetStats,
          getHealth: mockGetHealth,
        },
        auditApi: {
          getLogs: mockGetAuditLogs,
        },
        serversApi: {
          list: mockGetServers,
        },
        plansApi: {
          list: mockGetPlans,
        },
      }));

      const { default: DashboardPage } = await import('@/app/admin/page');
      render(await DashboardPage());

      await waitFor(() => {
        // Verify no "—" placeholders exist
        const placeholders = screen.queryAllByText('—');
        expect(placeholders.length).toBe(0);

        // Also check for the specific character that might appear
        const dashPlaceholders = screen.queryAllByText(/â€"/);
        expect(dashPlaceholders.length).toBe(0);
      });
    });

    it('should show "Data unavailable" message when backend fails, not "—"', async () => {
      // Mock API failures
      const mockGetStats = vi.fn().mockRejectedValue(new Error('Backend unavailable'));
      const mockGetHealth = vi.fn().mockRejectedValue(new Error('Backend unavailable'));
      const mockGetAuditLogs = vi.fn().mockRejectedValue(new Error('Backend unavailable'));
      const mockGetServers = vi.fn().mockRejectedValue(new Error('Backend unavailable'));
      const mockGetPlans = vi.fn().mockRejectedValue(new Error('Backend unavailable'));

      vi.mock('@/lib/api/endpoints', () => ({
        systemApi: {
          getStats: mockGetStats,
          getHealth: mockGetHealth,
        },
        auditApi: {
          getLogs: mockGetAuditLogs,
        },
        serversApi: {
          list: mockGetServers,
        },
        plansApi: {
          list: mockGetPlans,
        },
      }));

      const { default: DashboardPage } = await import('@/app/admin/page');
      render(await DashboardPage());

      await waitFor(() => {
        // When data fails, should show "Data unavailable" not just "—"
        const unavailableMessages = screen.getAllByText('Data unavailable');
        expect(unavailableMessages.length).toBeGreaterThan(0);
      });
    });
  });
});
