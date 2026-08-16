/**
 * User Status Badge Component Tests
 * 
 * Tests visual status indicators for user accounts.
 * Validates proper rendering of active, inactive, and suspended badges.
 */

import { render, screen } from '@testing-library/react';
import { UserStatusBadge } from './user-status-badge';

describe('UserStatusBadge', () => {
  describe('Active Status', () => {
    it('renders active badge with correct label', () => {
      render(<UserStatusBadge status="active" />);
      
      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
    });

    it('applies green styling for active status', () => {
      const { container } = render(<UserStatusBadge status="active" />);
      
      const badge = screen.getByText('Active').closest('div');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });
  });

  describe('Inactive Status', () => {
    it('renders inactive badge with correct label', () => {
      render(<UserStatusBadge status="inactive" />);
      
      const badge = screen.getByText('Inactive');
      expect(badge).toBeInTheDocument();
    });

    it('applies gray styling for inactive status', () => {
      const { container } = render(<UserStatusBadge status="inactive" />);
      
      const badge = screen.getByText('Inactive').closest('div');
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-800');
    });
  });

  describe('Suspended Status', () => {
    it('renders suspended badge with correct label', () => {
      render(<UserStatusBadge status="suspended" />);
      
      const badge = screen.getByText('Suspended');
      expect(badge).toBeInTheDocument();
    });

    it('applies red styling for suspended status', () => {
      const { container } = render(<UserStatusBadge status="suspended" />);
      
      const badge = screen.getByText('Suspended').closest('div');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });
  });

  describe('Custom Styling', () => {
    it('applies additional className when provided', () => {
      const { container } = render(
        <UserStatusBadge status="active" className="custom-class" />
      );
      
      const badge = screen.getByText('Active').closest('div');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('includes icon for visual context', () => {
      const { container } = render(<UserStatusBadge status="active" />);
      
      // Check that an SVG icon is present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders as inline element', () => {
      const { container } = render(<UserStatusBadge status="active" />);
      
      const badge = screen.getByText('Active').closest('div');
      expect(badge).toHaveClass('inline-flex');
    });
  });
});
