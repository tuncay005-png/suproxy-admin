/**
 * Clients Table Component Tests
 * 
 * Tests for the Xray clients table component.
 * 
 * @module components/admin/xray/clients/clients-table.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientsTable } from './clients-table';
import type { XrayClient } from '@/types/xray';

// Mock the formatBytes function
vi.mock('@/lib/utils/format', () => ({
  formatBytes: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 1024) return `${bytes} Bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  },
}));

describe('ClientsTable', () => {
  const mockClients: XrayClient[] = [
    {
      id: '1',
      email: 'user1@example.com',
      uuid: 'uuid-1-test-12345',
      inbound_id: 'inbound-1',
      inbound_tag: 'main-inbound',
      enabled: true,
      traffic_up: 1024 * 1024, // 1 MB
      traffic_down: 2 * 1024 * 1024, // 2 MB
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'user2@example.com',
      uuid: 'uuid-2-test-67890',
      inbound_id: 'inbound-1',
      inbound_tag: 'secondary-inbound',
      enabled: false,
      traffic_up: 512 * 1024, // 512 KB
      traffic_down: 1024 * 1024, // 1 MB
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  it('renders empty state when no clients exist', () => {
    render(<ClientsTable clients={[]} />);

    expect(screen.getByText('No Xray clients found')).toBeInTheDocument();
    expect(screen.getByText('There are no client access configurations yet')).toBeInTheDocument();
  });

  it('renders clients table with data', () => {
    render(<ClientsTable clients={mockClients} />);

    // Check table title and count
    expect(screen.getByText('Xray Clients')).toBeInTheDocument();
    expect(screen.getByText('2 clients configured')).toBeInTheDocument();

    // Check if emails are displayed
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();

    // Check if UUIDs are displayed
    expect(screen.getByText('uuid-1-test-12345')).toBeInTheDocument();
    expect(screen.getByText('uuid-2-test-67890')).toBeInTheDocument();

    // Check if inbound tags are displayed
    expect(screen.getByText('main-inbound')).toBeInTheDocument();
    expect(screen.getByText('secondary-inbound')).toBeInTheDocument();
  });

  it('renders status badges correctly', () => {
    render(<ClientsTable clients={mockClients} />);

    // Check for enabled and disabled badges
    const enabledBadges = screen.getAllByText('Enabled');
    const disabledBadges = screen.getAllByText('Disabled');

    expect(enabledBadges).toHaveLength(1);
    expect(disabledBadges).toHaveLength(1);
  });

  it('formats traffic statistics correctly', () => {
    render(<ClientsTable clients={mockClients} />);

    // Check if traffic is formatted (multiple instances of same values are ok)
    expect(screen.getAllByText('1.00 MB').length).toBeGreaterThan(0); // upload for client 1 and download for client 2
    expect(screen.getByText('2.00 MB')).toBeInTheDocument(); // download for client 1
    expect(screen.getByText('512.00 KB')).toBeInTheDocument(); // upload for client 2
  });

  it('renders singular client text correctly', () => {
    const singleClient = [mockClients[0]];
    render(<ClientsTable clients={singleClient} />);

    expect(screen.getByText('1 client configured')).toBeInTheDocument();
  });

  it('renders table headers correctly', () => {
    render(<ClientsTable clients={mockClients} />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('UUID')).toBeInTheDocument();
    expect(screen.getByText('Inbound')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });
});
