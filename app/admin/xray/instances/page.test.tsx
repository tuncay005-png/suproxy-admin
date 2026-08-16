/**
 * Xray Instances Page Tests
 * 
 * Tests for the Xray instances list page component.
 * 
 * @module app/admin/xray/instances/page.test
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import XrayInstancesPage from './page';
import { xrayApi } from '@/lib/api/endpoints/xray';

// Mock the API
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    instances: {
      list: vi.fn(),
    },
  },
}));

// Mock Next.js components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock PageHeader component
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: any) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

// Mock InstancesTable component
vi.mock('@/components/admin/xray/instances/instances-table', () => ({
  InstancesTable: ({ instances }: any) => (
    <div data-testid="instances-table">
      {instances.map((instance: any) => (
        <div key={instance.id} data-testid={`instance-${instance.id}`}>
          {instance.name}
        </div>
      ))}
    </div>
  ),
}));

describe('XrayInstancesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title and description', async () => {
    vi.mocked(xrayApi.instances.list).mockResolvedValue({
      success: true,
      data: {
        instances: [],
      },
    } as any);

    render(await XrayInstancesPage());

    expect(screen.getByText('Xray Instances')).toBeInTheDocument();
    expect(screen.getByText('Monitor and manage Xray proxy server instances')).toBeInTheDocument();
  });

  it('fetches and displays instances data', async () => {
    const mockInstances = [
      {
        id: 'instance-1',
        name: 'xray-proxy-01',
        status: 'running' as const,
        server_id: 'server-1',
        server_name: 'US-East-1',
        uptime: 3600,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T11:00:00Z',
      },
      {
        id: 'instance-2',
        name: 'xray-proxy-02',
        status: 'stopped' as const,
        server_id: 'server-2',
        server_name: 'EU-West-1',
        uptime: 0,
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T10:30:00Z',
      },
    ];

    vi.mocked(xrayApi.instances.list).mockResolvedValue({
      success: true,
      data: {
        instances: mockInstances,
      },
    } as any);

    render(await XrayInstancesPage());

    // Verify instances are passed to table
    expect(screen.getByTestId('instances-table')).toBeInTheDocument();
    expect(screen.getByTestId('instance-instance-1')).toBeInTheDocument();
    expect(screen.getByTestId('instance-instance-2')).toBeInTheDocument();
    expect(screen.getByText('xray-proxy-01')).toBeInTheDocument();
    expect(screen.getByText('xray-proxy-02')).toBeInTheDocument();
  });

  it('calls xrayApi.instances.list on render', async () => {
    vi.mocked(xrayApi.instances.list).mockResolvedValue({
      success: true,
      data: {
        instances: [],
      },
    } as any);

    await XrayInstancesPage();

    expect(xrayApi.instances.list).toHaveBeenCalledTimes(1);
  });

  it('handles empty instances list', async () => {
    vi.mocked(xrayApi.instances.list).mockResolvedValue({
      success: true,
      data: {
        instances: [],
      },
    } as any);

    render(await XrayInstancesPage());

    expect(screen.getByTestId('instances-table')).toBeInTheDocument();
  });
});
