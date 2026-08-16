/**
 * Unit tests for StatCard component
 * 
 * Tests the reusable stat card component for displaying key metrics.
 * 
 * @module components/admin/dashboard/stat-card.test
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Users, Server } from 'lucide-react';
import { StatCard } from './stat-card';

describe('StatCard Component', () => {
  describe('Basic Rendering', () => {
    it('should render title and value', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      // Locale formatting may vary (e.g., "1,234" or "1.234")
      expect(screen.getByText(/1[.,]234/)).toBeInTheDocument();
    });

    it('should render string value as-is', () => {
      render(
        <StatCard
          title="System Status"
          value="Healthy"
        />
      );

      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('Healthy')).toBeInTheDocument();
    });

    it('should render numeric value with locale formatting', () => {
      render(
        <StatCard
          title="Active Sessions"
          value={1000000}
        />
      );

      // Locale formatting may vary (e.g., "1,000,000" or "1.000.000")
      expect(screen.getByText(/1[.,]000[.,]000/)).toBeInTheDocument();
    });
  });

  describe('Optional Props', () => {
    it('should render description when provided', () => {
      render(
        <StatCard
          title="Total Users"
          value={100}
          description="Registered users"
        />
      );

      expect(screen.getByText('Registered users')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      const { container } = render(
        <StatCard
          title="Total Users"
          value={100}
          icon={Users}
        />
      );

      // Icon should be in the document (rendered by lucide-react)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <StatCard
          title="Total Users"
          value={100}
          className="custom-class"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Trend Indicator', () => {
    it('should render upward trend with correct styling', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
          trend={{ direction: 'up', value: 12.5 }}
        />
      );

      expect(screen.getByText('12.5%')).toBeInTheDocument();
      expect(screen.getByLabelText('Trend up 12.5%')).toBeInTheDocument();
    });

    it('should render downward trend with correct styling', () => {
      render(
        <StatCard
          title="Error Rate"
          value={5}
          trend={{ direction: 'down', value: 3.2 }}
        />
      );

      expect(screen.getByText('3.2%')).toBeInTheDocument();
      expect(screen.getByLabelText('Trend down 3.2%')).toBeInTheDocument();
    });

    it('should render trend label when provided', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
          trend={{ direction: 'up', value: 12.5, label: 'from last month' }}
        />
      );

      expect(screen.getByText('from last month')).toBeInTheDocument();
    });

    it('should render both trend and description when both provided', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
          description="Registered users"
          trend={{ direction: 'up', value: 12.5 }}
        />
      );

      expect(screen.getByText('Registered users')).toBeInTheDocument();
      expect(screen.getByText('12.5%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible structure', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
          icon={Users}
        />
      );

      // Title should be visible and accessible
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      // Value should be visible
      expect(screen.getByText(/1[.,]234/)).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(
        <StatCard
          title="Total Users"
          value={1234}
          icon={Server}
        />
      );

      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have aria-label on trend indicator', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
          trend={{ direction: 'up', value: 12.5 }}
        />
      );

      expect(screen.getByLabelText('Trend up 12.5%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      render(
        <StatCard
          title="Errors"
          value={0}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative value', () => {
      render(
        <StatCard
          title="Balance"
          value={-500}
        />
      );

      expect(screen.getByText('-500')).toBeInTheDocument();
    });

    it('should handle empty string value', () => {
      render(
        <StatCard
          title="Status"
          value=""
        />
      );

      // Component should render but value might be empty
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should handle trend with zero value', () => {
      render(
        <StatCard
          title="Total Users"
          value={1234}
          trend={{ direction: 'up', value: 0 }}
        />
      );

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Clickable Link Functionality', () => {
    it('should render as clickable link when href is provided', () => {
      render(
        <StatCard
          title="Active Servers"
          value={42}
          description="View all servers"
          icon={Server}
          href="/admin/servers"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/admin/servers');
      expect(link).toHaveClass('transition-transform', 'hover:scale-105');
    });

    it('should not render as link when href is not provided', () => {
      const { container } = render(
        <StatCard
          title="Active Servers"
          value={42}
          description="View all servers"
          icon={Server}
        />
      );

      const links = container.querySelectorAll('a');
      expect(links.length).toBe(0);
    });

    it('should apply hover styles when href is provided', () => {
      const { container } = render(
        <StatCard
          title="Active Servers"
          value={42}
          href="/admin/servers"
        />
      );

      const link = container.querySelector('a');
      expect(link).toHaveClass('hover:scale-105');
      
      const card = link?.querySelector('[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
    });

    it('should render content correctly inside clickable link', () => {
      render(
        <StatCard
          title="Active Servers"
          value={42}
          description="View all servers"
          href="/admin/servers"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Active Servers');
      expect(link).toHaveTextContent('42');
      expect(link).toHaveTextContent('View all servers');
    });
  });
});
