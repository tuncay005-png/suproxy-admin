/**
 * LoadingButton Component Tests
 * 
 * Tests for the LoadingButton component to ensure proper loading state behavior.
 * 
 * Validates: Requirements 14.3, 13.9, 16.4
 */

import { render, screen } from '@testing-library/react';
import { LoadingButton } from './loading-button';

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(<LoadingButton>Submit</LoadingButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Submit');
  });

  it('displays loading spinner when isLoading is true', () => {
    render(<LoadingButton isLoading>Submit</LoadingButton>);
    const button = screen.getByRole('button');
    
    // Check that button is disabled
    expect(button).toBeDisabled();
    
    // Check that spinner icon is present (by checking for the svg with animation class)
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays custom loading text when provided', () => {
    render(
      <LoadingButton isLoading loadingText="Creating...">
        Create User
      </LoadingButton>
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Creating...');
  });

  it('displays children as loading text when loadingText is not provided', () => {
    render(<LoadingButton isLoading>Submit</LoadingButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Submit');
  });

  it('is disabled when isLoading is true', () => {
    render(<LoadingButton isLoading>Submit</LoadingButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true even if not loading', () => {
    render(<LoadingButton disabled>Submit</LoadingButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports all button variants', () => {
    const { rerender } = render(
      <LoadingButton variant="destructive">Delete</LoadingButton>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<LoadingButton variant="outline">Cancel</LoadingButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports all button sizes', () => {
    const { rerender } = render(<LoadingButton size="sm">Small</LoadingButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<LoadingButton size="lg">Large</LoadingButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <LoadingButton type="submit" className="custom-class">
        Submit
      </LoadingButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('custom-class');
  });
});
