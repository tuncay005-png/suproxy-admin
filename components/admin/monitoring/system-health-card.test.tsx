/**
 * SystemHealthCard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemHealthCard } from './system-health-card';
import type { SystemHealth } from '@/types/system';

describe('SystemHealthCard', () => {
  it('renders healthy system status with green badge', () => {
    const healthData: SystemHealth = {
      status: 'healthy',
      database: 'connected',
      timestamp: '2024-01-01T12:00:00Z',
    };

    render(<SystemHealthCard health={healthData} />);

    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('healthy')).toBeInTheDocument();
    expect(screen.getByText('connected')).toBeInTheDocument();
  });

  it('renders degraded system status with yellow badge', () => {
    const healthData: SystemHealth = {
      status: 'degraded',
      database: 'connected',
      timestamp: '2024-01-01T12:00:00Z',
    };

    render(<SystemHealthCard health={healthData} />);

    expect(screen.getByText('degraded')).toBeInTheDocument();
  });

  it('renders unhealthy system status with red badge', () => {
    const healthData: SystemHealth = {
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: '2024-01-01T12:00:00Z',
    };

    render(<SystemHealthCard health={healthData} />);

    expect(screen.getByText('unhealthy')).toBeInTheDocument();
    expect(screen.getByText('disconnected')).toBeInTheDocument();
  });

  it('displays error state when health data is null', () => {
    render(<SystemHealthCard health={null} />);

    expect(screen.getByText('Health check failed')).toBeInTheDocument();
    expect(screen.getByText('Unable to retrieve system health data. The backend may be unavailable.')).toBeInTheDocument();
  });

  it('displays timestamp', () => {
    const healthData: SystemHealth = {
      status: 'healthy',
      database: 'connected',
      timestamp: '2024-01-01T12:00:00Z',
    };

    render(<SystemHealthCard health={healthData} />);

    expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
  });
});
