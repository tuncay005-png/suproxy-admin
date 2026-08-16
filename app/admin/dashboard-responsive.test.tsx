/**
 * Responsive Layout Tests for Dashboard
 * 
 * Tests that the dashboard components render correctly across different screen sizes.
 * Validates: Requirements 3.5, 7.6, 15.3 (Task 17.3)
 * 
 * @module app/admin/dashboard-responsive.test
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './page';

// Mock API endpoints
vi.mock('@/lib/api/endpoints', () => ({
  systemApi: {
    getStats: vi.fn(),
    getHealth: vi.fn(),
  },
  serversApi: {
    list: vi.fn(),
  },
  plansApi: {
    list: vi.fn(),
  },
  auditApi: {
    getLogs: vi.fn(),
  },
}));

// Import mocked modules
import { systemApi, serversApi, plansApi, auditApi } from '@/lib/api/endpoints';

describe('Dashboard Responsive Layout', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock responses
    (systemApi.getStats as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        total_users: 150,
        active_users: 75,
        total_xray_instances: 10,
        active_xray_instances: 8,
      },
    });
    
    (systemApi.getHealth as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        status: 'healthy',
        uptime: 3600,
      },
    });
    
    (serversApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        servers: [
          { id: '1', name: 'Server 1', status: 'online' },
          { id: '2', name: 'Server 2', status: 'offline' },
        ],
      },
    });
    
    (plansApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        plans: [
          { id: '1', name: 'Basic', active: true },
          { id: '2', name: 'Pro', active: true },
          { id: '3', name: 'Enterprise', active: false },
        ],
      },
    });
    
    (auditApi.getLogs as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        logs: [],
        total: 25,
      },
    });
  });

  describe('Stat Cards Grid Layout', () => {
    it('should apply responsive grid classes for 1 col mobile, 2 small, 3 tablet, 5 desktop (Task 17.3)', async () => {
      render(await DashboardPage());
      
      // Find the stat cards section
      const statSection = screen.getByLabelText('Statistics');
      
      // Check for responsive grid classes (Task 17.3 updated to 5-column layout)
      expect(statSection).toHaveClass('grid');
      expect(statSection).toHaveClass('grid-cols-1'); // Mobile: 1 column
      expect(statSection).toHaveClass('sm:grid-cols-2'); // Small: 2 columns
      expect(statSection).toHaveClass('md:grid-cols-3'); // Tablet: 3 columns
      expect(statSection).toHaveClass('lg:grid-cols-5'); // Desktop: 5 columns (Task 17.3)
      expect(statSection).toHaveClass('gap-3'); // Mobile gap
      expect(statSection).toHaveClass('md:gap-4'); // Desktop gap
    });

    it('should render all 5 stat cards (Task 17.3)', async () => {
      render(await DashboardPage());
      
      // Verify all 5 stat cards are rendered (Task 17.3 added 5th card)
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Xray Instances')).toBeInTheDocument();
      expect(screen.getByText('Servers')).toBeInTheDocument();
      expect(screen.getByText('Plans')).toBeInTheDocument();
      expect(screen.getByText('Recent Actions')).toBeInTheDocument();
    });
  });

  describe('Activity and Actions Section Layout', () => {
    it('should apply responsive grid for activity feed and quick actions', async () => {
      render(await DashboardPage());
      
      // Find the activity section
      const activitySection = screen.getByLabelText('Activity and Actions');
      
      // Check for responsive grid classes
      expect(activitySection).toHaveClass('grid');
      expect(activitySection).toHaveClass('gap-3'); // Mobile gap
      expect(activitySection).toHaveClass('md:grid-cols-2'); // Tablet: 2 columns
      expect(activitySection).toHaveClass('md:gap-4'); // Desktop gap
      expect(activitySection).toHaveClass('lg:grid-cols-7'); // Desktop: 7-column layout
    });

    it('should render recent activity card with correct column span', async () => {
      render(await DashboardPage());
      
      const activityCard = screen.getByText('Recent Activity').closest('.col-span-full');
      expect(activityCard).toBeInTheDocument();
      expect(activityCard).toHaveClass('lg:col-span-4'); // Takes 4 of 7 columns on desktop
    });

    it('should render quick actions card with correct column span', async () => {
      render(await DashboardPage());
      
      const quickActionsCard = screen.getByText('Quick Actions').closest('.col-span-full');
      expect(quickActionsCard).toBeInTheDocument();
      expect(quickActionsCard).toHaveClass('lg:col-span-3'); // Takes 3 of 7 columns on desktop
    });
  });

  describe('Content Rendering on All Screen Sizes', () => {
    it('should render page header', async () => {
      render(await DashboardPage());
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Welcome to the admin dashboard/)).toBeInTheDocument();
    });

    it('should render activity feed component', async () => {
      render(await DashboardPage());
      
      // Activity feed should be present
      const activityCard = screen.getByText('Recent Activity');
      expect(activityCard).toBeInTheDocument();
    });

    it('should render quick actions component', async () => {
      render(await DashboardPage());
      
      // Quick actions should be present
      const quickActionsCard = screen.getByText('Quick Actions');
      expect(quickActionsCard).toBeInTheDocument();
    });
  });

  describe('Responsive Container Classes', () => {
    it('should have proper spacing classes (responsive)', async () => {
      const { container } = render(await DashboardPage());
      
      // Main container should have responsive spacing (Task 17.3)
      const mainContainer = container.querySelector('.space-y-4');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('md:space-y-6');
    });

    it('should have accessible section labels', async () => {
      render(await DashboardPage());
      
      expect(screen.getByLabelText('Statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Activity and Actions')).toBeInTheDocument();
    });
  });
});
