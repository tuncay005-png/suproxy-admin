/**
 * Unit tests for Xray Inbounds Page
 * 
 * Tests the server component page rendering and data fetching logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { xrayApi } from '@/lib/api/endpoints/xray';
import type { XrayInbound } from '@/types/xray';

// Mock dependencies
vi.mock('@/lib/api/endpoints/xray', () => ({
  xrayApi: {
    inbounds: {
      list: vi.fn(),
    },
  },
}));

vi.mock('@/components/admin/xray/inbounds-table', () => ({
  InboundsTable: ({ initialData }: { initialData: XrayInbound[] }) => (
    <div data-testid="inbounds-table">
      {initialData.length > 0 ? (
        <div data-testid="inbounds-count">{initialData.length} inbounds</div>
      ) : (
        <div data-testid="empty-state">No inbounds</div>
      )}
    </div>
  ),
}));

vi.mock('@/lib/i18n/context', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
    locale: 'en',
    changeLanguage: vi.fn(),
  }),
}));

describe('Xray Inbounds Page', () => {
  const mockInbounds: XrayInbound[] = [
    {
      id: '1',
      instance_id: 'inst-1',
      protocol: 'vless',
      port: 443,
      tag: 'main-inbound',
      enabled: true,
      settings: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      instance_id: 'inst-1',
      protocol: 'vmess',
      port: 8443,
      tag: 'secondary-inbound',
      enabled: false,
      settings: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and display inbounds data', async () => {
    // Mock successful API response
    vi.mocked(xrayApi.inbounds.list).mockResolvedValue({
      success: true,
      data: { inbounds: mockInbounds },
    });

    const InboundsPage = (await import('./page')).default;
    const { container } = render(await InboundsPage());

    expect(screen.getByTestId('inbounds-table')).toBeInTheDocument();
    expect(screen.getByTestId('inbounds-count')).toHaveTextContent('2 inbounds');
  });

  it('should handle empty inbounds list', async () => {
    // Mock API response with empty array
    vi.mocked(xrayApi.inbounds.list).mockResolvedValue({
      success: true,
      data: { inbounds: [] },
    });

    const InboundsPage = (await import('./page')).default;
    render(await InboundsPage());

    expect(screen.getByTestId('inbounds-table')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('should call xrayApi.inbounds.list on page load', async () => {
    vi.mocked(xrayApi.inbounds.list).mockResolvedValue({
      success: true,
      data: { inbounds: mockInbounds },
    });

    const InboundsPage = (await import('./page')).default;
    await InboundsPage();

    expect(xrayApi.inbounds.list).toHaveBeenCalledTimes(1);
  });
});
