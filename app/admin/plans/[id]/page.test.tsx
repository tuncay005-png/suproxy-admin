/**
 * Unit Tests for Plan Edit Page
 * 
 * Tests the rendering and structure of the plan edit page component.
 * 
 * Validates: Requirements 8.5-8.6, 13.1-13.3
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlanEditPage from './page';
import { plansApi } from '@/lib/api/endpoints/plans';
import type { Plan } from '@/types/plan';

// Mock dependencies
vi.mock('@/lib/api/endpoints/plans', () => ({
  plansApi: {
    getById: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/admin/plans/plan-edit-form', () => ({
  PlanEditForm: ({ plan }: { plan: Plan }) => (
    <div data-testid="plan-edit-form">
      Plan Edit Form for {plan.name}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean; [key: string]: unknown }) => (
    <button data-testid="button" {...props}>{children}</button>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">{children}</a>
  ),
}));

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
}));

describe('PlanEditPage', () => {
  const mockPlan: Plan = {
    id: 'plan-123',
    name: 'Premium',
    description: 'Premium subscription plan',
    price: 29.99,
    currency: 'USD',
    duration_days: 30,
    data_limit_gb: 500,
    active: true,
    active_subscriptions: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page header with correct title and description', async () => {
    vi.mocked(plansApi.getById).mockResolvedValue({
      success: true,
      data: mockPlan,
    });

    const params = Promise.resolve({ id: 'plan-123' });
    render(await PlanEditPage({ params }));
    
    expect(screen.getByText('Edit Plan')).toBeInTheDocument();
    expect(screen.getByText(`Update settings for ${mockPlan.name}`)).toBeInTheDocument();
  });

  it('renders the back button with link to plans list', async () => {
    vi.mocked(plansApi.getById).mockResolvedValue({
      success: true,
      data: mockPlan,
    });

    const params = Promise.resolve({ id: 'plan-123' });
    render(await PlanEditPage({ params }));
    
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/admin/plans');
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
  });

  it('renders the card with plan details section', async () => {
    vi.mocked(plansApi.getById).mockResolvedValue({
      success: true,
      data: mockPlan,
    });

    const params = Promise.resolve({ id: 'plan-123' });
    render(await PlanEditPage({ params }));
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Plan Details')).toBeInTheDocument();
    expect(screen.getByText('Modify the pricing, duration, and limits for this subscription plan')).toBeInTheDocument();
  });

  it('renders the PlanEditForm component with plan data', async () => {
    vi.mocked(plansApi.getById).mockResolvedValue({
      success: true,
      data: mockPlan,
    });

    const params = Promise.resolve({ id: 'plan-123' });
    render(await PlanEditPage({ params }));
    
    expect(screen.getByTestId('plan-edit-form')).toBeInTheDocument();
    expect(screen.getByText(`Plan Edit Form for ${mockPlan.name}`)).toBeInTheDocument();
  });

  it('applies max-width styling to the card', async () => {
    vi.mocked(plansApi.getById).mockResolvedValue({
      success: true,
      data: mockPlan,
    });

    const params = Promise.resolve({ id: 'plan-123' });
    render(await PlanEditPage({ params }));
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('max-w-2xl');
  });

  it('fetches plan data using the provided id', async () => {
    vi.mocked(plansApi.getById).mockResolvedValue({
      success: true,
      data: mockPlan,
    });

    const params = Promise.resolve({ id: 'plan-123' });
    await PlanEditPage({ params });
    
    expect(plansApi.getById).toHaveBeenCalledWith('plan-123');
  });

  it('calls notFound when plan is not found', async () => {
    const { notFound } = await import('next/navigation');
    
    // Make notFound throw an error to simulate Next.js behavior
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
    
    vi.mocked(plansApi.getById).mockResolvedValue({
      success: false,
      data: null as unknown as Plan,
    });

    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const params = Promise.resolve({ id: 'non-existent-id' });
    
    await expect(async () => {
      await PlanEditPage({ params });
    }).rejects.toThrow('NEXT_NOT_FOUND');
    
    expect(notFound).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('calls notFound when API call fails', async () => {
    const { notFound } = await import('next/navigation');
    
    // Make notFound throw an error to simulate Next.js behavior
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
    
    vi.mocked(plansApi.getById).mockRejectedValue(new Error('API Error'));

    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const params = Promise.resolve({ id: 'plan-123' });
    
    await expect(async () => {
      await PlanEditPage({ params });
    }).rejects.toThrow('NEXT_NOT_FOUND');
    
    expect(notFound).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});
