/**
 * Unit Tests for Plan Edit Form
 * 
 * Tests form rendering, pre-population, validation, submission, and error handling.
 * 
 * Validates: Requirements 8.5-8.6, 13.1-13.3, 13.9-13.11
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanEditForm } from './plan-edit-form';
import { plansApi } from '@/lib/api/endpoints/plans';
import { toast } from '@/lib/hooks/use-toast';
import type { Plan } from '@/types/plan';

// Mock dependencies
vi.mock('@/lib/api/endpoints/plans', () => ({
  plansApi: {
    update: vi.fn(),
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

describe('PlanEditForm', () => {
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

  it('renders all form fields', () => {
    render(<PlanEditForm plan={mockPlan} />);

    expect(screen.getByLabelText(/plan name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration \(days\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data limit \(gb\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active plan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('pre-populates form with plan data', () => {
    render(<PlanEditForm plan={mockPlan} />);

    expect(screen.getByLabelText(/plan name/i)).toHaveValue('Premium');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Premium subscription plan');
    expect(screen.getByLabelText(/price/i)).toHaveValue(29.99);
    expect(screen.getByLabelText(/currency/i)).toHaveValue('USD');
    expect(screen.getByLabelText(/duration \(days\)/i)).toHaveValue(30);
    expect(screen.getByLabelText(/data limit \(gb\)/i)).toHaveValue(500);
    expect(screen.getByRole('checkbox', { name: /active plan/i })).toBeChecked();
  });

  it('pre-populates form with inactive plan', () => {
    const inactivePlan: Plan = {
      ...mockPlan,
      active: false,
    };

    render(<PlanEditForm plan={inactivePlan} />);

    expect(screen.getByRole('checkbox', { name: /active plan/i })).not.toBeChecked();
  });

  it('validates plan name is required', async () => {
    const user = userEvent.setup();
    render(<PlanEditForm plan={mockPlan} />);

    const nameInput = screen.getByLabelText(/plan name/i);
    await user.clear(nameInput);
    
    const submitButton = screen.getByRole('button', { name: /update plan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/plan name is required/i)).toBeInTheDocument();
    });
  });

  it('validates description is required', async () => {
    const user = userEvent.setup();
    render(<PlanEditForm plan={mockPlan} />);

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.clear(descriptionInput);
    
    const submitButton = screen.getByRole('button', { name: /update plan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/plan description is required/i)).toBeInTheDocument();
    });
  });

  it('validates currency is exactly 3 characters', async () => {
    const user = userEvent.setup();
    render(<PlanEditForm plan={mockPlan} />);

    const currencyInput = screen.getByLabelText(/currency/i);
    await user.clear(currencyInput);
    await user.type(currencyInput, 'US');
    await user.click(screen.getByRole('button', { name: /update plan/i }));

    await waitFor(() => {
      expect(screen.getByText(/currency must be exactly 3 characters/i)).toBeInTheDocument();
    });
  });

  it('validates currency is uppercase', async () => {
    const user = userEvent.setup();
    render(<PlanEditForm plan={mockPlan} />);

    const currencyInput = screen.getByLabelText(/currency/i);
    await user.clear(currencyInput);
    await user.type(currencyInput, 'eur');

    // Currency should be converted to uppercase automatically
    expect(currencyInput).toHaveValue('EUR');
  });

  it('submits form with updated data', async () => {
    const user = userEvent.setup();
    const updatedPlan: Plan = {
      ...mockPlan,
      name: 'Premium Plus',
      price: 39.99,
    };

    vi.mocked(plansApi.update).mockResolvedValue({ success: true, data: updatedPlan });

    render(<PlanEditForm plan={mockPlan} />);

    // Update some fields
    const nameInput = screen.getByLabelText(/plan name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Premium Plus');
    
    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '39.99');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /update plan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(plansApi.update).toHaveBeenCalledWith('plan-123', {
        name: 'Premium Plus',
        description: 'Premium subscription plan',
        price: 39.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 500,
        active: true,
      });
    }, { timeout: 10000 });

    expect(toast.success).toHaveBeenCalledWith('Plan updated successfully');
    expect(mockPush).toHaveBeenCalledWith('/admin/plans');
    expect(mockRefresh).toHaveBeenCalled();
  }, 15000);

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to update plan';
    vi.mocked(plansApi.update).mockRejectedValue(new Error(errorMessage));

    render(<PlanEditForm plan={mockPlan} />);

    // Change a field
    const nameInput = screen.getByLabelText(/plan name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Premium');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /update plan/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('disables form fields while submitting', async () => {
    const user = userEvent.setup();
    let resolveUpdate: (value: unknown) => void;
    const updatePromise = new Promise((resolve) => {
      resolveUpdate = resolve;
    });

    vi.mocked(plansApi.update).mockReturnValue(updatePromise as Promise<{ success: boolean; data: Plan }>);

    render(<PlanEditForm plan={mockPlan} />);

    // Change a field
    const nameInput = screen.getByLabelText(/plan name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Premium');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /update plan/i }));

    // Check that form is disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
      expect(screen.getByLabelText(/plan name/i)).toBeDisabled();
      expect(screen.getByLabelText(/description/i)).toBeDisabled();
      expect(screen.getByLabelText(/price/i)).toBeDisabled();
      expect(screen.getByLabelText(/currency/i)).toBeDisabled();
      expect(screen.getByLabelText(/duration \(days\)/i)).toBeDisabled();
      expect(screen.getByLabelText(/data limit \(gb\)/i)).toBeDisabled();
    });

    // Resolve the promise
    resolveUpdate!({
      success: true,
      data: mockPlan,
    });
  });

  it('navigates to plans list on cancel', async () => {
    const user = userEvent.setup();
    render(<PlanEditForm plan={mockPlan} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/plans');
  });

  it('allows toggling active status', async () => {
    const user = userEvent.setup();
    render(<PlanEditForm plan={mockPlan} />);

    const activeCheckbox = screen.getByRole('checkbox', { name: /active plan/i });
    
    // Should be checked by default for this mock plan
    expect(activeCheckbox).toBeChecked();

    // Uncheck it
    await user.click(activeCheckbox);
    expect(activeCheckbox).not.toBeChecked();

    // Check it again
    await user.click(activeCheckbox);
    expect(activeCheckbox).toBeChecked();
  });

  it('calls onSuccess callback after successful update', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    
    vi.mocked(plansApi.update).mockResolvedValue({ success: true, data: mockPlan });

    render(<PlanEditForm plan={mockPlan} onSuccess={onSuccess} />);

    // Change a field
    const nameInput = screen.getByLabelText(/plan name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Premium');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /update plan/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('allows updating price to zero', async () => {
    const user = userEvent.setup();
    vi.mocked(plansApi.update).mockResolvedValue({ success: true, data: { ...mockPlan, price: 0 } });

    render(<PlanEditForm plan={mockPlan} />);

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '0');

    await user.click(screen.getByRole('button', { name: /update plan/i }));

    await waitFor(() => {
      expect(plansApi.update).toHaveBeenCalledWith('plan-123', expect.objectContaining({
        price: 0,
      }));
    });
  });

  it('allows updating data limit to zero (unlimited)', async () => {
    const user = userEvent.setup();
    vi.mocked(plansApi.update).mockResolvedValue({ success: true, data: { ...mockPlan, data_limit_gb: 0 } });

    render(<PlanEditForm plan={mockPlan} />);

    const dataLimitInput = screen.getByLabelText(/data limit \(gb\)/i);
    await user.clear(dataLimitInput);
    await user.type(dataLimitInput, '0');

    await user.click(screen.getByRole('button', { name: /update plan/i }));

    await waitFor(() => {
      expect(plansApi.update).toHaveBeenCalledWith('plan-123', expect.objectContaining({
        data_limit_gb: 0,
      }));
    });
  });

  it('validates price field has correct constraints', () => {
    render(<PlanEditForm plan={mockPlan} />);

    const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;
    
    expect(priceInput.type).toBe('number');
    expect(priceInput.min).toBe('0');
    expect(priceInput.step).toBe('0.01');
  });

  it('validates duration field has correct constraints', () => {
    render(<PlanEditForm plan={mockPlan} />);

    const durationInput = screen.getByLabelText(/duration \(days\)/i) as HTMLInputElement;
    
    expect(durationInput.type).toBe('number');
    expect(durationInput.min).toBe('1');
    expect(durationInput.step).toBe('1');
  });

  it('validates data limit field has correct constraints', () => {
    render(<PlanEditForm plan={mockPlan} />);

    const dataLimitInput = screen.getByLabelText(/data limit \(gb\)/i) as HTMLInputElement;
    
    expect(dataLimitInput.type).toBe('number');
    expect(dataLimitInput.min).toBe('0');
    expect(dataLimitInput.step).toBe('0.1');
  });

  it('renders textarea for description field', () => {
    render(<PlanEditForm plan={mockPlan} />);

    const descriptionField = screen.getByLabelText(/description/i);
    expect(descriptionField.tagName).toBe('TEXTAREA');
  });

  it('displays field descriptions/hints', () => {
    render(<PlanEditForm plan={mockPlan} />);

    expect(screen.getByText(/A unique, descriptive name for this subscription plan/i)).toBeInTheDocument();
    expect(screen.getByText(/Brief description of the plan's features and benefits/i)).toBeInTheDocument();
    expect(screen.getByText(/Price must be non-negative/i)).toBeInTheDocument();
    expect(screen.getByText(/3-letter code \(e\.g\., USD, EUR, GBP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Subscription duration in days/i)).toBeInTheDocument();
    expect(screen.getByText(/Data allowance in GB/i)).toBeInTheDocument();
    expect(screen.getByText(/Make this plan available for new subscriptions/i)).toBeInTheDocument();
  });
});
