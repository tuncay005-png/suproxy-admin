/**
 * User Subscription Route Tests
 * 
 * Tests the GET /api/subscriptions/user/:userId endpoint
 * Ensures proper proxy behavior and handling of no-subscription case
 * 
 * @module app/api/subscriptions/user/[userId]/route.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Mock Next.js cookies module
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('GET /api/subscriptions/user/:userId', () => {
  const mockSessionToken = 'test-session-token';
  const mockUserId = 'user-123';
  const mockBackendUrl = 'http://localhost:8080';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = mockBackendUrl;

    // Mock cookies
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => 
        name === 'session_token' ? { name, value: mockSessionToken } : undefined
      ),
    } as any);
  });

  it('should forward request to backend with session token', async () => {
    const mockSubscription = {
      id: 'sub-123',
      user_id: mockUserId,
      plan_id: 'plan-123',
      plan_name: 'Premium',
      status: 'active',
      start_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T23:59:59Z',
      data_used_gb: 50,
      data_limit_gb: 100,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: mockSubscription }),
    } as Response);

    const request = new NextRequest(
      `http://localhost:3000/api/subscriptions/user/${mockUserId}`
    );
    const params = Promise.resolve({ userId: mockUserId });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${mockBackendUrl}/api/v1/subscriptions/user/${mockUserId}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockSessionToken}`,
          'Content-Type': 'application/json',
        }),
      })
    );

    expect(data).toEqual({ data: mockSubscription });
  });

  it('should handle user with no subscription', async () => {
    // Backend returns null or empty object when no subscription
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: null }),
    } as Response);

    const request = new NextRequest(
      `http://localhost:3000/api/subscriptions/user/${mockUserId}`
    );
    const params = Promise.resolve({ userId: mockUserId });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(data).toEqual({ data: null });
  });

  it('should return 401 when session token is missing', async () => {
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn(() => undefined),
    } as any);

    const request = new NextRequest(
      `http://localhost:3000/api/subscriptions/user/${mockUserId}`
    );
    const params = Promise.resolve({ userId: mockUserId });

    const response = await GET(request, { params });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: 'Authentication required',
    });
  });

  it('should return 500 when backend URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const request = new NextRequest(
      `http://localhost:3000/api/subscriptions/user/${mockUserId}`
    );
    const params = Promise.resolve({ userId: mockUserId });

    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Server configuration error',
    });
  });

  it('should handle backend errors gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: 'User not found' }),
    } as Response);

    const request = new NextRequest(
      `http://localhost:3000/api/subscriptions/user/${mockUserId}`
    );
    const params = Promise.resolve({ userId: mockUserId });

    const response = await GET(request, { params });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: 'User not found',
    });
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest(
      `http://localhost:3000/api/subscriptions/user/${mockUserId}`
    );
    const params = Promise.resolve({ userId: mockUserId });

    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'An unexpected error occurred',
    });
  });
});
