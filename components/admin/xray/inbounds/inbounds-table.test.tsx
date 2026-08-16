/**
 * Inbounds Table Component Tests
 * 
 * Tests for the InboundsTable client component.
 * 
 * @module components/admin/xray/inbounds/inbounds-table.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InboundsTable } from './inbounds-table';
import type { XrayInbound } from '@/types/xray';

// Mock child components
vi.mock('./inbound-status-badge', () => ({
  InboundStatusBadge: ({ enabled }: { enabled: boolean }) => (
    <span data-testid="status-badge">{enabled ? 'Enabled' : 'Disabled'}</span>
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

describe('InboundsTable', () => {
  const mockInbounds: XrayInbound[] = [
    {
      id: 'inbound-1',
      instance_id: 'instance-1',
      protocol: 'vless',
      port: 443,
      tag: 'main-inbound',
      enabled: true,
      settings: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'inbound-2',
      instance_id: 'instance-2',
      protocol: 'vmess',
      port: 8080,
      tag: 'secondary-inbound',
      enabled: false,
      settings: {},
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  it('renders inbounds table with data', () => {
    // Act
    render(<InboundsTable inbounds={mockInbounds} />);

    // Assert
    expect(screen.getByText('Xray Inbounds')).toBeInTheDocument();
    expect(screen.getByText('2 inbounds found')).toBeInTheDocument();
    
    // Check that table headers are present
    expect(screen.getByText('Protocol')).toBeInTheDocument();
    expect(screen.getByText('Port')).toBeInTheDocument();
    expect(screen.getByText('Tag')).toBeInTheDocument();
    
    // Check that inbound data is displayed (protocol is displayed lowercase in badge)
    expect(screen.getByText('vless')).toBeInTheDocument();
    expect(screen.getByText('vmess')).toBeInTheDocument();
    expect(screen.getByText('443')).toBeInTheDocument();
    expect(screen.getByText('8080')).toBeInTheDocument();
    expect(screen.getByText('main-inbound')).toBeInTheDocument();
    expect(screen.getByText('secondary-inbound')).toBeInTheDocument();
  });

  it('displays empty state when no inbounds exist', () => {
    // Act
    render(<InboundsTable inbounds={[]} />);

    // Assert
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No Xray inbounds found')).toBeInTheDocument();
    expect(screen.getByText('There are no Xray inbound configurations yet')).toBeInTheDocument();
  });

  it('displays singular inbound text for single inbound', () => {
    // Arrange
    const singleInbound = [mockInbounds[0]];

    // Act
    render(<InboundsTable inbounds={singleInbound} />);

    // Assert
    expect(screen.getByText('1 inbound found')).toBeInTheDocument();
  });

  it('displays plural inbounds text for multiple inbounds', () => {
    // Act
    render(<InboundsTable inbounds={mockInbounds} />);

    // Assert
    expect(screen.getByText('2 inbounds found')).toBeInTheDocument();
  });

  it('displays protocol badges with uppercase styling', () => {
    // Act
    const { container } = render(<InboundsTable inbounds={mockInbounds} />);

    // Assert - Check that badges have uppercase class
    const protocolBadges = container.querySelectorAll('.uppercase');
    expect(protocolBadges.length).toBeGreaterThan(0);
    expect(screen.getByText('vless')).toBeInTheDocument();
    expect(screen.getByText('vmess')).toBeInTheDocument();
  });

  it('displays ports in monospace font', () => {
    // Act
    const { container } = render(<InboundsTable inbounds={mockInbounds} />);

    // Assert
    const portCells = container.querySelectorAll('.font-mono');
    expect(portCells.length).toBeGreaterThan(0);
  });

  it('displays instance IDs in shortened format', () => {
    // Act
    render(<InboundsTable inbounds={mockInbounds} />);

    // Assert
    // Instance IDs should be truncated - there should be multiple instances with truncated text
    const truncatedIds = screen.getAllByText((content, element) => {
      return element?.textContent === 'instance...';
    });
    expect(truncatedIds.length).toBeGreaterThan(0);
  });

  it('displays status badges for each inbound', () => {
    // Act
    render(<InboundsTable inbounds={mockInbounds} />);

    // Assert
    const statusBadges = screen.getAllByTestId('status-badge');
    expect(statusBadges).toHaveLength(2);
    expect(statusBadges[0]).toHaveTextContent('Enabled');
    expect(statusBadges[1]).toHaveTextContent('Disabled');
  });

  it('renders table with responsive classes', () => {
    // Act
    const { container } = render(<InboundsTable inbounds={mockInbounds} />);

    // Assert
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    // Check for responsive wrapper
    const wrapper = container.querySelector('.overflow-x-auto');
    expect(wrapper).toBeInTheDocument();
  });
});
