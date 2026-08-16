/**
 * System Monitoring Page Tests
 * 
 * Tests for the monitoring page displaying system health, database,
 * Xray system status, and version information.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonitoringPage from './page';
import { systemApi } from '@/lib/api/endpoints';

// Mock the API endpoints module
vi.mock('@/lib/api/endpoints', () => ({
  systemApi: {
    getHealth: vi.fn(),
    getDatabaseStatus: vi.fn(),
    getXraySystemStatus: vi.fn(),
    getVersion: vi.fn(),
  },
}));

// Mock Next.js components
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/admin/monitoring/system-health-card', () => ({
  SystemHealthCard: ({ health }: { health: any }) => (
    <div data-testid="system-health-card">
      {health ? 'Health Data' : 'No Health Data'}
    </div>
  ),
}));

vi.mock('@/components/admin/monitoring/database-status-card', () => ({
  DatabaseStatusCard: ({ database }: { database: any }) => (
    <div data-testid="database-status-card">
      {database ? 'Database Data' : 'No Database Data'}
    </div>
  ),
}));

vi.mock('@/components/admin/monitoring/xray-system-card', () => ({
  XraySystemCard: ({ xray }: { xray: any }) => (
    <div data-testid="xray-system-card">
      {xray ? 'Xray Data' : 'No Xray Data'}
    </div>
  ),
}));

vi.mock('@/components/admin/monitoring/version-info-card', () => ({
  VersionInfoCard: ({ version }: { version: any }) => (
    <div data-testid="version-info-card">
      {version ? 'Version Data' : 'No Version Data'}
    </div>
  ),
}));

describe('MonitoringPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title and description', async () => {
    // Mock successful API responses
    vi.mocked(systemApi.getHealth).mockResolvedValue({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
    });

    vi.mocked(systemApi.getDatabaseStatus).mockResolvedValue({
      success: true,
      data: {
        status: 'connected',
        response_time_ms: 25,
        active_connections: 10,
        max_connections: 100,
      },
    });

    vi.mocked(systemApi.getXraySystemStatus).mockResolvedValue({
      success: true,
      data: {
        instances_total: 5,
        instances_running: 3,
        instances_stopped: 2,
        clients_total: 50,
        clients_active: 40,
      },
    });

    vi.mocked(systemApi.getVersion).mockResolvedValue({
      success: true,
      data: {
        version: '1.0.0',
        build_date: '2024-01-01',
        git_commit: 'abc123def',
      },
    });

    const page = await MonitoringPage();
    render(page);

    expect(screen.getByText('System Monitoring')).toBeInTheDocument();
    expect(screen.getByText('Real-time system health, database status, and infrastructure metrics with auto-refresh.')).toBeInTheDocument();
  });

  it('renders all monitoring cards', async () => {
    vi.mocked(systemApi.getHealth).mockResolvedValue({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
    });

    vi.mocked(systemApi.getDatabaseStatus).mockResolvedValue({
      success: true,
      data: {
        status: 'connected',
        response_time_ms: 25,
        active_connections: 10,
        max_connections: 100,
      },
    });

    vi.mocked(systemApi.getXraySystemStatus).mockResolvedValue({
      success: true,
      data: {
        instances_total: 5,
        instances_running: 3,
        instances_stopped: 2,
        clients_total: 50,
        clients_active: 40,
      },
    });

    vi.mocked(systemApi.getVersion).mockResolvedValue({
      success: true,
      data: {
        version: '1.0.0',
        build_date: '2024-01-01',
        git_commit: 'abc123def',
      },
    });

    const page = await MonitoringPage();
    render(page);

    expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
    expect(screen.getByTestId('database-status-card')).toBeInTheDocument();
    expect(screen.getByTestId('xray-system-card')).toBeInTheDocument();
    expect(screen.getByTestId('version-info-card')).toBeInTheDocument();
  });

  it('handles API failures gracefully by passing null to cards', async () => {
    // Mock all API calls to fail
    vi.mocked(systemApi.getHealth).mockRejectedValue(new Error('Health check failed'));
    vi.mocked(systemApi.getDatabaseStatus).mockRejectedValue(new Error('Database check failed'));
    vi.mocked(systemApi.getXraySystemStatus).mockRejectedValue(new Error('Xray check failed'));
    vi.mocked(systemApi.getVersion).mockRejectedValue(new Error('Version check failed'));

    const page = await MonitoringPage();
    render(page);

    // Cards should still render but with no data
    expect(screen.getByText('No Health Data')).toBeInTheDocument();
    expect(screen.getByText('No Database Data')).toBeInTheDocument();
    expect(screen.getByText('No Xray Data')).toBeInTheDocument();
    expect(screen.getByText('No Version Data')).toBeInTheDocument();
  });

  it('fetches all data in parallel using Promise.allSettled', async () => {
    vi.mocked(systemApi.getHealth).mockResolvedValue({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
    });

    vi.mocked(systemApi.getDatabaseStatus).mockResolvedValue({
      success: true,
      data: {
        status: 'connected',
        response_time_ms: 25,
        active_connections: 10,
        max_connections: 100,
      },
    });

    vi.mocked(systemApi.getXraySystemStatus).mockResolvedValue({
      success: true,
      data: {
        instances_total: 5,
        instances_running: 3,
        instances_stopped: 2,
        clients_total: 50,
        clients_active: 40,
      },
    });

    vi.mocked(systemApi.getVersion).mockResolvedValue({
      success: true,
      data: {
        version: '1.0.0',
        build_date: '2024-01-01',
        git_commit: 'abc123def',
      },
    });

    await MonitoringPage();

    // Verify all API methods were called
    expect(systemApi.getHealth).toHaveBeenCalledOnce();
    expect(systemApi.getDatabaseStatus).toHaveBeenCalledOnce();
    expect(systemApi.getXraySystemStatus).toHaveBeenCalledOnce();
    expect(systemApi.getVersion).toHaveBeenCalledOnce();
  });
});
