/**
 * Admin Error Boundary Tests
 * Tests for the global error boundary component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminError from './error';

// Mock console.error to avoid test output pollution
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('AdminError', () => {
  const mockReset = vi.fn();
  const mockError = new Error('Test error message');

  beforeEach(() => {
    mockReset.mockClear();
    vi.clearAllMocks();
  });

  it('should render error message', () => {
    render(<AdminError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should display user-friendly description', () => {
    render(<AdminError error={mockError} reset={mockReset} />);

    expect(
      screen.getByText('An unexpected error occurred while loading this page.')
    ).toBeInTheDocument();
  });

  it('should render Try again button', () => {
    render(<AdminError error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('should render Go to Dashboard button', () => {
    render(<AdminError error={mockError} reset={mockReset} />);

    const dashboardButton = screen.getByRole('button', {
      name: /go to dashboard/i,
    });
    expect(dashboardButton).toBeInTheDocument();
  });

  it('should call reset when Try again button is clicked', () => {
    render(<AdminError error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should log error details to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    const errorWithStack = new Error('Detailed error');
    errorWithStack.stack = 'Error stack trace';

    render(<AdminError error={errorWithStack} reset={mockReset} />);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Admin route error:', {
      message: 'Detailed error',
      name: 'Error',
      digest: undefined,
      stack: 'Error stack trace',
    });
  });

  it('should display error digest in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    const errorWithDigest = Object.assign(new Error('Test error'), {
      digest: 'abc123',
    });

    render(<AdminError error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText(/Error ID: abc123/i)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it('should not display error digest in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const errorWithDigest = Object.assign(new Error('Test error'), {
      digest: 'abc123',
    });

    render(<AdminError error={errorWithDigest} reset={mockReset} />);

    expect(screen.queryByText(/Error ID:/i)).not.toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it('should display default message for errors without message', () => {
    const errorWithoutMessage = new Error();
    errorWithoutMessage.message = '';

    render(<AdminError error={errorWithoutMessage} reset={mockReset} />);

    expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
  });

  it('should have AlertCircle icon', () => {
    const { container } = render(
      <AdminError error={mockError} reset={mockReset} />
    );

    // Check if the icon component is rendered (by checking for SVG)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
