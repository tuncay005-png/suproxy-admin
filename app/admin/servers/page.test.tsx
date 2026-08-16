/**
 * Servers Page Tests
 * 
 * Tests for the servers list page component.
 * 
 * @module app/admin/servers/page.test
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServersPage from './page';
import { serversApi } from '@/lib/api/endpoints/servers';

// Mock the API
vi.mock('@/lib/api/endpoints/servers', () => ({
  serversApi: {
    list: vi.fn(),
    getById: vi.fn(),
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

// Mock ServersTable component
vi.mock('@/components/admin/servers/servers-table', () => ({
  ServersTable: ({ servers }: any) => (
    <div data-testid="servers-table">
      {servers.map((server: any) => (
        <div key={server.id} data-testid={`server-${server.id}`}>
          {server.name}
        </div>
      ))}
    </div>
  ),
}));

describe('ServersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header with correct title and description', async () => {
    vi.mocked(serversApi.list).mockResolvedValue({
      success: true,
      data: {
        servers: [],
        total: 0,
      },
    } as any);

    render(await ServersPage());

    expect(screen.getByText('Servers')).toBeInTheDocument();
    expect(screen.getByText('View and monitor server infrastructure')).toBeInTheDocument();
  });

  it('fetches and displays servers data', async () => {
    const mockServers = [
      {
        id: 'server-1',
        name: 'US-East-1',
        country: 'United States',
        city: 'New York',
        ip_address: '192.168.1.100',
        status: 'online' as const,
        node_count: 3,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T11:00:00Z',
      },
      {
        id: 'server-2',
        name: 'EU-West-1',
        country: 'Germany',
        city: 'Frankfurt',
        ip_address: '192.168.1.101',
        status: 'maintenance' as const,
        node_count: 2,
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T10:30:00Z',
      },
    ];

    vi.mocked(serversApi.list).mockResolvedValue({
      success: true,
      data: {
        servers: mockServers,
        total: 2,
      },
    } as any);

    render(await ServersPage());

    // Verify servers are passed to table
    expect(screen.getByTestId('servers-table')).toBeInTheDocument();
    expect(screen.getByTestId('server-server-1')).toBeInTheDocument();
    expect(screen.getByTestId('server-server-2')).toBeInTheDocument();
    expect(screen.getByText('US-East-1')).toBeInTheDocument();
    expect(screen.getByText('EU-West-1')).toBeInTheDocument();
  });

  it('calls serversApi.list on render', async () => {
    vi.mocked(serversApi.list).mockResolvedValue({
      success: true,
      data: {
        servers: [],
        total: 0,
      },
    } as any);

    await ServersPage();

    expect(serversApi.list).toHaveBeenCalledTimes(1);
  });

  it('handles empty servers list', async () => {
    vi.mocked(serversApi.list).mockResolvedValue({
      success: true,
      data: {
        servers: [],
        total: 0,
      },
    } as any);

    render(await ServersPage());

    expect(screen.getByTestId('servers-table')).toBeInTheDocument();
  });

  it('displays multiple servers with different statuses', async () => {
    const mockServers = [
      {
        id: 'server-1',
        name: 'Online Server',
        country: 'USA',
        city: 'Boston',
        ip_address: '10.0.0.1',
        status: 'online' as const,
        node_count: 5,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T11:00:00Z',
      },
      {
        id: 'server-2',
        name: 'Offline Server',
        country: 'UK',
        city: 'London',
        ip_address: '10.0.0.2',
        status: 'offline' as const,
        node_count: 0,
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T10:30:00Z',
      },
      {
        id: 'server-3',
        name: 'Maintenance Server',
        country: 'Japan',
        city: 'Tokyo',
        ip_address: '10.0.0.3',
        status: 'maintenance' as const,
        node_count: 1,
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-01T09:30:00Z',
      },
    ];

    vi.mocked(serversApi.list).mockResolvedValue({
      success: true,
      data: {
        servers: mockServers,
        total: 3,
      },
    } as any);

    render(await ServersPage());

    expect(screen.getByText('Online Server')).toBeInTheDocument();
    expect(screen.getByText('Offline Server')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Server')).toBeInTheDocument();
  });
});
