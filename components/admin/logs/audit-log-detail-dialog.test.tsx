/**
 * Tests for Audit Log Detail Dialog Component
 * 
 * @module components/admin/logs/audit-log-detail-dialog.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuditLogDetailDialog } from './audit-log-detail-dialog';
import type { AuditLog } from '@/types/audit';

const mockLog: AuditLog = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  action: 'user.create',
  actor_id: 'actor-123',
  actor_email: 'admin@example.com',
  entity_type: 'user',
  entity_id: 'user-456',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  status: 'success',
  metadata: {
    request_body: {
      email: 'newuser@example.com',
      role: 'user',
    },
    response: {
      id: 'user-456',
      created: true,
    },
  },
  created_at: '2024-01-15T10:30:00Z',
};

describe('AuditLogDetailDialog', () => {
  it('renders nothing when log is null', () => {
    const { container } = render(
      <AuditLogDetailDialog
        log={null}
        open={false}
        onOpenChange={vi.fn()}
      />
    );
    
    expect(container).toBeEmptyDOMElement();
  });

  it('displays basic audit log information', () => {
    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    // Check for basic information
    expect(screen.getByText('user.create')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('displays entity information', () => {
    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('user-456')).toBeInTheDocument();
  });

  it('parses and displays user agent information', () => {
    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    // Should parse browser and OS
    expect(screen.getByText('Chrome')).toBeInTheDocument();
    expect(screen.getByText('Windows')).toBeInTheDocument();
  });

  it('displays formatted metadata as JSON', () => {
    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    // Should show metadata section
    expect(screen.getByText('Metadata')).toBeInTheDocument();
    
    // Check for JSON content (formatted)
    const metadataSection = screen.getByText('Metadata').parentElement;
    expect(metadataSection?.textContent).toContain('request_body');
    expect(metadataSection?.textContent).toContain('response');
  });

  it('displays request body when available in metadata', () => {
    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Request Body')).toBeInTheDocument();
    
    // Check for request body content
    const requestSection = screen.getByText('Request Body').parentElement;
    expect(requestSection?.textContent).toContain('newuser@example.com');
    expect(requestSection?.textContent).toContain('user');
  });

  it('displays response when available in metadata', () => {
    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Response')).toBeInTheDocument();
    
    // Check for response content
    const responseSection = screen.getByText('Response').parentElement;
    expect(responseSection?.textContent).toContain('user-456');
    expect(responseSection?.textContent).toContain('created');
  });

  it('does not display request body section when not in metadata', () => {
    const logWithoutRequest: AuditLog = {
      ...mockLog,
      metadata: {},
    };

    render(
      <AuditLogDetailDialog
        log={logWithoutRequest}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.queryByText('Request Body')).not.toBeInTheDocument();
    expect(screen.queryByText('Response')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when dialog is closed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // Find and click the close button (X button)
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles different user agents correctly', () => {
    const firefoxLog: AuditLog = {
      ...mockLog,
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
    };

    render(
      <AuditLogDetailDialog
        log={firefoxLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Firefox')).toBeInTheDocument();
    expect(screen.getByText('macOS')).toBeInTheDocument();
  });

  it('handles failure status correctly', () => {
    const failedLog: AuditLog = {
      ...mockLog,
      status: 'failure',
    };

    render(
      <AuditLogDetailDialog
        log={failedLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('failure')).toBeInTheDocument();
  });

  it('displays full user agent string', () => {
    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText('Full User Agent:')).toBeInTheDocument();
    
    // The full user agent should be visible
    const userAgentSection = screen.getByText('Full User Agent:').parentElement;
    expect(userAgentSection?.textContent).toContain('Mozilla/5.0');
    expect(userAgentSection?.textContent).toContain('Chrome/120.0.0.0');
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AuditLogDetailDialog
        log={mockLog}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // Press Escape to close dialog
    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
