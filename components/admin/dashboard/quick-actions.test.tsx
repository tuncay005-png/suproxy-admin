/**
 * Unit Tests for QuickActions Component
 * 
 * Tests the quick actions component for correct rendering and responsive behavior.
 * Validates: Requirements 3.3, 3.5
 * 
 * @module components/admin/dashboard/quick-actions.test
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuickActions } from './quick-actions';

describe('QuickActions Component', () => {
  describe('Basic Rendering', () => {
    it('should render create user action button', () => {
      render(<QuickActions />);
      
      const createUserButton = screen.getByRole('link', { name: /create user/i });
      expect(createUserButton).toBeInTheDocument();
    });

    it('should have correct link href for create user', () => {
      render(<QuickActions />);
      
      const createUserButton = screen.getByRole('link', { name: /create user/i });
      expect(createUserButton).toHaveAttribute('href', '/admin/users/new');
    });

    it('should render user plus icon', () => {
      const { container } = render(<QuickActions />);
      
      // Should have an icon (UserPlus from lucide-react)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Styling', () => {
    it('should apply space-y-2 for vertical spacing', () => {
      const { container } = render(<QuickActions />);
      
      const quickActionsContainer = container.firstChild;
      expect(quickActionsContainer).toHaveClass('space-y-2');
    });

    it('should render buttons with full width', () => {
      render(<QuickActions />);
      
      const createUserButton = screen.getByRole('link', { name: /create user/i });
      expect(createUserButton).toHaveClass('w-full');
      expect(createUserButton).toHaveClass('justify-start');
    });

    it('should use outline variant for buttons', () => {
      render(<QuickActions />);
      
      const createUserButton = screen.getByRole('link', { name: /create user/i });
      // Button should have specific variant styling (from shadcn/ui)
      expect(createUserButton.className).toContain('outline');
    });
  });

  describe('Custom ClassName', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<QuickActions className="custom-test-class" />);
      
      const quickActionsContainer = container.firstChild;
      expect(quickActionsContainer).toHaveClass('custom-test-class');
      expect(quickActionsContainer).toHaveClass('space-y-2'); // Should also retain default classes
    });
  });

  describe('Accessibility', () => {
    it('should have accessible link structure', () => {
      render(<QuickActions />);
      
      const createUserButton = screen.getByRole('link', { name: /create user/i });
      expect(createUserButton).toBeInTheDocument();
      expect(createUserButton).toHaveAccessibleName();
    });

    it('should have visible button text', () => {
      render(<QuickActions />);
      
      expect(screen.getByText('Create User')).toBeVisible();
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain consistent button width across screen sizes', () => {
      render(<QuickActions />);
      
      const createUserButton = screen.getByRole('link', { name: /create user/i });
      // w-full ensures button takes full width on all screen sizes
      expect(createUserButton).toHaveClass('w-full');
    });

    it('should have proper icon spacing', () => {
      const { container } = render(<QuickActions />);
      
      // Icon should have margin-right (mr-2)
      const icons = container.querySelectorAll('.mr-2');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Future Extensibility', () => {
    it('should render in a structure that supports additional actions', () => {
      const { container } = render(<QuickActions />);
      
      // Container should have space-y-2 which works for multiple children
      const quickActionsContainer = container.firstChild;
      expect(quickActionsContainer).toHaveClass('space-y-2');
    });
  });
});
