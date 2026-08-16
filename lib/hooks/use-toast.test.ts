/**
 * Toast Hook Tests
 * Tests for the useToast hook and toast functions
 */

import { describe, it, expect, vi } from 'vitest';
import { toast } from './use-toast';
import * as sonner from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: vi.fn((message: string, options?: { duration?: number }) => {
    return { message, options };
  }),
}));

describe('toast utility', () => {
  it('should export toast object with all methods', () => {
    expect(toast).toBeDefined();
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.error).toBe('function');
    expect(typeof toast.info).toBe('function');
    expect(typeof toast.warning).toBe('function');
    expect(typeof toast.message).toBe('function');
  });

  it('should use correct default duration for success (4000ms)', () => {
    const mockToast = sonner.toast as unknown as { success: ReturnType<typeof vi.fn> };
    mockToast.success = vi.fn();
    
    toast.success('Success message');
    
    expect(mockToast.success).toHaveBeenCalledWith('Success message', {
      duration: 4000,
    });
  });

  it('should use correct default duration for error (5000ms)', () => {
    const mockToast = sonner.toast as unknown as { error: ReturnType<typeof vi.fn> };
    mockToast.error = vi.fn();
    
    toast.error('Error message');
    
    expect(mockToast.error).toHaveBeenCalledWith('Error message', {
      duration: 5000,
    });
  });

  it('should allow custom duration', () => {
    const mockToast = sonner.toast as unknown as { info: ReturnType<typeof vi.fn> };
    mockToast.info = vi.fn();
    
    toast.info('Info message', 10000);
    
    expect(mockToast.info).toHaveBeenCalledWith('Info message', {
      duration: 10000,
    });
  });
});
