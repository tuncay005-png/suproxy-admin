/**
 * Node Health Indicator Component Tests
 * 
 * Tests for the NodeHealthIndicator component.
 * 
 * @module components/admin/servers/node-health-indicator.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeHealthIndicator } from './node-health-indicator';

describe('NodeHealthIndicator', () => {
  it('renders health indicator for healthy status', () => {
    // Act
    render(<NodeHealthIndicator status="healthy" />);

    // Assert
    const statusElement = screen.getByRole('status');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('aria-label', 'Status: Healthy');
  });

  it('renders health indicator for unhealthy status', () => {
    // Act
    render(<NodeHealthIndicator status="unhealthy" />);

    // Assert
    const statusElement = screen.getByRole('status');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('aria-label', 'Status: Unhealthy');
  });

  it('renders health indicator for unknown status', () => {
    // Act
    render(<NodeHealthIndicator status="unknown" />);

    // Assert
    const statusElement = screen.getByRole('status');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('aria-label', 'Status: Unknown');
  });

  it('applies green styling for healthy status', () => {
    // Act
    const { container } = render(<NodeHealthIndicator status="healthy" />);

    // Assert
    const dot = container.querySelector('.bg-green-500');
    expect(dot).toBeInTheDocument();
  });

  it('applies red styling for unhealthy status', () => {
    // Act
    const { container } = render(<NodeHealthIndicator status="unhealthy" />);

    // Assert
    const dot = container.querySelector('.bg-red-500');
    expect(dot).toBeInTheDocument();
  });

  it('applies gray styling for unknown status', () => {
    // Act
    const { container } = render(<NodeHealthIndicator status="unknown" />);

    // Assert
    const dot = container.querySelector('.bg-gray-400');
    expect(dot).toBeInTheDocument();
  });

  it('shows label when showLabel is true', () => {
    // Act
    render(<NodeHealthIndicator status="healthy" showLabel />);

    // Assert
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('does not show label when showLabel is false', () => {
    // Act
    render(<NodeHealthIndicator status="healthy" showLabel={false} />);

    // Assert
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
  });

  it('does not show label by default', () => {
    // Act
    render(<NodeHealthIndicator status="healthy" />);

    // Assert
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    // Act
    const { container } = render(<NodeHealthIndicator status="healthy" className="custom-class" />);

    // Assert
    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('handles all status values correctly with labels', () => {
    // Arrange
    const statuses: Array<{ status: 'healthy' | 'unhealthy' | 'unknown'; label: string; color: string }> = [
      { status: 'healthy', label: 'Healthy', color: 'bg-green-500' },
      { status: 'unhealthy', label: 'Unhealthy', color: 'bg-red-500' },
      { status: 'unknown', label: 'Unknown', color: 'bg-gray-400' },
    ];

    statuses.forEach(({ status, label, color }) => {
      // Act
      const { container, unmount } = render(<NodeHealthIndicator status={status} showLabel />);

      // Assert
      expect(screen.getByText(label)).toBeInTheDocument();
      const dot = container.querySelector(`.${color}`);
      expect(dot).toBeInTheDocument();

      // Cleanup
      unmount();
    });
  });
});
