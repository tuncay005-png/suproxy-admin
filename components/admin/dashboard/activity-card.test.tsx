/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Activity, Clock, ArrowDownUp, AlertCircle, TrendingUp } from 'lucide-react';
import { vi, describe, it, expect } from 'vitest';
import { ActivityCard, type ActivityStatus } from './activity-card';

/**
 * Unit Tests for ActivityCard Component
 * 
 * Task 14.2: Write unit tests for ActivityCard
 * - Test status variants (success, warning, error, neutral)
 * - Test value formatting
 * - Test status dot rendering
 * 
 * Validates Requirements: 5.1, 5.2, 5.3, 5.10, 11.2, 11.6, 2.7
 */
describe('ActivityCard Component', () => {
  describe('Basic Rendering', () => {
    it('should render card with icon, title, and value', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
        />
      );

      expect(screen.getByText('Xray Status')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('should render numeric values with locale formatting', () => {
      render(
        <ActivityCard
          icon={AlertCircle}
          title="Active Users"
          value={1234}
        />
      );

      expect(screen.getByText('Active Users')).toBeInTheDocument();
      // Use regex to match both comma and period separators (locale-dependent)
      const valueElement = screen.getByText('Active Users')
        .closest('[class*="p-4"]')
        ?.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement?.textContent).toMatch(/1[,.]234/);
    });

    it('should render optional description text', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="System Uptime"
          value="5d 12h 30m"
          description="Last restart: Jan 15"
        />
      );

      expect(screen.getByText('Last restart: Jan 15')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
        />
      );

      const descriptions = screen.queryByText(/Last restart/i);
      expect(descriptions).not.toBeInTheDocument();
    });
  });

  describe('Status Variants - Task 14.2 Requirement 1', () => {
    it('should show status dot when statusDot is true', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: success');
      expect(statusDot).toBeInTheDocument();
    });

    it('should not show status dot when statusDot is false', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={false}
        />
      );

      const statusDot = screen.queryByLabelText('Status: success');
      expect(statusDot).not.toBeInTheDocument();
    });

    it('should not show status dot by default when statusDot is undefined', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
        />
      );

      const statusDot = screen.queryByLabelText('Status: success');
      expect(statusDot).not.toBeInTheDocument();
    });

    describe('Status Variant Colors', () => {
      it.each<{ status: ActivityStatus; expectedClass: string; description: string }>([
        { status: 'success', expectedClass: 'bg-green-500', description: 'green for healthy/running state' },
        { status: 'warning', expectedClass: 'bg-yellow-500', description: 'yellow for degraded performance' },
        { status: 'error', expectedClass: 'bg-red-500', description: 'red for stopped/error state' },
        { status: 'neutral', expectedClass: 'bg-gray-500', description: 'gray for informational state' },
      ])(
        'should apply $expectedClass ($description) for status: $status',
        ({ status, expectedClass }) => {
          render(
            <ActivityCard
              icon={Activity}
              title="Test Card"
              value="Test"
              status={status}
              statusDot={true}
            />
          );

          const statusDot = screen.getByLabelText(`Status: ${status}`);
          expect(statusDot).toHaveClass(expectedClass);
          expect(statusDot).toBeInTheDocument();
        }
      );
    });

    it('should default to neutral status when not specified', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="Uptime"
          value="5d 12h"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: neutral');
      expect(statusDot).toHaveClass('bg-gray-500');
    });

    it('should render success status with green dot for running Xray', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: success');
      expect(statusDot).toHaveClass('bg-green-500');
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('should render error status with red dot for stopped Xray', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Stopped"
          status="error"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: error');
      expect(statusDot).toHaveClass('bg-red-500');
      expect(screen.getByText('Stopped')).toBeInTheDocument();
    });

    it('should render warning status with yellow dot for degraded state', () => {
      render(
        <ActivityCard
          icon={AlertCircle}
          title="System Status"
          value="Degraded"
          status="warning"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: warning');
      expect(statusDot).toHaveClass('bg-yellow-500');
      expect(screen.getByText('Degraded')).toBeInTheDocument();
    });

    it('should render neutral status without status dot for informational cards', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="System Uptime"
          value="5d 12h 30m"
          status="neutral"
        />
      );

      // Should not have status dot when statusDot is false/undefined
      const statusDot = screen.queryByLabelText('Status: neutral');
      expect(statusDot).not.toBeInTheDocument();
    });
  });

  describe('Value Formatting - Task 14.2 Requirement 2', () => {
    it('should format string values as-is', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Status"
          value="Running"
        />
      );

      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('should format simple numeric values with locale formatting', () => {
      render(
        <ActivityCard
          icon={AlertCircle}
          title="Count"
          value={42}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should format large numbers with thousands separator', () => {
      render(
        <ActivityCard
          icon={TrendingUp}
          title="Total Users"
          value={1234567}
        />
      );

      // Match different locale formats: 1,234,567 or 1.234.567
      const valueElement = screen.getByText('Total Users')
        .closest('[class*="p-4"]')
        ?.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement?.textContent).toMatch(/1[,.]234[,.]567/);
    });

    it('should format zero value correctly', () => {
      render(
        <ActivityCard
          icon={AlertCircle}
          title="Errors"
          value={0}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should format negative numbers correctly', () => {
      render(
        <ActivityCard
          icon={TrendingUp}
          title="Balance"
          value={-150}
        />
      );

      const valueElement = screen.getByText('Balance')
        .closest('[class*="p-4"]')
        ?.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement?.textContent).toMatch(/-150/);
    });

    it('should format decimal numbers correctly', () => {
      render(
        <ActivityCard
          icon={TrendingUp}
          title="Ratio"
          value={3.14159}
        />
      );

      // toLocaleString() formats decimals based on locale
      // Some locales round or truncate decimals
      const valueElement = screen.getByText('Ratio')
        .closest('[class*="p-4"]')
        ?.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
      // Check for either full decimal or rounded version
      expect(valueElement?.textContent).toMatch(/3[,.]?14/);
    });

    it('should handle traffic speed string values', () => {
      render(
        <ActivityCard
          icon={ArrowDownUp}
          title="Traffic Speed"
          value="125 MB/s"
        />
      );

      expect(screen.getByText('125 MB/s')).toBeInTheDocument();
    });

    it('should handle uptime format strings', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="System Uptime"
          value="5d 12h 30m"
        />
      );

      expect(screen.getByText('5d 12h 30m')).toBeInTheDocument();
    });

    it('should handle empty string values', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Status"
          value=""
        />
      );

      // Empty string should still render (though not visible)
      const valueElement = screen.getByText('Status')
        .closest('[class*="p-4"]')
        ?.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement?.textContent).toBe('');
    });

    it('should handle complex formatted strings with units', () => {
      render(
        <ActivityCard
          icon={TrendingUp}
          title="Memory Usage"
          value="1.5 GB / 8 GB"
        />
      );

      expect(screen.getByText('1.5 GB / 8 GB')).toBeInTheDocument();
    });

    it('should format very large numbers correctly', () => {
      render(
        <ActivityCard
          icon={TrendingUp}
          title="Requests"
          value={999999999}
        />
      );

      // Should format with appropriate separators
      const valueElement = screen.getByText('Requests')
        .closest('[class*="p-4"]')
        ?.querySelector('.text-2xl');
      expect(valueElement).toBeInTheDocument();
      expect(valueElement?.textContent).toMatch(/999[,.]999[,.]999/);
    });

    it('should display formatted value in aria-label for accessibility', () => {
      render(
        <ActivityCard
          icon={TrendingUp}
          title="Active Users"
          value={1234}
        />
      );

      // Check that formatted value is in aria-label
      const card = screen.getByRole('article');
      const ariaLabel = card.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/1[,.]234/);
    });
  });

  describe('Status Dot Rendering - Task 14.2 Requirement 3', () => {
    it('should render status dot with correct positioning', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: success');
      expect(statusDot).toBeInTheDocument();
      expect(statusDot).toHaveClass('absolute', '-right-0.5', '-top-0.5');
    });

    it('should render status dot with correct size classes', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Test"
          value="Test"
          status="success"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: success');
      expect(statusDot).toHaveClass('h-2.5', 'w-2.5', 'rounded-full');
    });

    it('should render status dot with border styling', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Test"
          value="Test"
          status="success"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: success');
      expect(statusDot).toHaveClass('border-2', 'border-background');
    });

    it('should render status dot for all status variants when enabled', () => {
      const statuses: ActivityStatus[] = ['success', 'warning', 'error', 'neutral'];
      
      statuses.forEach((status) => {
        const { unmount } = render(
          <ActivityCard
            icon={Activity}
            title={`Test ${status}`}
            value="Test"
            status={status}
            statusDot={true}
          />
        );

        const statusDot = screen.getByLabelText(`Status: ${status}`);
        expect(statusDot).toBeInTheDocument();
        expect(statusDot).toHaveClass('rounded-full');
        
        unmount();
      });
    });

    it('should not render status dot when statusDot is explicitly false', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={false}
        />
      );

      expect(screen.queryByLabelText('Status: success')).not.toBeInTheDocument();
    });

    it('should not render any status dot when statusDot is undefined', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="Uptime"
          value="5d 12h"
          status="neutral"
        />
      );

      expect(screen.queryByLabelText(/Status:/)).not.toBeInTheDocument();
    });

    it('should render status dot relative to icon container', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={true}
        />
      );

      const card = screen.getByText('Xray Status').closest('[class*="p-4"]');
      const iconContainer = card?.querySelector('.relative.shrink-0');
      const statusDot = screen.getByLabelText('Status: success');
      
      expect(iconContainer).toBeInTheDocument();
      expect(statusDot.parentElement).toBe(iconContainer);
    });

    it('should maintain status dot visibility with different icon sizes', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Large Status"
          value="Active"
          status="warning"
          statusDot={true}
        />
      );

      const statusDot = screen.getByLabelText('Status: warning');
      expect(statusDot).toBeVisible();
      expect(statusDot).toHaveClass('bg-yellow-500');
    });
  });

  describe('Interactive Behavior', () => {
    it('should call onClick handler when card is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <ActivityCard
          icon={AlertCircle}
          title="System Alerts"
          value={3}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByText('System Alerts').closest('.rounded-xl');
      expect(card).toBeInTheDocument();
      
      if (card) {
        await user.click(card);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should not error when clicked without onClick handler', async () => {
      const user = userEvent.setup();

      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
        />
      );

      const card = screen.getByText('Xray Status').closest('.rounded-xl');
      
      if (card) {
        await expect(user.click(card)).resolves.not.toThrow();
      }
    });

    it('should trigger onClick with keyboard (Enter key)', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <ActivityCard
          icon={AlertCircle}
          title="Clickable"
          value="Test"
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button', { name: /Clickable: Test/i });
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick with keyboard (Space key)', async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <ActivityCard
          icon={AlertCircle}
          title="Clickable"
          value="Test"
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button', { name: /Clickable: Test/i });
      card.focus();
      await user.keyboard(' ');
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling and CSS', () => {
    it('should apply custom className to card', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Test Card"
          value="Test Value"
          className="custom-class"
        />
      );

      const card = screen.getByText('Test Card').closest('.rounded-xl');
      expect(card).toHaveClass('custom-class');
    });

    it('should apply cursor-pointer class when onClick is provided', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Clickable Card"
          value="Click Me"
          onClick={() => {}}
        />
      );

      const card = screen.getByText('Clickable Card').closest('.rounded-xl');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not apply cursor-pointer class when onClick is not provided', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Non-clickable Card"
          value="Static"
        />
      );

      const card = screen.getByText('Non-clickable Card').closest('.rounded-xl');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('should mark icon as aria-hidden', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
        />
      );

      // Icon should be hidden from screen readers
      const card = screen.getByText('Xray Status').closest('[class*="p-4"]');
      const icon = card?.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should provide accessible status label', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={true}
        />
      );

      expect(screen.getByLabelText('Status: success')).toBeInTheDocument();
    });

    it('should have appropriate ARIA role for non-clickable cards', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Test"
          value="Value"
        />
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should have button role for clickable cards', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Clickable"
          value="Click"
          onClick={() => {}}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have aria-label combining title and value', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="System Uptime"
          value="5d 12h"
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'System Uptime: 5d 12h');
    });

    it('should include description in aria-label when provided', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="Uptime"
          value="5d"
          description="Last restart: Jan 15"
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Uptime: 5d. Last restart: Jan 15');
    });

    it('should use custom aria-label when provided', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Test"
          value="Value"
          ariaLabel="Custom accessible description"
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Custom accessible description');
    });
  });

  describe('Real-world Usage Examples', () => {
    it('should render Xray status card with success indicator', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Running"
          status="success"
          statusDot={true}
        />
      );

      expect(screen.getByText('Xray Status')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: success')).toBeInTheDocument();
    });

    it('should render system uptime card', () => {
      render(
        <ActivityCard
          icon={Clock}
          title="System Uptime"
          value="5d 12h 30m"
          description="Last restart: Jan 15"
        />
      );

      expect(screen.getByText('System Uptime')).toBeInTheDocument();
      expect(screen.getByText('5d 12h 30m')).toBeInTheDocument();
      expect(screen.getByText('Last restart: Jan 15')).toBeInTheDocument();
    });

    it('should render traffic speed card', () => {
      render(
        <ActivityCard
          icon={ArrowDownUp}
          title="Traffic Speed"
          value="125 MB/s"
          description="Download: 85 MB/s | Upload: 40 MB/s"
          status="neutral"
        />
      );

      expect(screen.getByText('Traffic Speed')).toBeInTheDocument();
      expect(screen.getByText('125 MB/s')).toBeInTheDocument();
      expect(screen.getByText('Download: 85 MB/s | Upload: 40 MB/s')).toBeInTheDocument();
    });

    it('should render Xray stopped state with error indicator', () => {
      render(
        <ActivityCard
          icon={Activity}
          title="Xray Status"
          value="Stopped"
          status="error"
          statusDot={true}
        />
      );

      expect(screen.getByText('Xray Status')).toBeInTheDocument();
      expect(screen.getByText('Stopped')).toBeInTheDocument();
      const statusDot = screen.getByLabelText('Status: error');
      expect(statusDot).toHaveClass('bg-red-500');
    });
  });
});
