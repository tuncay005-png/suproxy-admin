/**
 * Unit Tests for Plan Creation Form
 * 
 * Tests form rendering, validation, submission, and error handling.
 * 
 * Validates: Requirements 8.3-8.4, 8.9, 13.1-13.3, 13.9-13.11
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanCreationForm } from './plan-creation-form';
import { plansApi } from '@/lib/api/endpoints/plans';
import { toast } from '@/lib/hooks/use-toast';
import type { Plan } from '@/types/plan';

// Mock dependencies
vi.mock('@/lib/api/endpoints/plans', () => ({
  plansApi: {
    create: vi.fn(),
  },
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe('PlanCreationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<PlanCreationForm />);

    expect(screen.getByLabelText(/plan name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration \(days\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data limit \(gb\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active plan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('displays default values correctly', () => {
    render(<PlanCreationForm />);

    expect(screen.getByLabelText(/currency/i)).toHaveValue('USD');
    expect(screen.getByLabelText(/duration \(days\)/i)).toHaveValue(30);
    expect(screen.getByLabelText(/data limit \(gb\)/i)).toHaveValue(100);
    expect(screen.getByRole('checkbox', { name: /active plan/i })).toBeChecked();
  });

  it('validates plan name is required', async () => {
    const user = userEvent.setup();
    render(<PlanCreationForm />);

    const submitButton = screen.getByRole('button', { name: /create plan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/plan name is required/i)).toBeInTheDocument();
    });
  });

  it('validates description is required', async () => {
    const user = userEvent.setup();
    render(<PlanCreationForm />);

    const submitButton = screen.getByRole('button', { name: /create plan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/plan description is required/i)).toBeInTheDocument();
    });
  });

  it('validates price field has correct constraints', () => {
    render(<PlanCreationForm />);

    const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;
    
    // Verify HTML5 constraints are set
    expect(priceInput.type).toBe('number');
    expect(priceInput.min).toBe('0');
    expect(priceInput.step).toBe('0.01');
  });

  it('validates currency is exactly 3 characters', async () => {
    const user = userEvent.setup();
    render(<PlanCreationForm />);

    const currencyInput = screen.getByLabelText(/currency/i);
    await user.clear(currencyInput);
    await user.type(currencyInput, 'US');
    await user.click(screen.getByRole('button', { name: /create plan/i }));

    await waitFor(() => {
      expect(screen.getByText(/currency must be exactly 3 characters/i)).toBeInTheDocument();
    });
  });

  it('validates currency is uppercase', async () => {
    const user = userEvent.setup();
    render(<PlanCreationForm />);

    const currencyInput = screen.getByLabelText(/currency/i);
    await user.clear(currencyInput);
    await user.type(currencyInput, 'usd');

    // Currency should be converted to uppercase automatically
    expect(currencyInput).toHaveValue('USD');
  });

  it('validates duration field has correct constraints', () => {
    render(<PlanCreationForm />);

    const durationInput = screen.getByLabelText(/duration \(days\)/i) as HTMLInputElement;
    
    // Verify HTML5 constraints are set
    expect(durationInput.type).toBe('number');
    expect(durationInput.min).toBe('1');
    expect(durationInput.step).toBe('1');
  });

  it('validates data limit field has correct constraints', () => {
    render(<PlanCreationForm />);

    const dataLimitInput = screen.getByLabelText(/data limit \(gb\)/i) as HTMLInputElement;
    
    // Verify HTML5 constraints are set
    expect(dataLimitInput.type).toBe('number');
    expect(dataLimitInput.min).toBe('0');
    expect(dataLimitInput.step).toBe('0.1');
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockPlan: Plan = {
      id: '1',
      name: 'Premium',
      description: 'Premium subscription plan',
      price: 29.99,
      currency: 'USD',
      duration_days: 30,
      data_limit_gb: 500,
      active: true,
      active_subscriptions: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(plansApi.create).mockResolvedValue({ success: true, data: mockPlan });

    render(<PlanCreationForm />);

    // Fill in the form
    await user.type(screen.getByLabelText(/plan name/i), 'Premium');
    await user.type(screen.getByLabelText(/description/i), 'Premium subscription plan');
    
    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '29.99');
    
    const durationInput = screen.getByLabelText(/duration \(days\)/i);
    await user.clear(durationInput);
    await user.type(durationInput, '30');
    
    const dataLimitInput = screen.getByLabelText(/data limit \(gb\)/i);
    await user.clear(dataLimitInput);
    await user.type(dataLimitInput, '500');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create plan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(plansApi.create).toHaveBeenCalledWith({
        name: 'Premium',
        description: 'Premium subscription plan',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 500,
        active: true,
      });
    }, { timeout: 10000 });

    expect(toast.success).toHaveBeenCalledWith('Plan created successfully');
    expect(mockPush).toHaveBeenCalledWith('/admin/plans');
    expect(mockRefresh).toHaveBeenCalled();
  }, 15000);

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Plan name already exists';
    vi.mocked(plansApi.create).mockRejectedValue(new Error(errorMessage));

    render(<PlanCreationForm />);

    // Fill in the form with valid data
    await user.type(screen.getByLabelText(/plan name/i), 'Premium');
    await user.type(screen.getByLabelText(/description/i), 'Premium plan');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create plan/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('disables form fields while submitting', async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: unknown) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });

    vi.mocked(plansApi.create).mockReturnValue(createPromise as Promise<{ success: boolean; data: Plan }>);

    render(<PlanCreationForm />);

    // Fill in the form
    await user.type(screen.getByLabelText(/plan name/i), 'Premium');
    await user.type(screen.getByLabelText(/description/i), 'Premium plan');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create plan/i }));

    // Check that form is disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
      expect(screen.getByLabelText(/plan name/i)).toBeDisabled();
      expect(screen.getByLabelText(/description/i)).toBeDisabled();
      expect(screen.getByLabelText(/price/i)).toBeDisabled();
      expect(screen.getByLabelText(/currency/i)).toBeDisabled();
      expect(screen.getByLabelText(/duration \(days\)/i)).toBeDisabled();
      expect(screen.getByLabelText(/data limit \(gb\)/i)).toBeDisabled();
    });

    // Resolve the promise
    resolveCreate!({
      success: true,
      data: {
        id: '1',
        name: 'Premium',
        description: 'Premium plan',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
        active_subscriptions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  });

  it('navigates to plans list on cancel', async () => {
    const user = userEvent.setup();
    render(<PlanCreationForm />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/plans');
  });

  it('allows toggling active status checkbox', async () => {
    const user = userEvent.setup();
    render(<PlanCreationForm />);

    const activeCheckbox = screen.getByRole('checkbox', { name: /active plan/i });
    
    // Should be checked by default
    expect(activeCheckbox).toBeChecked();

    // Uncheck it
    await user.click(activeCheckbox);
    expect(activeCheckbox).not.toBeChecked();

    // Check it again
    await user.click(activeCheckbox);
    expect(activeCheckbox).toBeChecked();
  });

  it('renders textarea for description field', () => {
    render(<PlanCreationForm />);

    const descriptionField = screen.getByLabelText(/description/i);
    expect(descriptionField.tagName).toBe('TEXTAREA');
  });

  it('displays field descriptions/hints', () => {
    render(<PlanCreationForm />);

    expect(screen.getByText(/A unique, descriptive name for this subscription plan/i)).toBeInTheDocument();
    expect(screen.getByText(/Brief description of the plan's features and benefits/i)).toBeInTheDocument();
    expect(screen.getByText(/Price must be non-negative/i)).toBeInTheDocument();
    expect(screen.getByText(/3-letter code \(e\.g\., USD, EUR, GBP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Subscription duration in days/i)).toBeInTheDocument();
    expect(screen.getByText(/Data allowance in GB/i)).toBeInTheDocument();
    expect(screen.getByText(/Make this plan available for new subscriptions/i)).toBeInTheDocument();
  });
});
