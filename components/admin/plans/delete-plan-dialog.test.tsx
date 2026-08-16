/**
 * Delete Plan Dialog Component Tests
 * 
 * Tests the delete plan dialog component with subscription checks.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeletePlanDialog } from './delete-plan-dialog';
import type { Plan } from '@/types/plan';

// Mock dependencies
vi.mock('@/lib/api/endpoints/plans', () => ({
  plansApi: {
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('DeletePlanDialog', () => {
  const mockPlanWithoutSubscriptions: Plan = {
    id: 'plan-1',
    name: 'Basic Plan',
    description: 'Basic subscription plan',
    price: 9.99,
    currency: 'USD',
    duration_days: 30,
    data_limit_gb: 10,
    active: true,
    active_subscriptions: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockPlanWithSubscriptions: Plan = {
    ...mockPlanWithoutSubscriptions,
    id: 'plan-2',
    name: 'Premium Plan',
    active_subscriptions: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button', () => {
    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('opens dialog when delete button is clicked', () => {
    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete the plan/i)).toBeInTheDocument();
  });

  it('displays plan name in confirmation message', () => {
    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    expect(screen.getByText('Basic Plan')).toBeInTheDocument();
  });

  it('shows "no active subscriptions" message for plans without subscriptions', () => {
    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    expect(screen.getByText(/this plan has no active subscriptions/i)).toBeInTheDocument();
  });

  it('shows warning for plans with active subscriptions', () => {
    render(<DeletePlanDialog plan={mockPlanWithSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    expect(screen.getByText(/this plan has 5 active subscriptions/i)).toBeInTheDocument();
    expect(screen.getByText(/users will lose access/i)).toBeInTheDocument();
  });

  it('does not require confirmation text for plans without subscriptions', () => {
    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    // Should not show confirmation input
    expect(screen.queryByLabelText(/type/i)).not.toBeInTheDocument();
    
    // Delete button should be enabled
    const confirmButton = screen.getByRole('button', { name: 'Delete Plan' });
    expect(confirmButton).not.toBeDisabled();
  });

  it('requires typing plan name for plans with active subscriptions', () => {
    render(<DeletePlanDialog plan={mockPlanWithSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    // Should show confirmation input
    expect(screen.getByLabelText(/type premium plan to confirm/i)).toBeInTheDocument();
    
    // Delete button should be disabled initially
    const confirmButton = screen.getByRole('button', { name: 'Delete Plan' });
    expect(confirmButton).toBeDisabled();
  });

  it('enables delete button when correct plan name is typed', () => {
    render(<DeletePlanDialog plan={mockPlanWithSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    const confirmInput = screen.getByPlaceholderText(/enter plan name/i);
    const confirmButton = screen.getByRole('button', { name: 'Delete Plan' });
    
    // Initially disabled
    expect(confirmButton).toBeDisabled();
    
    // Type correct plan name
    fireEvent.change(confirmInput, { target: { value: 'Premium Plan' } });
    
    // Should be enabled
    expect(confirmButton).not.toBeDisabled();
  });

  it('keeps delete button disabled when incorrect plan name is typed', () => {
    render(<DeletePlanDialog plan={mockPlanWithSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    const confirmInput = screen.getByPlaceholderText(/enter plan name/i);
    const confirmButton = screen.getByRole('button', { name: 'Delete Plan' });
    
    // Type incorrect plan name
    fireEvent.change(confirmInput, { target: { value: 'Wrong Plan' } });
    
    // Should still be disabled
    expect(confirmButton).toBeDisabled();
  });

  it('calls delete API and shows success message on successful deletion', async () => {
    const { plansApi } = await import('@/lib/api/endpoints/plans');
    const { toast } = await import('@/lib/hooks/use-toast');
    
    const mockDelete = vi.fn().mockResolvedValue({ data: { message: 'Plan deleted' } });
    (plansApi.delete as any) = mockDelete;
    const mockToast = vi.fn();
    (toast.success as any) = mockToast;

    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByRole('button', { name: 'Delete Plan' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('plan-1');
    });
    
    expect(mockToast).toHaveBeenCalledWith('Plan "Basic Plan" deleted successfully');
  });

  it('shows error message when deletion fails', async () => {
    const { plansApi } = await import('@/lib/api/endpoints/plans');
    const { toast } = await import('@/lib/hooks/use-toast');
    
    const mockDelete = vi.fn().mockRejectedValue(new Error('Cannot delete plan with active subscriptions'));
    (plansApi.delete as any) = mockDelete;
    const mockToast = vi.fn();
    (toast.error as any) = mockToast;

    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByRole('button', { name: 'Delete Plan' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Cannot delete plan with active subscriptions');
    });
  });

  it('resets confirmation text when dialog is closed and reopened', () => {
    render(<DeletePlanDialog plan={mockPlanWithSubscriptions} />);
    
    // Open dialog
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    // Type some text
    const confirmInput = screen.getByPlaceholderText(/enter plan name/i);
    fireEvent.change(confirmInput, { target: { value: 'Premium' } });
    
    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Reopen dialog
    fireEvent.click(deleteButton);
    
    // Input should be empty
    const newConfirmInput = screen.getByPlaceholderText(/enter plan name/i);
    expect(newConfirmInput).toHaveValue('');
  });

  it('calls onSuccess callback after successful deletion', async () => {
    const { plansApi } = await import('@/lib/api/endpoints/plans');
    
    const mockDelete = vi.fn().mockResolvedValue({ data: { message: 'Plan deleted' } });
    (plansApi.delete as any) = mockDelete;
    const onSuccess = vi.fn();

    render(<DeletePlanDialog plan={mockPlanWithoutSubscriptions} onSuccess={onSuccess} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete plan/i });
    fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByRole('button', { name: 'Delete Plan' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
