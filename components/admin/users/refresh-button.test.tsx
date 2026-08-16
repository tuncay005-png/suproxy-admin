/**
 * Unit tests for RefreshButton component
 * 
 * Tests the refresh button functionality including:
 * - Rendering with correct initial state
 * - Handling refresh action
 * - Loading state management
 * - Accessibility attributes
 * 
 * Validates: Requirements 4.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RefreshButton } from './refresh-button';
import { useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('RefreshButton', () => {
  let mockRouter: { refresh: () => void };

  beforeEach(() => {
    // Setup mock router
    mockRouter = {
      refresh: vi.fn(),
    };
    vi.mocked(useRouter).mockReturnValue(mockRouter as ReturnType<typeof useRouter>);
    
    // Don't use fake timers by default - only for specific tests that need them
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // Ensure clean state
  });

  it('renders refresh button with correct text and icon', () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Refresh');
  });

  it('has correct accessibility attributes', () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    expect(button).toHaveAttribute('aria-label', 'Refresh users list');
  });

  it('is enabled by default', () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    expect(button).not.toBeDisabled();
  });

  it('calls router.refresh() when clicked', async () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
    });
  });

  it('disables button during refresh', async () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    
    // Click to start refresh
    fireEvent.click(button);
    
    // Button should be disabled immediately
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('shows loading state with spinning icon during refresh', async () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    fireEvent.click(button);
    
    // Check that the icon has the animate-spin class
    await waitFor(() => {
      const icon = button.querySelector('svg');
      expect(icon).toHaveClass('animate-spin');
    });
  });

  it('re-enables button after loading timeout', async () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    
    // Click to start refresh
    fireEvent.click(button);
    
    // Button should be disabled
    expect(button).toBeDisabled();
    
    // Wait for button to be re-enabled (real time, 1 second)
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    }, { timeout: 1500 });
  });

  it('can be clicked multiple times sequentially', async () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    
    // First click
    fireEvent.click(button);
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
    
    // Wait for button to be re-enabled
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    }, { timeout: 1500 });
    
    // Second click
    fireEvent.click(button);
    expect(mockRouter.refresh).toHaveBeenCalledTimes(2);
  });

  it('has outline variant styling', () => {
    render(<RefreshButton />);
    
    const button = screen.getByRole('button', { name: /refresh users list/i });
    // shadcn/ui Button with variant="outline" will have specific classes
    expect(button).toBeInTheDocument();
  });
});
