/**
 * Tests for StatCardSkeleton Component
 * 
 * @module components/admin/dashboard/stat-card-skeleton.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCardSkeleton } from './stat-card-skeleton';

describe('StatCardSkeleton', () => {
  it('renders successfully', () => {
    render(<StatCardSkeleton />);
    
    // Should have loading announcement
    expect(screen.getByText('Loading statistic...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatCardSkeleton className="custom-skeleton" />
    );
    
    // Card should have the custom class
    const card = container.querySelector('[class*="custom-skeleton"]');
    expect(card).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<StatCardSkeleton />);
    
    // Should have role="status" and aria-live
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('displays skeleton elements matching StatCard structure', () => {
    const { container } = render(<StatCardSkeleton />);
    
    // Should have multiple skeleton elements (title, icon, value, description)
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(4); // title, icon, value, description
  });

  it('has screen reader announcement', () => {
    render(<StatCardSkeleton />);
    
    const srOnly = screen.getByText('Loading statistic...');
    expect(srOnly).toHaveClass('sr-only');
  });

  it('matches StatCard layout structure', () => {
    const { container } = render(<StatCardSkeleton />);
    
    // Should have CardHeader and CardContent
    expect(container.querySelector('[class*="pb-2"]')).toBeInTheDocument(); // CardHeader
    expect(container.querySelector('[class*="space-y-1"]')).toBeInTheDocument(); // CardContent
  });

  it('renders in grid layouts correctly', () => {
    const { container } = render(
      <div className="grid grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid?.children).toHaveLength(3);
  });
});
