/**
 * Unit tests for ClientConfigDisplay component
 * 
 * Tests the client configuration display functionality including:
 * - Rendering configuration details
 * - Copy-to-clipboard functionality
 * - QR code display
 * - Responsive layout
 * 
 * @module components/admin/xray/clients/client-config-display.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientConfigDisplay } from './client-config-display';
import type { XrayClientConfig } from '@/types/xray';

// Mock the QRCodeSVG component
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <div data-testid="qr-code" data-value={value}>QR Code Mock</div>
  ),
}));

describe('ClientConfigDisplay', () => {
  const mockConfig: XrayClientConfig = {
    protocol: 'vless',
    address: 'example.com',
    port: 443,
    uuid: '12345678-1234-1234-1234-123456789abc',
    connection_url: 'vless://12345678-1234-1234-1234-123456789abc@example.com:443?type=tcp',
    qr_code_data: 'base64encodedqrdata',
  };

  // Mock clipboard API
  const mockClipboard = {
    writeText: vi.fn(),
  };

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default title and description', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      expect(screen.getByText('Client Configuration')).toBeInTheDocument();
      expect(
        screen.getByText('Use the connection URL or scan the QR code to configure your client')
      ).toBeInTheDocument();
    });

    it('should render with custom title and description', () => {
      render(
        <ClientConfigDisplay
          config={mockConfig}
          title="Custom Title"
          description="Custom Description"
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
    });

    it('should display client email when provided', () => {
      const clientEmail = 'test@example.com';
      render(<ClientConfigDisplay config={mockConfig} clientEmail={clientEmail} />);

      expect(screen.getByText(`Client: ${clientEmail}`)).toBeInTheDocument();
    });

    it('should display connection URL', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      expect(screen.getByText(mockConfig.connection_url)).toBeInTheDocument();
    });

    it('should display configuration details', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      expect(screen.getByText('vless')).toBeInTheDocument();
      expect(screen.getByText('example.com')).toBeInTheDocument();
      expect(screen.getByText('443')).toBeInTheDocument();
      expect(screen.getByText('12345678-1234-1234-1234-123456789abc')).toBeInTheDocument();
    });

    it('should render QR code with connection URL', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      const qrCode = screen.getByTestId('qr-code');
      expect(qrCode).toBeInTheDocument();
      expect(qrCode).toHaveAttribute('data-value', mockConfig.connection_url);
    });

    it('should display QR code instruction text', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      expect(
        screen.getByText('Scan this QR code with your Xray client application')
      ).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard', () => {
    it('should display copy button', () => {
      render(<ClientConfigDisplay config={mockConfig} />);
      const copyButton = screen.getByRole('button', { name: /copy url|copied/i });
      expect(copyButton).toBeInTheDocument();
    });

    it('should show success feedback after copying', async () => {
      const user = userEvent.setup();
      render(<ClientConfigDisplay config={mockConfig} />);

      const copyButton = screen.getByRole('button', { name: /copy url/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should reset success feedback after 2 seconds', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const user = userEvent.setup();
      render(<ClientConfigDisplay config={mockConfig} />);

      const copyButton = screen.getByRole('button', { name: /copy url/i });
      await user.click(copyButton);

      // Success message should be visible
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      // Wait for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2100));

      // Success message should be gone, back to "Copy URL"
      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
        expect(screen.getByText('Copy URL')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ClientConfigDisplay config={mockConfig} className="custom-class" />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should have responsive grid layout for configuration details', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      const detailsGrid = screen.getByText('Configuration Details').nextElementSibling;
      expect(detailsGrid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      // Check that section headings exist
      expect(screen.getByText('Connection URL')).toBeInTheDocument();
      expect(screen.getByText('QR Code')).toBeInTheDocument();
      expect(screen.getByText('Configuration Details')).toBeInTheDocument();
    });

    it('should have accessible copy button', () => {
      render(<ClientConfigDisplay config={mockConfig} />);

      const copyButton = screen.getByRole('button', { name: /copy url/i });
      expect(copyButton).toBeEnabled();
    });
  });
});
