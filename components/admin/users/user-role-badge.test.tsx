/**
 * User Role Badge Component Tests
 * 
 * Tests visual role indicators for user accounts.
 * Validates proper rendering of admin and user role badges.
 */

import { render, screen } from '@testing-library/react';
import { UserRoleBadge } from './user-role-badge';

describe('UserRoleBadge', () => {
  describe('Admin Role', () => {
    it('renders admin badge with correct label', () => {
      render(<UserRoleBadge role="admin" />);
      
      const badge = screen.getByText('Admin');
      expect(badge).toBeInTheDocument();
    });

    it('applies blue styling for admin role', () => {
      const { container } = render(<UserRoleBadge role="admin" />);
      
      const badge = screen.getByText('Admin').closest('div');
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass('text-blue-800');
    });

    it('displays shield icon for admin', () => {
      const { container } = render(<UserRoleBadge role="admin" />);
      
      // Check that an SVG icon is present (shield icon)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('User Role', () => {
    it('renders user badge with correct label', () => {
      render(<UserRoleBadge role="user" />);
      
      const badge = screen.getByText('User');
      expect(badge).toBeInTheDocument();
    });

    it('applies gray styling for user role', () => {
      const { container } = render(<UserRoleBadge role="user" />);
      
      const badge = screen.getByText('User').closest('div');
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-700');
    });

    it('displays user icon for user role', () => {
      const { container } = render(<UserRoleBadge role="user" />);
      
      // Check that an SVG icon is present (user icon)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies additional className when provided', () => {
      const { container } = render(
        <UserRoleBadge role="admin" className="ml-2" />
      );
      
      const badge = screen.getByText('Admin').closest('div');
      expect(badge).toHaveClass('ml-2');
    });
  });

  describe('Accessibility', () => {
    it('includes icon for visual context', () => {
      const { container } = render(<UserRoleBadge role="admin" />);
      
      // Check that an SVG icon is present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders as inline element', () => {
      const { container } = render(<UserRoleBadge role="user" />);
      
      const badge = screen.getByText('User').closest('div');
      expect(badge).toHaveClass('inline-flex');
    });

    it('displays capitalized role text', () => {
      render(<UserRoleBadge role="admin" />);
      
      const text = screen.getByText('Admin');
      expect(text).toBeInTheDocument();
      expect(text.tagName.toLowerCase()).toBe('span');
    });
  });
});
