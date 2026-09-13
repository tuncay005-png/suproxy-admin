/**
 * Tests for CircularProgressChartSkeleton Component
 * 
 * @module components/admin/dashboard/circular-progress-chart-skeleton.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularProgressChartSkeleton } from './circular-progress-chart-skeleton';

describe('CircularProgressChartSkeleton', () => {
  it('renders with default size', () => {
    render(<CircularProgressChartSkeleton />);
    
    // Should have loading announcement
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { container } = render(<CircularProgressChartSkeleton size={160} />);
    
    // Find the circular skeleton container
    const circleContainer = container.querySelector('[style*="width: 160px"]');
    expect(circleContainer).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<CircularProgressChartSkeleton />);
    
    // Should have role="status" for loading state
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
    expect(statusElement).toHaveAttribute('aria-label', 'Loading chart data');
  });

  it('applies custom className', () => {
    const { container } = render(
      <CircularProgressChartSkeleton className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays skeleton elements in correct structure', () => {
    const { container } = render(<CircularProgressChartSkeleton />);
    
    // Should have multiple skeleton elements (outer circle, inner circle, text, label)
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('maintains aspect ratio with different sizes', () => {
    const sizes = [100, 120, 140, 160];
    
    sizes.forEach(size => {
      const { container } = render(<CircularProgressChartSkeleton size={size} />);
      const circleContainer = container.querySelector(`[style*="width: ${size}px"]`);
      expect(circleContainer).toBeInTheDocument();
    });
  });

  it('has screen reader announcement', () => {
    render(<CircularProgressChartSkeleton />);
    
    const srOnly = screen.getByText('Loading chart data...');
    expect(srOnly).toHaveClass('sr-only');
  });
});
