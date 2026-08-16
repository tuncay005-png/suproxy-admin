/**
 * Xray Inbounds Page Tests
 * 
 * Tests for the Xray Inbounds list page Server Component.
 * 
 * @module app/admin/xray/inbounds/page.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import XrayInboundsPage from './page';
import { xrayApi } from '@/lib/api/endpoints/xray';
import type { XrayInbound } from '@/types/xray';

// Mock the xray API
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    inbounds: {
      list: vi.fn(),
    },
  },
}));

// Mock the child components
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/admin/xray/inbounds/inbounds-table', () => ({
  InboundsTable: ({ inbounds }: { inbounds: XrayInbound[] }) => (
    <div data-testid="inbounds-table">
      <p>Inbounds count: {inbounds.length}</p>
    </div>
  ),
}));

describe('XrayInboundsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays inbounds data', async () => {
    // Arrange
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
        instance_id: 'instance-1',
        protocol: 'vmess',
        port: 8080,
        tag: 'secondary-inbound',
        enabled: false,
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(xrayApi.inbounds.list).mockResolvedValue({
      success: true,
      data: { inbounds: mockInbounds },
    });

    // Act
    const page = await XrayInboundsPage();
    render(page);

    // Assert
    expect(xrayApi.inbounds.list).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Xray Inbounds')).toBeInTheDocument();
    expect(screen.getByText('Manage Xray inbound proxy configurations')).toBeInTheDocument();
    expect(screen.getByTestId('inbounds-table')).toBeInTheDocument();
    expect(screen.getByText('Inbounds count: 2')).toBeInTheDocument();
  });

  it('renders with empty inbounds array', async () => {
    // Arrange
    vi.mocked(xrayApi.inbounds.list).mockResolvedValue({
      success: true,
      data: { inbounds: [] },
    });

    // Act
    const page = await XrayInboundsPage();
    render(page);

    // Assert
    expect(xrayApi.inbounds.list).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('inbounds-table')).toBeInTheDocument();
    expect(screen.getByText('Inbounds count: 0')).toBeInTheDocument();
  });

  it('displays correct page header content', async () => {
    // Arrange
    vi.mocked(xrayApi.inbounds.list).mockResolvedValue({
      success: true,
      data: { inbounds: [] },
    });

    // Act
    const page = await XrayInboundsPage();
    render(page);

    // Assert
    const pageHeader = screen.getByTestId('page-header');
    expect(pageHeader).toBeInTheDocument();
    expect(screen.getByText('Xray Inbounds')).toBeInTheDocument();
    expect(screen.getByText('Manage Xray inbound proxy configurations')).toBeInTheDocument();
  });
});
