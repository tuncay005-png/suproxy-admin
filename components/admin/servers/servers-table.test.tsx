/**
 * Servers Table Component Tests
 * 
 * Tests for the ServersTable client component.
 * 
 * @module components/admin/servers/servers-table.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServersTable } from './servers-table';
import type { Server } from '@/types/server';

// Mock child components
vi.mock('./server-status-badge', () => ({
  ServerStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

describe('ServersTable', () => {
  const mockServers: Server[] = [
    {
      id: 'server-1',
      name: 'US-East-1',
      country: 'United States',
      city: 'New York',
      ip_address: '192.168.1.100',
      status: 'online',
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
      status: 'maintenance',
      node_count: 2,
      created_at: '2024-01-01T09:00:00Z',
      updated_at: '2024-01-01T10:30:00Z',
    },
    {
      id: 'server-3',
      name: 'Asia-East-1',
      country: 'Japan',
      city: 'Tokyo',
      ip_address: '192.168.1.102',
      status: 'offline',
      node_count: 0,
      created_at: '2024-01-01T08:00:00Z',
      updated_at: '2024-01-01T09:30:00Z',
    },
  ];

  it('renders servers table with data', () => {
    // Act
    render(<ServersTable servers={mockServers} />);

    // Assert
    expect(screen.getByText('Servers')).toBeInTheDocument();
    expect(screen.getByText('3 servers found')).toBeInTheDocument();
    
    // Check that table headers are present
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Nodes')).toBeInTheDocument();
    
    // Check that server data is displayed
    expect(screen.getByText('US-East-1')).toBeInTheDocument();
    expect(screen.getByText('EU-West-1')).toBeInTheDocument();
    expect(screen.getByText('Asia-East-1')).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Frankfurt')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('displays empty state when no servers exist', () => {
    // Act
    render(<ServersTable servers={[]} />);

    // Assert
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No servers found')).toBeInTheDocument();
    expect(screen.getByText('No servers configured yet')).toBeInTheDocument();
  });

  it('displays singular server text for single server', () => {
    // Arrange
    const singleServer = [mockServers[0]];

    // Act
    render(<ServersTable servers={singleServer} />);

    // Assert
    expect(screen.getByText('1 server found')).toBeInTheDocument();
  });

  it('displays plural servers text for multiple servers', () => {
    // Act
    render(<ServersTable servers={mockServers} />);

    // Assert
    expect(screen.getByText('3 servers found')).toBeInTheDocument();
  });

  it('displays IP addresses in monospace font', () => {
    // Act
    const { container } = render(<ServersTable servers={mockServers} />);

    // Assert - IP addresses should have font-mono class
    const ipCells = container.querySelectorAll('.font-mono');
    expect(ipCells.length).toBeGreaterThan(0);
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.101')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.102')).toBeInTheDocument();
  });

  it('displays status badges for each server', () => {
    // Act
    render(<ServersTable servers={mockServers} />);

    // Assert
    const statusBadges = screen.getAllByTestId('status-badge');
    expect(statusBadges).toHaveLength(3);
    expect(statusBadges[0]).toHaveTextContent('online');
    expect(statusBadges[1]).toHaveTextContent('maintenance');
    expect(statusBadges[2]).toHaveTextContent('offline');
  });

  it('displays node count badges', () => {
    // Act
    render(<ServersTable servers={mockServers} />);

    // Assert
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders table with responsive classes', () => {
    // Act
    const { container } = render(<ServersTable servers={mockServers} />);

    // Assert
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    // Check for responsive wrapper
    const wrapper = container.querySelector('.overflow-x-auto');
    expect(wrapper).toBeInTheDocument();
  });

  it('displays all server information correctly', () => {
    // Arrange
    const server = mockServers[0];

    // Act
    render(<ServersTable servers={[server]} />);

    // Assert
    expect(screen.getByText(server.name)).toBeInTheDocument();
    expect(screen.getByText(server.country)).toBeInTheDocument();
    expect(screen.getByText(server.city)).toBeInTheDocument();
    expect(screen.getByText(server.ip_address)).toBeInTheDocument();
    expect(screen.getByText(server.node_count.toString())).toBeInTheDocument();
  });

  it('handles servers with zero nodes', () => {
    // Arrange
    const serverWithNoNodes = mockServers[2]; // This one has node_count: 0

    // Act
    render(<ServersTable servers={[serverWithNoNodes]} />);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
