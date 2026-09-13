/**
 * Tests for ActivityCardSkeleton Component
 * 
 * @module components/admin/dashboard/activity-card-skeleton.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityCardSkeleton } from './activity-card-skeleton';

describe('ActivityCardSkeleton', () => {
  it('renders successfully', () => {
    render(<ActivityCardSkeleton />);
    
    // Should have loading announcement
    expect(screen.getByText('Loading activity data...')).toBeInTheDocument();
  });

  it('renders without status dot by default', () => {
    const { container } = render(<ActivityCardSkeleton />);
    
    // Count skeleton elements - should not have status dot skeleton
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders with status dot when enabled', () => {
    const { container } = render(<ActivityCardSkeleton showStatusDot={true} />);
    
    // Should have status dot skeleton (absolute positioned, rounded-full)
    const statusDot = container.querySelector('.absolute.-right-0\\.5.-top-0\\.5');
    expect(statusDot).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ActivityCardSkeleton className="custom-activity-skeleton" />
    );
    
    expect(container.firstChild).toHaveClass('custom-activity-skeleton');
  });

  it('has proper ARIA attributes', () => {
    render(<ActivityCardSkeleton />);
    
    // Should have role="status" and aria-live
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('displays skeleton elements matching ActivityCard structure', () => {
    const { container } = render(<ActivityCardSkeleton />);
    
    // Should have skeletons for: icon, title, value, description
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it('has screen reader announcement', () => {
    render(<ActivityCardSkeleton />);
    
    const srOnly = screen.getByText('Loading activity data...');
    expect(srOnly).toHaveClass('sr-only');
  });

  it('matches ActivityCard layout structure', () => {
    const { container } = render(<ActivityCardSkeleton />);
    
    // Should have the same padding and flex layout
    const content = container.querySelector('[class*="p-4"]');
    expect(content).toBeInTheDocument();
    
    const flexContainer = container.querySelector('[class*="flex"]');
    expect(flexContainer).toBeInTheDocument();
  });

  it('renders in grid layouts correctly', () => {
    const { container } = render(
      <div className="grid grid-cols-3 gap-4">
        <ActivityCardSkeleton />
        <ActivityCardSkeleton showStatusDot={true} />
        <ActivityCardSkeleton />
      </div>
    );
    
    const grid = container.querySelector('.grid');
    expect(grid?.children).toHaveLength(3);
  });
});
