/**
 * User Edit Form Component Tests
 * 
 * Tests for the UserEditForm component including:
 * - Form rendering with pre-populated data
 * - Form validation
 * - Successful user update
 * - Error handling
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserEditForm } from './user-edit-form';
import { usersApi } from '@/lib/api/endpoints/users';
import { toast } from '@/lib/hooks/use-toast';
import type { User } from '@/types/user';

// Mock dependencies
vi.mock('@/lib/api/endpoints/users', () => ({
  usersApi: {
    update: vi.fn(),
  },
}));

vi.mock('@/lib/hooks/use-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBack = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    refresh: mockRefresh,
  }),
}));

describe('UserEditForm', () => {
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
    avatar: '',
    status: 'active',
    role: 'user',
    last_login_at: null,
    last_login_ip: '',
    failed_login_count: 0,
    locked_until: null,
    password_changed_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with pre-populated user data', () => {
      render(<UserEditForm user={mockUser} />);

      // Check that form fields are pre-populated
      expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.first_name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.last_name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.phone)).toBeInTheDocument();
    });

    it('should render update and cancel buttons', () => {
      render(<UserEditForm user={mockUser} />);

      expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should handle empty optional fields', () => {
      const userWithoutPhone = { ...mockUser, phone: '' };
      render(<UserEditForm user={userWithoutPhone} />);

      const phoneInput = screen.getByLabelText(/phone/i);
      expect(phoneInput).toHaveValue('');
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<UserEditForm user={mockUser} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'notanemail');

      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short first name', async () => {
      const user = userEvent.setup();
      render(<UserEditForm user={mockUser} />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'J');

      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for short last name', async () => {
      const user = userEvent.setup();
      render(<UserEditForm user={mockUser} />);

      const lastNameInput = screen.getByLabelText(/last name/i);
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'D');

      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/last name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should successfully update user', async () => {
      const user = userEvent.setup();
      
      vi.mocked(usersApi.update).mockResolvedValue({
        success: true,
        data: { ...mockUser, first_name: 'Jane' },
      });

      render(<UserEditForm user={mockUser} />);

      // Update first name
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(usersApi.update).toHaveBeenCalledWith(mockUser.id, {
          email: mockUser.email,
          first_name: 'Jane',
          last_name: mockUser.last_name,
          phone: mockUser.phone,
        });
        expect(toast.success).toHaveBeenCalledWith('User updated successfully');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup();
      let resolveUpdate: (value: unknown) => void;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });

      vi.mocked(usersApi.update).mockReturnValue(updatePromise as Promise<{ success: boolean; data: User }>);

      render(<UserEditForm user={mockUser} />);

      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByRole('button', { name: /updating.../i })).toBeInTheDocument();
      });

      // Resolve the promise
      resolveUpdate!({
        success: true,
        data: mockUser,
      });
    });

    it('should handle update error', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      vi.mocked(usersApi.update).mockRejectedValue(new Error(errorMessage));

      render(<UserEditForm user={mockUser} />);

      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
        expect(mockRefresh).not.toHaveBeenCalled();
      });
    });

    it('should call onSuccess callback after successful update', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      vi.mocked(usersApi.update).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      render(<UserEditForm user={mockUser} onSuccess={onSuccess} />);

      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should navigate back when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<UserEditForm user={mockUser} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('should allow clearing optional phone field', async () => {
      const user = userEvent.setup();
      vi.mocked(usersApi.update).mockResolvedValue({
        success: true,
        data: { ...mockUser, phone: '' },
      });

      render(<UserEditForm user={mockUser} />);

      const phoneInput = screen.getByLabelText(/phone/i);
      await user.clear(phoneInput);

      const submitButton = screen.getByRole('button', { name: /update user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(usersApi.update)).toHaveBeenCalledWith(mockUser.id, {
          email: mockUser.email,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          phone: '',
        });
      });
    });
  });
});
