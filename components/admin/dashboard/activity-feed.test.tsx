/**
 * Unit Tests for ActivityFeed Component
 * 
 * Tests the activity feed component for correct rendering and responsive behavior.
 * Validates: Requirements 3.2, 3.5
 * 
 * @module components/admin/dashboard/activity-feed.test
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityFeed } from './activity-feed';
import type { AuditLog } from '@/types/audit';

describe('ActivityFeed Component', () => {
  // Helper to create mock audit logs
  const createMockAuditLog = (overrides?: Partial<AuditLog>): AuditLog => ({
    id: 'test-id',
    action: 'create',
    actor_id: 'actor-123',
    actor_email: 'admin@example.com',
    entity_type: 'user',
    entity_id: 'entity-456',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    status: 'success',
    metadata: {},
    created_at: new Date().toISOString(),
    ...overrides,
  });

  describe('Empty State', () => {
    it('should render empty state when no audit logs provided', () => {
      render(<ActivityFeed auditLogs={[]} />);
      
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });

    it('should render activity icon in empty state', () => {
      const { container } = render(<ActivityFeed auditLogs={[]} />);
      
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Audit Log Display', () => {
    const customLogs: AuditLog[] = [
      createMockAuditLog({
        id: 'test-1',
        action: 'create',
        entity_type: 'user',
        actor_email: 'test@example.com',
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      }),
      createMockAuditLog({
        id: 'test-2',
        action: 'update',
        entity_type: 'server',
        actor_email: 'admin@example.com',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      }),
    ];

    it('should render audit logs when provided', () => {
      render(<ActivityFeed auditLogs={customLogs} />);
      
      // Should render action descriptions
      expect(screen.getByText('Create user')).toBeInTheDocument();
      expect(screen.getByText('Update server')).toBeInTheDocument();
    });

    it('should render relative timestamps', () => {
      render(<ActivityFeed auditLogs={customLogs} />);
      
      // Should show relative times (exact text depends on formatRelativeTime logic)
      const timeElements = screen.getAllByText(/ago|just now/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Activity Types and Icons', () => {
    const activityTypes: AuditLog[] = [
      createMockAuditLog({
        id: '1',
        entity_type: 'user',
        action: 'create',
      }),
      createMockAuditLog({
        id: '2',
        entity_type: 'server',
        action: 'update',
      }),
      createMockAuditLog({
        id: '3',
        entity_type: 'xray_instance',
        action: 'delete',
      }),
      createMockAuditLog({
        id: '4',
        entity_type: 'plan',
        action: 'enable',
      }),
    ];

    it('should render all activity types with correct icons', () => {
      const { container } = render(<ActivityFeed auditLogs={activityTypes} />);
      
      // Each activity should have an icon
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(activityTypes.length);
    });
  });

  describe('Responsive Behavior', () => {
    const testLog: AuditLog[] = [
      createMockAuditLog({
        id: '1',
        action: 'create',
        entity_type: 'user',
        actor_email: 'admin@example.com',
        created_at: new Date(Date.now() - 60 * 1000).toISOString(),
      }),
    ];

    it('should render action description and timestamp information', () => {
      render(<ActivityFeed auditLogs={testLog} />);
      
      // Should render action description
      expect(screen.getByText('Create user')).toBeInTheDocument();
      
      // Should render timestamp
      expect(screen.getByText(/1 minute ago|just now/)).toBeInTheDocument();
    });

    it('should apply min-w-0 for text truncation on small screens', () => {
      const { container } = render(<ActivityFeed auditLogs={testLog} />);
      
      const activityDetails = container.querySelector('.min-w-0');
      expect(activityDetails).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have proper spacing between activities', () => {
      const logs = [
        createMockAuditLog({ id: '1' }),
        createMockAuditLog({ id: '2' }),
      ];
      const { container } = render(<ActivityFeed auditLogs={logs} />);
      
      const feedContainer = container.querySelector('.space-y-4');
      expect(feedContainer).toBeInTheDocument();
    });

    it('should render icon with proper sizing classes', () => {
      const logs = [createMockAuditLog()];
      const { container } = render(<ActivityFeed auditLogs={logs} />);
      
      // Icon containers should have proper sizing
      const iconContainers = container.querySelectorAll('.h-9.w-9, .h-8.w-8, .size-9, .size-8');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should apply shrink-0 to prevent icon compression', () => {
      const logs = [createMockAuditLog()];
      const { container } = render(<ActivityFeed auditLogs={logs} />);
      
      const iconContainers = container.querySelectorAll('.shrink-0');
      expect(iconContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should render activity details in accessible structure', () => {
      const logs = [createMockAuditLog({ 
        actor_email: 'accessible@example.com',
        ip_address: '192.168.1.100',
        action: 'update',
        entity_type: 'server'
      })];
      render(<ActivityFeed auditLogs={logs} />);
      
      // Should have action description visible
      expect(screen.getByText('Update server')).toBeInTheDocument();
      
      // Should have IP address visible
      expect(screen.getByText(/from 192\.168\.1\.100/)).toBeInTheDocument();
      
      // Should have timestamp visible
      expect(screen.getByText(/just now|minutes? ago|hours? ago/)).toBeInTheDocument();
    });

    it('should have proper text sizing for readability', () => {
      const logs = [createMockAuditLog()];
      const { container } = render(<ActivityFeed auditLogs={logs} />);
      
      // Should have text elements with sizing classes
      const textElements = container.querySelectorAll('.text-sm, .text-xs');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});
