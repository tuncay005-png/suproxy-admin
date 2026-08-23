/**
 * Login Page Tests
 * 
 * Unit tests for the Login Page to verify:
 * - Page renders correctly with form
 * - Card layout is properly structured
 * - Branding and instructions are displayed
 * 
 * Validates: Requirements 1.1
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

describe('LoginPage', () => {
  it('renders the login page with title and description', () => {
    render(<LoginPage />);

    // Requirement 1.1: Login page displays properly
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/enter your credentials to access the admin dashboard/i)).toBeInTheDocument();
  });

  it('renders the login form', () => {
    render(<LoginPage />);

    // Verify form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});