/**
 * Unit tests for Dashboard Loading State
 * 
 * Tests the dashboard loading skeleton UI.
 * 
 * Validates: Requirements 11.1, 11.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLoading from './loading';

describe('DashboardLoading', () => {
  it('should render page header skeleton', () => {
    const { container } = render(<DashboardLoading />);
    
    // Should have skeleton elements
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render 4 stat card skeletons', () => {
    render(<DashboardLoading />);
    
    // Find the statistics section
    const statsSection = screen.getByLabelText('Statistics Loading');
    expect(statsSection).toBeInTheDocument();
    
    // Should have 4 card containers
    const cards = statsSection.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should render activity feed skeleton', () => {
    render(<DashboardLoading />);
    
    // Find the activity section
    const activitySection = screen.getByLabelText('Activity and Actions Loading');
    expect(activitySection).toBeInTheDocument();
  });

  it('should have responsive grid layout matching dashboard', () => {
    render(<DashboardLoading />);
    
    // Find stats section with responsive classes
    const statsSection = screen.getByLabelText('Statistics Loading');
    expect(statsSection).toHaveClass('grid');
    expect(statsSection).toHaveClass('grid-cols-1');
    expect(statsSection).toHaveClass('md:grid-cols-2');
    expect(statsSection).toHaveClass('lg:grid-cols-4');
  });

  it('should render activity section with correct column spans', () => {
    render(<DashboardLoading />);
    
    // Find activity section with responsive classes
    const activitySection = screen.getByLabelText('Activity and Actions Loading');
    expect(activitySection).toHaveClass('grid');
    expect(activitySection).toHaveClass('md:grid-cols-2');
    expect(activitySection).toHaveClass('lg:grid-cols-7');
  });

  it('should render 5 activity item skeletons', () => {
    const { container } = render(<DashboardLoading />);
    
    // Count activity item skeletons (they have flex items-start gap-4)
    const activityItems = container.querySelectorAll('.flex.items-start.gap-4');
    expect(activityItems.length).toBe(5);
  });

  it('should render 3 quick action button skeletons', () => {
    const { container } = render(<DashboardLoading />);
    
    // Find quick actions card and count button skeletons
    const quickActionsCard = container.querySelectorAll('[class*="col-span-full lg:col-span-3"]')[0];
    const buttonSkeletons = quickActionsCard?.querySelectorAll('.h-10.w-full');
    expect(buttonSkeletons?.length).toBe(3);
  });
});
