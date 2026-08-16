/**
 * Server Detail Page Tests
 * 
 * Tests for the server detail page that displays server information
 * and associated nodes.
 * 
 * @module app/admin/servers/[id]/page.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServerDetailPage from './page';
import type { Server, Node } from '@/types/server';
import type { ApiResponse } from '@/types/api';

// Mock the API modules
vi.mock('@/lib/api/endpoints/servers', () => ({
  serversApi: {
    getById: vi.fn(),
  },
}));

vi.mock('@/lib/api/endpoints/nodes', () => ({
  nodesApi: {
    listByServer: vi.fn(),
  },
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// Mock the format utility
vi.mock('@/lib/utils/format', () => ({
  formatDate: vi.fn((date: string) => new Date(date).toLocaleDateString()),
}));

import { serversApi } from '@/lib/api/endpoints/servers';
import { nodesApi } from '@/lib/api/endpoints/nodes';
import { notFound } from 'next/navigation';

describe('ServerDetailPage', () => {
  const mockServer: Server = {
    id: 'server-123',
    name: 'US-East-Server-01',
    country: 'United States',
    city: 'New York',
    ip_address: '192.168.1.100',
    status: 'online',
    node_count: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  };

  const mockNodes: Node[] = [
    {
      id: 'node-1',
      server_id: 'server-123',
      type: 'xray',
      name: 'Xray Instance 1',
      status: 'healthy',
      health_metrics: {
        cpu_usage: 45.5,
        memory_usage: 62.3,
        disk_usage: 78.1,
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'node-2',
      server_id: 'server-123',
      type: 'database',
      name: 'PostgreSQL',
      status: 'healthy',
      health_metrics: {
        cpu_usage: 25.0,
        memory_usage: 55.0,
        disk_usage: 40.0,
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'node-3',
      server_id: 'server-123',
      type: 'service',
      name: 'Monitoring Service',
      status: 'unknown',
      health_metrics: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders server details and nodes when data is fetched successfully', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: mockNodes, total: 3 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert - Server details (using getAllByText for duplicate text)
    const serverNames = screen.getAllByText('US-East-Server-01');
    expect(serverNames.length).toBeGreaterThan(0);
    const locations = screen.getAllByText('New York, United States');
    expect(locations.length).toBeGreaterThan(0);
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('server-123')).toBeInTheDocument();
  });

  it('fetches server and nodes data in parallel', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: mockNodes, total: 3 },
      success: true,
    } as any);

    // Act
    await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });

    // Assert - Both API calls are made with correct parameters
    expect(serversApi.getById).toHaveBeenCalledWith('server-123');
    expect(nodesApi.listByServer).toHaveBeenCalledWith('server-123');
  });

  it('displays server information in structured layout', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: [], total: 0 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert - All server information sections are present
    expect(screen.getByText('Server Name')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('Server Status')).toBeInTheDocument();
    expect(screen.getByText('Active Nodes')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Server ID')).toBeInTheDocument();
  });

  it('displays nodes list with correct data', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: mockNodes, total: 3 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert - All nodes are displayed
    expect(screen.getByText('Xray Instance 1')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Monitoring Service')).toBeInTheDocument();
  });

  it('displays node health metrics', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: mockNodes, total: 3 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert - Health metrics are displayed as percentages
    expect(screen.getByText('45.5%')).toBeInTheDocument();
    expect(screen.getByText('62.3%')).toBeInTheDocument();
    expect(screen.getByText('78.1%')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('55.0%')).toBeInTheDocument();
    expect(screen.getByText('40.0%')).toBeInTheDocument();
  });

  it('displays nodes section with header and description', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: mockNodes, total: 3 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert
    expect(screen.getByText('Server Nodes')).toBeInTheDocument();
    expect(screen.getByText('Services and processes running on this server')).toBeInTheDocument();
  });

  it('calls notFound when server data fetch fails', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockRejectedValue(new Error('Server not found'));
    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: [], total: 0 },
      success: true,
    } as any);

    // Act & Assert
    await expect(async () => {
      await ServerDetailPage({ 
        params: Promise.resolve({ id: 'invalid-id' }) 
      });
    }).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });

  it('calls notFound when nodes data fetch fails', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockRejectedValue(new Error('Nodes fetch failed'));

    // Act & Assert
    await expect(async () => {
      await ServerDetailPage({ 
        params: Promise.resolve({ id: 'server-123' }) 
      });
    }).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });

  it('displays back button linking to servers list', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: [], total: 0 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert
    const backLink = screen.getByRole('link');
    expect(backLink).toHaveAttribute('href', '/admin/servers');
  });

  it('displays page header with server name in description', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: [], total: 0 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert
    expect(screen.getByText('Server Details')).toBeInTheDocument();
    expect(screen.getByText('Viewing information for US-East-Server-01')).toBeInTheDocument();
  });

  it('displays server status badge', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: [], total: 0 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    const { container } = render(jsx);

    // Assert - ServerStatusBadge component is rendered
    // We check that the status badge is displayed (it shows "Online" for online status)
    // The badge appears twice: once in the header, once in the details section
    const badges = screen.getAllByText('Online');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('handles server with no nodes', async () => {
    // Arrange
    const serverWithNoNodes = { ...mockServer, node_count: 0 };
    
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: serverWithNoNodes,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: [], total: 0 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('No nodes found for this server')).toBeInTheDocument();
  });

  it('formats the created date correctly', async () => {
    // Arrange
    vi.mocked(serversApi.getById).mockResolvedValue({
      data: mockServer,
      success: true,
    } as ApiResponse<Server>);

    vi.mocked(nodesApi.listByServer).mockResolvedValue({
      data: { nodes: [], total: 0 },
      success: true,
    } as any);

    // Act
    const jsx = await ServerDetailPage({ 
      params: Promise.resolve({ id: 'server-123' }) 
    });
    render(jsx);

    // Assert - Date formatting is applied
    const formattedDate = new Date('2024-01-01T00:00:00Z').toLocaleDateString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});
