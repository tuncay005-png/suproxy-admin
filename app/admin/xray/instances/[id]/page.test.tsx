/**
 * Tests for Xray Instance Detail Page
 * 
 * Validates: Requirements 4.7-4.9
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import InstanceDetailPage from './page';
import { xrayApi } from '@/lib/api/endpoints/xray';

// Mock the API
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    instances: {
      getById: vi.fn(),
      getHealth: vi.fn(),
      getStats: vi.fn(),
    },
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock child components
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: any) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/admin/xray/instances/instance-health-card', () => ({
  InstanceHealthCard: ({ instanceId, initialHealth }: any) => (
    <div data-testid="health-card">
      Health Card: {instanceId} - {initialHealth.status}
    </div>
  ),
}));

vi.mock('@/components/admin/xray/instances/instance-stats-card', () => ({
  InstanceStatsCard: ({ instanceId, initialStats }: any) => (
    <div data-testid="stats-card">
      Stats Card: {instanceId} - {initialStats.connections_active}
    </div>
  ),
}));

vi.mock('@/components/admin/xray/instances/instance-control-buttons', () => ({
  InstanceControlButtons: ({ instance }: any) => (
    <div data-testid="control-buttons">
      Control Buttons: {instance.name}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

describe('InstanceDetailPage', () => {
  const mockInstance = {
    id: 'instance-1',
    name: 'Test Instance',
    status: 'running' as const,
    server_id: 'server-1',
    server_name: 'Test Server',
    uptime: 3600,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  };

  const mockHealth = {
    status: 'healthy' as const,
    uptime: 3600,
    last_check: '2024-01-02T00:00:00Z',
  };

  const mockStats = {
    connections_active: 10,
    connections_total: 100,
    traffic_up: 1048576,
    traffic_down: 2097152,
    clients_active: 5,
    clients_total: 20,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(xrayApi.instances.getById).mockResolvedValue({
      success: true,
      data: mockInstance,
    } as any);

    vi.mocked(xrayApi.instances.getHealth).mockResolvedValue({
      success: true,
      data: mockHealth,
    } as any);

    vi.mocked(xrayApi.instances.getStats).mockResolvedValue({
      success: true,
      data: mockStats,
    } as any);
  });

  it('fetches instance data, health, and stats in parallel', async () => {
    await InstanceDetailPage({ params: { id: 'instance-1' } });

    expect(xrayApi.instances.getById).toHaveBeenCalledWith('instance-1');
    expect(xrayApi.instances.getHealth).toHaveBeenCalledWith('instance-1');
    expect(xrayApi.instances.getStats).toHaveBeenCalledWith('instance-1');
  });

  it('renders page header with instance name and server', async () => {
    const page = await InstanceDetailPage({ params: { id: 'instance-1' } });
    const { container } = render(page as any);

    const pageHeader = screen.getByTestId('page-header');
    expect(pageHeader).toHaveTextContent('Test Instance');
    expect(pageHeader).toHaveTextContent('Instance on Test Server');
  });

  it('renders instance information card with all details', async () => {
    const page = await InstanceDetailPage({ params: { id: 'instance-1' } });
    const { container } = render(page as any);

    expect(screen.getByText('Instance Information')).toBeInTheDocument();
    expect(screen.getByText('instance-1')).toBeInTheDocument();
    expect(screen.getAllByText('Test Instance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Test Server').length).toBeGreaterThan(0);
    expect(screen.getByText('running')).toBeInTheDocument();
  });

  it('renders control buttons', async () => {
    const page = await InstanceDetailPage({ params: { id: 'instance-1' } });
    const { container } = render(page as any);

    expect(screen.getByTestId('control-buttons')).toBeInTheDocument();
    expect(screen.getByText(/Control Buttons: Test Instance/)).toBeInTheDocument();
  });

  it('renders health card with instance ID and initial health', async () => {
    const page = await InstanceDetailPage({ params: { id: 'instance-1' } });
    const { container } = render(page as any);

    expect(screen.getByTestId('health-card')).toBeInTheDocument();
    expect(screen.getByText(/Health Card: instance-1 - healthy/)).toBeInTheDocument();
  });

  it('renders stats card with instance ID and initial stats', async () => {
    const page = await InstanceDetailPage({ params: { id: 'instance-1' } });
    const { container } = render(page as any);

    expect(screen.getByTestId('stats-card')).toBeInTheDocument();
    expect(screen.getByText(/Stats Card: instance-1 - 10/)).toBeInTheDocument();
  });

  it('displays formatted dates for created_at and updated_at', async () => {
    const page = await InstanceDetailPage({ params: { id: 'instance-1' } });
    const { container } = render(page as any);

    // Check that dates are rendered (exact format may vary by locale)
    const createdDate = new Date('2024-01-01T00:00:00Z').toLocaleString();
    const updatedDate = new Date('2024-01-02T00:00:00Z').toLocaleString();
    
    expect(screen.getByText(createdDate)).toBeInTheDocument();
    expect(screen.getByText(updatedDate)).toBeInTheDocument();
  });
});
