/**
 * Tests for UserSubscriptionCard component
 * 
 * @module components/admin/users/user-subscription-card.test
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserSubscriptionCard } from './user-subscription-card';
import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions';
import type { Subscription } from '@/types/subscription';

// Mock the subscriptions API
vi.mock('@/lib/api/endpoints/subscriptions', () => ({
  subscriptionsApi: {
    getForUser: vi.fn(),
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

describe('UserSubscriptionCard', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading state initially', () => {
    vi.mocked(subscriptionsApi.getForUser).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<UserSubscriptionCard userId={userId} />);

    expect(screen.getByText('Subscription')).toBeInTheDocument();
    expect(screen.getByText('Loading subscription information...')).toBeInTheDocument();
  });

  it('displays no subscription message when user has no subscription', async () => {
    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: null,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('No Subscription')).toBeInTheDocument();
    });

    expect(screen.getByText('This user does not have an active subscription plan.')).toBeInTheDocument();
    expect(screen.getByText('View Available Plans')).toBeInTheDocument();
  });

  it('displays active subscription with remaining days', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15); // 15 days from now

    const mockSubscription: Subscription = {
      id: 'sub-1',
      user_id: userId,
      plan_id: 'plan-1',
      plan_name: 'Premium Plan',
      status: 'active',
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: futureDate.toISOString(),
      data_used_gb: 25.5,
      data_limit_gb: 100,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: mockSubscription,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
    });

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Remaining Time')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Remaining days
    expect(screen.getByText('Data Usage')).toBeInTheDocument();
    expect(screen.getByText('25.50 GB / 100 GB')).toBeInTheDocument();
  });

  it('displays expired subscription with warning', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

    const mockSubscription: Subscription = {
      id: 'sub-1',
      user_id: userId,
      plan_id: 'plan-1',
      plan_name: 'Basic Plan',
      status: 'expired',
      start_date: '2023-01-01T00:00:00Z',
      expiry_date: pastDate.toISOString(),
      data_used_gb: 100,
      data_limit_gb: 100,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: pastDate.toISOString(),
    };

    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: mockSubscription,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Subscription Expired')).toBeInTheDocument();
  });

  it('displays suspended subscription', async () => {
    const mockSubscription: Subscription = {
      id: 'sub-1',
      user_id: userId,
      plan_id: 'plan-1',
      plan_name: 'Pro Plan',
      status: 'suspended',
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T00:00:00Z',
      data_used_gb: 50,
      data_limit_gb: 200,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: mockSubscription,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    });

    expect(screen.getByText('Suspended')).toBeInTheDocument();
  });

  it('displays cancelled subscription', async () => {
    const mockSubscription: Subscription = {
      id: 'sub-1',
      user_id: userId,
      plan_id: 'plan-1',
      plan_name: 'Enterprise Plan',
      status: 'cancelled',
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T00:00:00Z',
      data_used_gb: 10,
      data_limit_gb: 500,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: mockSubscription,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('displays error state when API call fails', async () => {
    vi.mocked(subscriptionsApi).getForUser.mockRejectedValue(new Error('Network error'));

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load subscription data')).toBeInTheDocument();
    });
  });

  it('displays data usage progress bar with correct color', async () => {
    const mockSubscription: Subscription = {
      id: 'sub-1',
      user_id: userId,
      plan_id: 'plan-1',
      plan_name: 'Premium Plan',
      status: 'active',
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T00:00:00Z',
      data_used_gb: 91, // 91% used (should show red)
      data_limit_gb: 100,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: mockSubscription,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('Premium Plan')).toBeInTheDocument();
    });

    expect(screen.getByText('91.0% used')).toBeInTheDocument();
  });

  it('includes link to plans management page', async () => {
    const mockSubscription: Subscription = {
      id: 'sub-1',
      user_id: userId,
      plan_id: 'plan-1',
      plan_name: 'Basic Plan',
      status: 'active',
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T00:00:00Z',
      data_used_gb: 10,
      data_limit_gb: 50,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: mockSubscription,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(screen.getByText('View All Plans')).toBeInTheDocument();
    });

    const link = screen.getByText('View All Plans').closest('a');
    expect(link).toHaveAttribute('href', '/admin/plans');
  });

  it('calls API with correct user ID', async () => {
    vi.mocked(subscriptionsApi).getForUser.mockResolvedValue({
      data: null,
      success: true,
    });

    render(<UserSubscriptionCard userId={userId} />);

    await waitFor(() => {
      expect(vi.mocked(subscriptionsApi).getForUser).toHaveBeenCalledWith(userId);
    });
  });
});

