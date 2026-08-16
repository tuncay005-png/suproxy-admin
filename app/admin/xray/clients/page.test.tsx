/**
 * Xray Clients Page Tests
 * 
 * Tests for the Xray clients list page functionality.
 * 
 * @module app/admin/xray/clients/page.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import XrayClientsPage from './page';
import type { XrayClient } from '@/types/xray';

// Mock the xrayApi module
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    clients: {
      list: vi.fn(),
    },
  },
}));

// Mock the PageHeader component
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: { heading: string; description: string }) => (
    <div>
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

// Mock the ClientsTable component
vi.mock('@/components/admin/xray/clients/clients-table', () => ({
  ClientsTable: ({ clients }: { clients: XrayClient[] }) => (
    <div data-testid="clients-table">
      {clients.length} clients
    </div>
  ),
}));

describe('XrayClientsPage', () => {
  const mockClients: XrayClient[] = [
    {
      id: '1',
      email: 'user1@example.com',
      uuid: 'uuid-1',
      inbound_id: 'inbound-1',
      inbound_tag: 'main-inbound',
      enabled: true,
      traffic_up: 1024000,
      traffic_down: 2048000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'user2@example.com',
      uuid: 'uuid-2',
      inbound_id: 'inbound-1',
      inbound_tag: 'main-inbound',
      enabled: false,
      traffic_up: 512000,
      traffic_down: 1024000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header', async () => {
    const { xrayApi } = await import('@/lib/api/endpoints/xray');
    vi.mocked(xrayApi.clients.list).mockResolvedValue({
      success: true,
      data: { clients: mockClients },
    });

    const page = await XrayClientsPage();
    render(page);

    expect(screen.getByText('Xray Clients')).toBeInTheDocument();
    expect(screen.getByText('Manage individual user access configurations and view traffic statistics')).toBeInTheDocument();
  });

  it('fetches and displays clients data', async () => {
    const { xrayApi } = await import('@/lib/api/endpoints/xray');
    vi.mocked(xrayApi.clients.list).mockResolvedValue({
      success: true,
      data: { clients: mockClients },
    });

    const page = await XrayClientsPage();
    render(page);

    expect(xrayApi.clients.list).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('clients-table')).toBeInTheDocument();
    expect(screen.getByText('2 clients')).toBeInTheDocument();
  });

  it('handles empty clients list', async () => {
    const { xrayApi } = await import('@/lib/api/endpoints/xray');
    vi.mocked(xrayApi.clients.list).mockResolvedValue({
      success: true,
      data: { clients: [] },
    });

    const page = await XrayClientsPage();
    render(page);

    expect(xrayApi.clients.list).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('clients-table')).toBeInTheDocument();
    expect(screen.getByText('0 clients')).toBeInTheDocument();
  });
});
