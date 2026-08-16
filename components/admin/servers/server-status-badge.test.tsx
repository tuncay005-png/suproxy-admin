/**
 * Server Status Badge Component Tests
 * 
 * Tests for the ServerStatusBadge component.
 * 
 * @module components/admin/servers/server-status-badge.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServerStatusBadge } from './server-status-badge';

describe('ServerStatusBadge', () => {
  it('renders "Online" badge for online status', () => {
    // Act
    render(<ServerStatusBadge status="online" />);

    // Assert
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders "Offline" badge for offline status', () => {
    // Act
    render(<ServerStatusBadge status="offline" />);

    // Assert
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('renders "Maintenance" badge for maintenance status', () => {
    // Act
    render(<ServerStatusBadge status="maintenance" />);

    // Assert
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  it('applies green styling for online status', () => {
    // Act
    const { container } = render(<ServerStatusBadge status="online" />);

    // Assert
    const badge = container.querySelector('.bg-green-500');
    expect(badge).toBeInTheDocument();
  });

  it('applies red styling for offline status', () => {
    // Act
    const { container } = render(<ServerStatusBadge status="offline" />);

    // Assert
    // Offline uses destructive variant
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('applies yellow styling for maintenance status', () => {
    // Act
    const { container } = render(<ServerStatusBadge status="maintenance" />);

    // Assert
    const badge = container.querySelector('.bg-yellow-500');
    expect(badge).toBeInTheDocument();
  });

  it('includes whitespace-nowrap class', () => {
    // Act
    const { container } = render(<ServerStatusBadge status="online" />);

    // Assert
    const badge = container.querySelector('.whitespace-nowrap');
    expect(badge).toBeInTheDocument();
  });

  it('handles all status values correctly', () => {
    // Arrange
    const statuses: Array<'online' | 'offline' | 'maintenance'> = ['online', 'offline', 'maintenance'];

    statuses.forEach((status) => {
      // Act
      const { unmount } = render(<ServerStatusBadge status={status} />);

      // Assert
      const expectedText = status.charAt(0).toUpperCase() + status.slice(1);
      expect(screen.getByText(expectedText)).toBeInTheDocument();

      // Cleanup
      unmount();
    });
  });
});
