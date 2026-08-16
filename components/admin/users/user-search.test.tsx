/**
 * User Search Component Tests
 * 
 * Tests for the user search functionality including debouncing and callback behavior.
 * 
 * Validates: Requirements 4.3
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UserSearch } from './user-search';

describe('UserSearch', () => {
  it('renders search input with placeholder', () => {
    render(<UserSearch />);
    
    const input = screen.getByPlaceholderText(/search users by email, name, or role/i);
    expect(input).toBeInTheDocument();
  });

  it('displays search icon', () => {
    const { container } = render(<UserSearch />);
    
    // Search icon should be present (lucide-react Search component)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('updates input value when user types', async () => {
    const user = userEvent.setup();
    render(<UserSearch />);
    
    const input = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    await user.type(input, 'test@example.com');
    
    expect(input).toHaveValue('test@example.com');
  });

  it('calls onSearchChange with debounced value', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    
    render(<UserSearch onSearchChange={onSearchChange} />);
    
    const input = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Type multiple characters quickly
    await user.type(input, 'test');
    
    // Should not call immediately
    expect(onSearchChange).not.toHaveBeenCalled();
    
    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('test');
    }, { timeout: 500 });
    
    // Should only call once after debounce
    expect(onSearchChange).toHaveBeenCalledTimes(1);
  });

  it('debounces rapid input changes', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    
    render(<UserSearch onSearchChange={onSearchChange} />);
    
    const input = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Type 'abc' rapidly
    await user.type(input, 'abc');
    
    // Wait for debounce to complete
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalled();
    }, { timeout: 500 });
    
    // Should have called with final value 'abc'
    expect(onSearchChange).toHaveBeenCalledWith('abc');
  });

  it('handles empty search input', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    
    render(<UserSearch onSearchChange={onSearchChange} />);
    
    const input = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Type and then clear
    await user.type(input, 'test');
    await user.clear(input);
    
    // Wait for debounce
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('');
    }, { timeout: 500 });
  });

  it('applies custom className when provided', () => {
    const { container } = render(<UserSearch className="custom-class" />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('works without onSearchChange callback', async () => {
    const user = userEvent.setup();
    
    // Should not throw error when callback is not provided
    render(<UserSearch />);
    
    const input = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    await expect(user.type(input, 'test')).resolves.not.toThrow();
  });

  it('cancels previous debounce timer when input changes', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    
    render(<UserSearch onSearchChange={onSearchChange} />);
    
    const input = screen.getByPlaceholderText(/search users by email, name, or role/i);
    
    // Type 'testing' in one go
    await user.type(input, 'testing');
    
    // Wait for debounce
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalled();
    }, { timeout: 500 });
    
    // Should be called with the final value
    expect(onSearchChange).toHaveBeenCalledWith('testing');
  });
});
