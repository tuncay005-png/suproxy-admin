/**
 * Nodes List Component Tests
 * 
 * Tests for the NodesList component.
 * 
 * @module components/admin/servers/nodes-list.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodesList } from './nodes-list';
import type { Node } from '@/types/server';

describe('NodesList', () => {
  const mockNodes: Node[] = [
    {
      id: '1',
      server_id: 'server-1',
      type: 'xray',
      name: 'Xray Node 1',
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
      id: '2',
      server_id: 'server-1',
      type: 'database',
      name: 'Database Node',
      status: 'unhealthy',
      health_metrics: {
        cpu_usage: 92.7,
        memory_usage: 88.4,
        disk_usage: 95.2,
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      server_id: 'server-1',
      type: 'service',
      name: 'Service Node',
      status: 'unknown',
      health_metrics: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  it('renders nodes table with data', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    expect(screen.getByText('Xray Node 1')).toBeInTheDocument();
    expect(screen.getByText('Database Node')).toBeInTheDocument();
    expect(screen.getByText('Service Node')).toBeInTheDocument();
  });

  it('displays node types as badges', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    expect(screen.getByText('xray')).toBeInTheDocument();
    expect(screen.getByText('database')).toBeInTheDocument();
    expect(screen.getByText('service')).toBeInTheDocument();
  });

  it('displays CPU usage as percentage', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    expect(screen.getByText('45.5%')).toBeInTheDocument();
    expect(screen.getByText('92.7%')).toBeInTheDocument();
  });

  it('displays memory usage as percentage', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    expect(screen.getByText('62.3%')).toBeInTheDocument();
    expect(screen.getByText('88.4%')).toBeInTheDocument();
  });

  it('displays disk usage as percentage', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    expect(screen.getByText('78.1%')).toBeInTheDocument();
    expect(screen.getByText('95.2%')).toBeInTheDocument();
  });

  it('displays em-dash for missing metrics', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    // Service Node has no metrics, should show "—" three times
    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThanOrEqual(3);
  });

  it('renders health indicators with status', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByText('Unhealthy')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('displays empty state when no nodes provided', () => {
    // Act
    render(<NodesList nodes={[]} />);

    // Assert
    expect(screen.getByText('No nodes found for this server')).toBeInTheDocument();
  });

  it('displays empty state when nodes is undefined', () => {
    // Act
    render(<NodesList nodes={undefined as any} />);

    // Assert
    expect(screen.getByText('No nodes found for this server')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    expect(screen.getByText('Node Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('Disk Usage')).toBeInTheDocument();
  });

  it('formats percentage with one decimal place', () => {
    // Arrange
    const nodeWithDecimal: Node[] = [
      {
        id: '1',
        server_id: 'server-1',
        type: 'xray',
        name: 'Test Node',
        status: 'healthy',
        health_metrics: {
          cpu_usage: 33.333333,
          memory_usage: 66.666666,
          disk_usage: 99.999999,
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    // Act
    render(<NodesList nodes={nodeWithDecimal} />);

    // Assert
    expect(screen.getByText('33.3%')).toBeInTheDocument();
    expect(screen.getByText('66.7%')).toBeInTheDocument();
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('handles zero metrics correctly', () => {
    // Arrange
    const nodeWithZero: Node[] = [
      {
        id: '1',
        server_id: 'server-1',
        type: 'xray',
        name: 'Idle Node',
        status: 'healthy',
        health_metrics: {
          cpu_usage: 0,
          memory_usage: 0,
          disk_usage: 0,
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    // Act
    render(<NodesList nodes={nodeWithZero} />);

    // Assert
    const zeroMetrics = screen.getAllByText('0.0%');
    expect(zeroMetrics).toHaveLength(3); // CPU, memory, disk all at 0.0%
  });

  it('renders multiple nodes in order', () => {
    // Act
    render(<NodesList nodes={mockNodes} />);

    // Assert
    const nodeNames = screen.getAllByRole('cell').filter(cell => 
      cell.textContent === 'Xray Node 1' || 
      cell.textContent === 'Database Node' || 
      cell.textContent === 'Service Node'
    );
    expect(nodeNames).toHaveLength(3);
  });
});
