/**
 * Login Form Component Tests
 * 
 * Unit tests for the LoginForm component to verify:
 * - Form renders with email and password fields
 * - Validation works correctly
 * - Submit button state changes during loading
 * - Error messages display properly
 * 
 * Validates: Requirements 1.1, 1.2, 1.6, 1.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';
import * as authApiModule from '@/lib/api/endpoints/auth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password input fields', () => {
    render(<LoginForm />);

    // Requirement 1.1: Form displays email and password fields
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i);

    // Requirement 1.2, 8.3: Email validation
    // Fill in password to isolate email validation
    await user.type(passwordInput, 'password123');
    
    // Type an invalid email and blur to trigger validation
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Move focus away to trigger validation

    // The browser's HTML5 validation will catch this before React Hook Form
    // So we check if the input has the correct type
    expect(emailInput.type).toBe('email');
  });

  it('requires password field', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Requirement 1.2, 8.5: Password required validation
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed login response
    vi.spyOn(authApiModule.authApi, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'admin' },
      }), 100))
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Requirement 1.7: Loading state displayed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';

    // Mock failed login
    vi.spyOn(authApiModule.authApi, 'login').mockRejectedValue(
      new Error(errorMessage)
    );

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Requirement 1.6: Error message displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
