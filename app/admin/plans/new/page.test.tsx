/**
 * Unit Tests for Plan Creation Page
 * 
 * Tests the rendering and structure of the plan creation page component.
 * 
 * Validates: Requirements 8.3-8.4, 8.9, 13.1-13.3
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NewPlanPage from './page';

// Mock the components
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/admin/plans/plan-creation-form', () => ({
  PlanCreationForm: () => <div data-testid="plan-creation-form">Plan Creation Form</div>,
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

describe('NewPlanPage', () => {
  it('renders the page header with correct title and description', () => {
    render(<NewPlanPage />);
    
    expect(screen.getByText('Create Plan')).toBeInTheDocument();
    expect(screen.getByText('Add a new subscription plan')).toBeInTheDocument();
  });

  it('renders the card with plan details section', () => {
    render(<NewPlanPage />);
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Plan Details')).toBeInTheDocument();
    expect(screen.getByText('Define the pricing, duration, and limits for this subscription plan')).toBeInTheDocument();
  });

  it('renders the PlanCreationForm component', () => {
    render(<NewPlanPage />);
    
    expect(screen.getByTestId('plan-creation-form')).toBeInTheDocument();
  });

  it('applies max-width styling to the card', () => {
    render(<NewPlanPage />);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('max-w-2xl');
  });
});
