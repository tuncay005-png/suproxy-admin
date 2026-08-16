/**
 * Tests for Plans Table Component
 * 
 * Validates that the plans table renders correctly with various data scenarios.
 * 
 * @module components/admin/plans/plans-table.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlansTable } from './plans-table';
import type { Plan } from '@/types/plan';

// Mock PlanStatusBadge component
vi.mock('./plan-status-badge', () => ({
  PlanStatusBadge: ({ active }: { active: boolean }) => (
    <span data-testid="plan-status-badge">{active ? 'Active' : 'Inactive'}</span>
  ),
}));

describe('PlansTable', () => {
  const mockPlans: Plan[] = [
    {
      id: '1',
      name: 'Basic Plan',
      description: 'Basic subscription',
      price: 9.99,
      currency: 'USD',
      duration_days: 30,
      data_limit_gb: 10,
      active: true,
      active_subscriptions: 5,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Premium Plan',
      description: 'Premium subscription',
      price: 29.99,
      currency: 'EUR',
      duration_days: 365,
      data_limit_gb: 1000,
      active: false,
      active_subscriptions: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  it('should render table with plans data', () => {
    render(<PlansTable plans={mockPlans} />);

    // Check table headers
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Price')).toBeDefined();
    expect(screen.getByText('Duration')).toBeDefined();
    expect(screen.getByText('Data Limit')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();

    // Check plan data
    expect(screen.getByText('Basic Plan')).toBeDefined();
    expect(screen.getByText('Premium Plan')).toBeDefined();
    expect(screen.getByText('$9.99')).toBeDefined();
    expect(screen.getByText('€29.99')).toBeDefined();
    expect(screen.getByText('1 month')).toBeDefined();
    expect(screen.getByText('1 year')).toBeDefined();
    expect(screen.getByText('10 GB')).toBeDefined();
    expect(screen.getByText('1 TB')).toBeDefined();

    // Check status badges
    const statusBadges = screen.getAllByTestId('plan-status-badge');
    expect(statusBadges.length).toBe(2);
    expect(statusBadges[0].textContent).toBe('Active');
    expect(statusBadges[1].textContent).toBe('Inactive');

    // Check active subscriptions
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
  });

  it('should render empty state when no plans', () => {
    render(<PlansTable plans={[]} />);

    expect(screen.getByText('No plans found')).toBeDefined();
    expect(screen.getByText('No subscription plans configured yet')).toBeDefined();
  });

  it('should format price correctly with different currencies', () => {
    const plansWithDifferentCurrencies: Plan[] = [
      {
        ...mockPlans[0],
        id: '1',
        price: 19.99,
        currency: 'USD',
      },
      {
        ...mockPlans[0],
        id: '2',
        price: 24.99,
        currency: 'EUR',
      },
      {
        ...mockPlans[0],
        id: '3',
        price: 15.99,
        currency: 'GBP',
      },
    ];

    render(<PlansTable plans={plansWithDifferentCurrencies} />);

    expect(screen.getByText('$19.99')).toBeDefined();
    expect(screen.getByText('€24.99')).toBeDefined();
    expect(screen.getByText('£15.99')).toBeDefined();
  });

  it('should format duration correctly', () => {
    const plansWithDifferentDurations: Plan[] = [
      {
        ...mockPlans[0],
        id: '1',
        duration_days: 1,
      },
      {
        ...mockPlans[0],
        id: '2',
        duration_days: 7,
      },
      {
        ...mockPlans[0],
        id: '3',
        duration_days: 30,
      },
      {
        ...mockPlans[0],
        id: '4',
        duration_days: 90,
      },
      {
        ...mockPlans[0],
        id: '5',
        duration_days: 365,
      },
    ];

    render(<PlansTable plans={plansWithDifferentDurations} />);

    expect(screen.getByText('1 day')).toBeDefined();
    expect(screen.getByText('7 days')).toBeDefined();
    expect(screen.getByText('1 month')).toBeDefined();
    expect(screen.getByText('3 months')).toBeDefined();
    expect(screen.getByText('1 year')).toBeDefined();
  });

  it('should format data limit correctly', () => {
    const plansWithDifferentLimits: Plan[] = [
      {
        ...mockPlans[0],
        id: '1',
        data_limit_gb: 10,
      },
      {
        ...mockPlans[0],
        id: '2',
        data_limit_gb: 100,
      },
      {
        ...mockPlans[0],
        id: '3',
        data_limit_gb: 1000,
      },
      {
        ...mockPlans[0],
        id: '4',
        data_limit_gb: 2500,
      },
    ];

    render(<PlansTable plans={plansWithDifferentLimits} />);

    expect(screen.getByText('10 GB')).toBeDefined();
    expect(screen.getByText('100 GB')).toBeDefined();
    expect(screen.getByText('1 TB')).toBeDefined();
    expect(screen.getByText('2.5 TB')).toBeDefined();
  });

  it('should display correct plan count in description', () => {
    render(<PlansTable plans={mockPlans} />);
    expect(screen.getByText('2 plans found')).toBeDefined();
  });

  it('should display singular plan text for one plan', () => {
    render(<PlansTable plans={[mockPlans[0]]} />);
    expect(screen.getByText('1 plan found')).toBeDefined();
  });
});
