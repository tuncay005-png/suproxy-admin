/**
 * Tests for Plans List Page
 * 
 * Validates that the plans list page renders correctly with data fetching.
 * 
 * @module app/admin/plans/page.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlansPage from './page';
import { plansApi } from '@/lib/api/endpoints/plans';
import type { Plan } from '@/types/plan';

// Mock the API client
vi.mock('@/lib/api/endpoints/plans', () => ({
  plansApi: {
    list: vi.fn(),
  },
}));

// Mock the PlansTable component
vi.mock('@/components/admin/plans/plans-table', () => ({
  PlansTable: ({ plans }: { plans: Plan[] }) => (
    <div data-testid="plans-table">
      <div>Plans count: {plans.length}</div>
      {plans.map((plan) => (
        <div key={plan.id} data-testid={`plan-${plan.id}`}>
          {plan.name}
        </div>
      ))}
    </div>
  ),
}));

// Mock PageHeader component
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

describe('PlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with plans data', async () => {
    const mockPlans: Plan[] = [
      {
        id: '1',
        name: 'Basic',
        description: 'Basic plan',
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
        name: 'Premium',
        description: 'Premium plan',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
        active_subscriptions: 10,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    vi.mocked(plansApi.list).mockResolvedValue({
      success: true,
      data: {
        plans: mockPlans,
        total: 2,
      },
    });

    const { container } = render(await PlansPage({ searchParams: Promise.resolve({}) }));

    // Check page header
    expect(screen.getByTestId('page-header')).toBeDefined();
    expect(screen.getByText('Subscription Plans')).toBeDefined();
    expect(screen.getByText('Manage subscription plans and pricing tiers')).toBeDefined();

    // Check plans table
    expect(screen.getByTestId('plans-table')).toBeDefined();
    expect(screen.getByText('Plans count: 2')).toBeDefined();
    expect(screen.getByTestId('plan-1')).toBeDefined();
    expect(screen.getByTestId('plan-2')).toBeDefined();
    expect(screen.getByText('Basic')).toBeDefined();
    expect(screen.getByText('Premium')).toBeDefined();
  });

  it('should render the page with empty plans array', async () => {
    vi.mocked(plansApi.list).mockResolvedValue({
      success: true,
      data: {
        plans: [],
        total: 0,
      },
    });

    render(await PlansPage({ searchParams: Promise.resolve({}) }));

    // Check page header
    expect(screen.getByText('Subscription Plans')).toBeDefined();

    // Check plans table with empty data
    expect(screen.getByTestId('plans-table')).toBeDefined();
    expect(screen.getByText('Plans count: 0')).toBeDefined();
  });

  it('should call plansApi.list on render', async () => {
    vi.mocked(plansApi.list).mockResolvedValue({
      success: true,
      data: {
        plans: [],
        total: 0,
      },
    });

    render(await PlansPage({ searchParams: Promise.resolve({}) }));

    expect(plansApi.list).toHaveBeenCalledOnce();
  });
});
