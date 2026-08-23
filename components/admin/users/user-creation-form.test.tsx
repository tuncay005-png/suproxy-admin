/**
 * Unit Tests for User Creation Form
 * 
 * Tests form rendering, validation, submission, and error handling.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserCreationForm } from './user-creation-form';
import { usersApi } from '@/lib/api/endpoints/users';
import { toast } from '@/lib/hooks/use-toast';
import type { User } from '@/types/user';

// Mock dependencies
vi.mock('@/lib/api/endpoints/users', () => ({
  usersApi: {
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

describe('UserCreationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<UserCreationForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates email format with correct input type', async () => {
    render(<UserCreationForm />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    
    // Verify email input has correct type for browser validation
    expect(emailInput.type).toBe('email');
  });

  it('validates password minimum length', async () => {
    const user = userEvent.setup();
    render(<UserCreationForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'short');
    await user.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('validates first name minimum length', async () => {
    const user = userEvent.setup();
    render(<UserCreationForm />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, 'a');
    await user.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone: '',
      avatar: '',
      status: 'active',
      role: 'user',
      last_login_at: null,
      last_login_ip: '',
      failed_login_count: 0,
      locked_until: null,
      password_changed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(usersApi.create).mockResolvedValue({ success: true, data: mockUser });

    render(<UserCreationForm />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/password/i), 'Password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create user/i }));

    // Wait for API call
    await waitFor(() => {
      expect(usersApi.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone: '',
        password: 'Password123',
        role: 'user',
      });
    }, { timeout: 20000 });

    // Wait for toast
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('User created successfully');
    }, { timeout: 20000 });

    // Wait for navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/users');
      expect(mockRefresh).toHaveBeenCalled();
    }, { timeout: 20000 });
  }, 30000);

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already exists';
    vi.mocked(usersApi.create).mockRejectedValue(new Error(errorMessage));

    render(<UserCreationForm />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/password/i), 'Password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(mockPush).not.toHaveBeenCalled();
    }, { timeout: 20000 });
  }, 30000);

  it('disables form fields while submitting', async () => {
    const user = userEvent.setup();
    let resolveCreate: (value: unknown) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });

    vi.mocked(usersApi.create).mockReturnValue(createPromise as Promise<{ success: boolean; data: User }>);

    render(<UserCreationForm />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/password/i), 'Password123');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /create user/i }));

    // Check that form is disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    }, { timeout: 20000 });

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/first name/i)).toBeDisabled();
      expect(screen.getByLabelText(/last name/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    }, { timeout: 20000 });

    // Resolve the promise
    resolveCreate!({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone: '',
        avatar: '',
        status: 'active',
        role: 'user',
        last_login_at: null,
        last_login_ip: '',
        failed_login_count: 0,
        locked_until: null,
        password_changed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  }, 30000);

  it('navigates to users list on cancel', async () => {
    const user = userEvent.setup();
    render(<UserCreationForm />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/users');
  });
});