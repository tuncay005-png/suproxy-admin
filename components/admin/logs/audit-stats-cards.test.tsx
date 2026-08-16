/**
 * Tests for AuditStatsCards Component
 * 
 * Validates that the component correctly fetches and displays
 * audit statistics with proper loading and error states.
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditStatsCards } from './audit-stats-cards';
import { auditApi } from '@/lib/api/endpoints/audit';
import type { AuditStats } from '@/types/audit';

// Mock the audit API
vi.mock('@/lib/api/endpoints/audit', () => ({
  auditApi: {
    getStats: vi.fn(),
  },
}));

const mockAuditApi = auditApi as any;

describe('AuditStatsCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeletons while fetching data', () => {
      // Mock API call that never resolves
      mockAuditApi.getStats.mockImplementation(
        () => new Promise(() => {}) as any
      );

      render(<AuditStatsCards />);

      // Check for loading state
      const section = screen.getByRole('region', { name: /audit statistics/i });
      expect(section).toHaveAttribute('aria-busy', 'true');
      
      // Should have 4 skeleton cards
      const skeletons = section.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(4);
    });
  });

  describe('Success State', () => {
    const mockStats: AuditStats = {
      total_actions: 1250,
      recent_activity_count: 45,
      actions_by_type: {
        'user.create': 320,
        'user.update': 180,
        'user.delete': 50,
        'session.revoke': 120,
        'plan.create': 30,
      },
    };

    beforeEach(() => {
      mockAuditApi.getStats.mockResolvedValue({
        data: mockStats,
        success: true,
      } as any);
    });

    it('should display total actions stat card', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('Total Actions')).toBeInTheDocument();
      });

      // Check for formatted number (may use locale-specific separator)
      expect(screen.getByText(/1[,.]250/)).toBeInTheDocument();
      expect(screen.getByText('All recorded actions')).toBeInTheDocument();
    });

    it('should display recent activity stat card', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Actions in last 24h')).toBeInTheDocument();
    });

    it('should display top 2 action types as stat cards', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('User Create')).toBeInTheDocument();
      });

      // Top action: user.create (320)
      expect(screen.getByText('User Create')).toBeInTheDocument();
      expect(screen.getByText('320')).toBeInTheDocument();
      expect(screen.getByText('25.6% of total')).toBeInTheDocument();

      // Second action: user.update (180)
      expect(screen.getByText('User Update')).toBeInTheDocument();
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('14.4% of total')).toBeInTheDocument();
    });

    it('should format action names correctly', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('User Create')).toBeInTheDocument();
      });

      // Should capitalize and add space
      expect(screen.getByText('User Create')).toBeInTheDocument();
      expect(screen.getByText('User Update')).toBeInTheDocument();
    });

    it('should calculate percentages correctly', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('25.6% of total')).toBeInTheDocument();
      });

      // 320/1250 = 25.6%
      expect(screen.getByText('25.6% of total')).toBeInTheDocument();
      // 180/1250 = 14.4%
      expect(screen.getByText('14.4% of total')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockAuditApi.getStats.mockRejectedValue(new Error('API Error'));
    });

    it('should display error message when fetch fails', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load audit statistics')
        ).toBeInTheDocument();
      });
    });

    it('should display retry button on error', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('should retry fetching stats when retry button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<AuditStatsCards />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      expect(mockAuditApi.getStats).toHaveBeenCalledTimes(1);

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Should call API again
      await waitFor(() => {
        expect(mockAuditApi.getStats).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty actions_by_type', async () => {
      mockAuditApi.getStats.mockResolvedValue({
        data: {
          total_actions: 100,
          recent_activity_count: 10,
          actions_by_type: {},
        },
        success: true,
      } as any);

      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('Total Actions')).toBeInTheDocument();
      });

      // Should show placeholder for action types
      expect(screen.getByText('Action Types')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Unique action types')).toBeInTheDocument();
    });

    it('should handle single action type', async () => {
      mockAuditApi.getStats.mockResolvedValue({
        data: {
          total_actions: 50,
          recent_activity_count: 5,
          actions_by_type: {
            'user.create': 50,
          },
        },
        success: true,
      } as any);

      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('User Create')).toBeInTheDocument();
      });

      // Should show one action type and placeholder
      expect(screen.getByText('User Create')).toBeInTheDocument();
      
      // Get all cards with "50" - should be 2 (Total Actions and User Create)
      const fiftyElements = screen.getAllByText('50');
      expect(fiftyElements).toHaveLength(2);
      
      expect(screen.getByText('100.0% of total')).toBeInTheDocument();

      // Should show action types count as second card
      expect(screen.getByText('Action Types')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should handle zero stats', async () => {
      mockAuditApi.getStats.mockResolvedValue({
        data: {
          total_actions: 0,
          recent_activity_count: 0,
          actions_by_type: {},
        },
        success: true,
      } as any);

      render(<AuditStatsCards />);

      await waitFor(() => {
        expect(screen.getByText('Total Actions')).toBeInTheDocument();
      });

      // Should have multiple cards with "0" value
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    const mockStats: AuditStats = {
      total_actions: 100,
      recent_activity_count: 10,
      actions_by_type: {
        'user.create': 60,
        'user.update': 40,
      },
    };

    beforeEach(() => {
      mockAuditApi.getStats.mockResolvedValue({
        data: mockStats,
        success: true,
      } as any);
    });

    it('should have proper ARIA labels', async () => {
      render(<AuditStatsCards />);

      await waitFor(() => {
        const section = screen.getByRole('region', { name: /audit statistics/i });
        expect(section).toBeInTheDocument();
      });
    });

    it('should indicate loading state with aria-busy', () => {
      mockAuditApi.getStats.mockImplementation(
        () => new Promise(() => {}) as any
      );

      render(<AuditStatsCards />);

      const section = screen.getByRole('region', { name: /audit statistics/i });
      expect(section).toHaveAttribute('aria-busy', 'true');
    });
  });
});
