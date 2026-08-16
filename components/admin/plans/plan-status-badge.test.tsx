/**
 * Tests for Plan Status Badge Component
 * 
 * Validates that the plan status badge displays correct status indicators.
 * 
 * @module components/admin/plans/plan-status-badge.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanStatusBadge } from './plan-status-badge';

describe('PlanStatusBadge', () => {
  it('should render "Active" badge when active is true', () => {
    render(<PlanStatusBadge active={true} />);
    
    const badge = screen.getByText('Active');
    expect(badge).toBeDefined();
    expect(badge.className).toContain('bg-green-500');
  });

  it('should render "Inactive" badge when active is false', () => {
    render(<PlanStatusBadge active={false} />);
    
    const badge = screen.getByText('Inactive');
    expect(badge).toBeDefined();
  });
});
