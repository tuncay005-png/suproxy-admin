/**
 * Tests for MonitoringDashboard Component
 * 
 * Validates: Requirements 10.7
 * - 10.7: Auto-refresh health status every 30 seconds
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonitoringDashboard } from './monitoring-dashboard';
import type { SystemHealth, DatabaseStatus, XraySystemStatus, VersionInfo } from '@/types/system';

// Mock the system API
vi.mock('@/lib/api/endpoints', () => ({
  systemApi: {
    getHealth: vi.fn(),
    getDatabaseStatus: vi.fn(),
    getXraySystemStatus: vi.fn(),
    getVersion: vi.fn(),
  },
}));

// Mock child components
vi.mock('./system-health-card', () => ({
  SystemHealthCard: ({ health }: { health: SystemHealth | null }) => (
    <div data-testid="system-health-card">
      {health ? health.status : 'null'}
    </div>
  ),
}));

vi.mock('./database-status-card', () => ({
  DatabaseStatusCard: ({ database }: { database: DatabaseStatus | null }) => (
    <div data-testid="database-status-card">
      {database ? database.status : 'null'}
    </div>
  ),
}));

vi.mock('./xray-system-card', () => ({
  XraySystemCard: ({ xray }: { xray: XraySystemStatus | null }) => (
    <div data-testid="xray-system-card">
      {xray ? xray.instances_total : 'null'}
    </div>
  ),
}));

vi.mock('./version-info-card', () => ({
  VersionInfoCard: ({ version }: { version: VersionInfo | null }) => (
    <div data-testid="version-info-card">
      {version ? version.version : 'null'}
    </div>
  ),
}));

describe('MonitoringDashboard', () => {
  // Sample data
  const mockHealth: SystemHealth = {
    status: 'healthy',
    database: 'connected',
    timestamp: '2024-01-15T12:00:00Z',
  };

  const mockDatabase: DatabaseStatus = {
    status: 'connected',
    response_time_ms: 25,
    active_connections: 10,
    max_connections: 100,
  };

  const mockXray: XraySystemStatus = {
    instances_total: 5,
    instances_running: 4,
    instances_stopped: 1,
    clients_total: 100,
    clients_active: 85,
  };

  const mockVersion: VersionInfo = {
    version: '1.0.0',
    build_date: '2024-01-15',
    git_commit: 'abc123',
  };

  describe('Initial Rendering', () => {
    it('should display initial data from server', () => {
      render(
        <MonitoringDashboard
          initialHealth={mockHealth}
          initialDatabase={mockDatabase}
          initialXray={mockXray}
          initialVersion={mockVersion}
        />
      );

      // Verify all cards are rendered with initial data
      expect(screen.getByTestId('system-health-card')).toHaveTextContent('healthy');
      expect(screen.getByTestId('database-status-card')).toHaveTextContent('connected');
      expect(screen.getByTestId('xray-system-card')).toHaveTextContent('5');
      expect(screen.getByTestId('version-info-card')).toHaveTextContent('1.0.0');
    });

    it('should display auto-refresh toggle component', () => {
      render(
        <MonitoringDashboard
          initialHealth={mockHealth}
          initialDatabase={mockDatabase}
          initialXray={mockXray}
          initialVersion={mockVersion}
        />
      );

      // Auto-refresh toggle should be present
      expect(screen.getByText(/Auto-refresh/i)).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should display last updated timestamp', () => {
      render(
        <MonitoringDashboard
          initialHealth={mockHealth}
          initialDatabase={mockDatabase}
          initialXray={mockXray}
          initialVersion={mockVersion}
        />
      );

      // Should show "Last updated" text
      expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
    });

    it('should display manual refresh button', () => {
      render(
        <MonitoringDashboard
          initialHealth={mockHealth}
          initialDatabase={mockDatabase}
          initialXray={mockXray}
          initialVersion={mockVersion}
        />
      );

      // Refresh button should be present
      const refreshButton = screen.getByRole('button', { name: /Refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should handle null initial data gracefully', () => {
      render(
        <MonitoringDashboard
          initialHealth={null}
          initialDatabase={null}
          initialXray={null}
          initialVersion={null}
        />
      );

      // Should still render cards with null state
      expect(screen.getByTestId('system-health-card')).toHaveTextContent('null');
      expect(screen.getByTestId('database-status-card')).toHaveTextContent('null');
      expect(screen.getByTestId('xray-system-card')).toHaveTextContent('null');
      expect(screen.getByTestId('version-info-card')).toHaveTextContent('null');
    });

    it('should render all monitoring cards in grid layout', () => {
      render(
        <MonitoringDashboard
          initialHealth={mockHealth}
          initialDatabase={mockDatabase}
          initialXray={mockXray}
          initialVersion={mockVersion}
        />
      );

      // Verify all four cards are present
      expect(screen.getByTestId('system-health-card')).toBeInTheDocument();
      expect(screen.getByTestId('database-status-card')).toBeInTheDocument();
      expect(screen.getByTestId('xray-system-card')).toBeInTheDocument();
      expect(screen.getByTestId('version-info-card')).toBeInTheDocument();
    });
  });

  describe('Auto-Refresh Toggle Display', () => {
    it('should show auto-refresh toggle in disabled state by default', () => {
      render(
        <MonitoringDashboard
          initialHealth={mockHealth}
          initialDatabase={mockDatabase}
          initialXray={mockXray}
          initialVersion={mockVersion}
        />
      );

      // Toggle should be unchecked by default
      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();
    });

    it('should display 30 second refresh interval in label', () => {
      render(
        <MonitoringDashboard
          initialHealth={mockHealth}
          initialDatabase={mockDatabase}
          initialXray={mockXray}
          initialVersion={mockVersion}
        />
      );

      // Should show 30s interval
      expect(screen.getByText(/Auto-refresh \(30s\)/i)).toBeInTheDocument();
    });
  });
});
