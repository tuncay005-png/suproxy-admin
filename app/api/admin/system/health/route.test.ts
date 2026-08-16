/**
 * Unit Tests for System Health API Route
 * 
 * Tests the proxy route for system health endpoint.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { cookies } from 'next/headers';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('GET /api/admin/system/health', () => {
  const mockSessionToken = 'mock-session-token';
  const mockBackendUrl = 'http://localhost:8080';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = mockBackendUrl;
    
    // Mock cookies to return session token
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => 
        name === 'session_token' ? { name, value: mockSessionToken } : undefined
      ),
    } as any);
  });

  it('should return 401 when session token is missing', async () => {
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn(() => undefined),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should return 500 when NEXT_PUBLIC_API_BASE_URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const request = new NextRequest('http://localhost:3000/api/admin/system/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Server configuration error');
  });

  it('should successfully proxy request to backend', async () => {
    const mockHealthData = {
      status: 'healthy',
      database: 'connected',
      timestamp: '2024-01-01T00:00:00Z',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockHealthData,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/admin/system/health');
    const response = await GET(request);
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith(
      `${mockBackendUrl}/api/v1/admin/system/health`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockSessionToken}`,
          'Content-Type': 'application/json',
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(data).toEqual(mockHealthData);
  });

  it('should handle backend errors gracefully', async () => {
    const mockErrorResponse = {
      message: 'Backend service unavailable',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => mockErrorResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/admin/system/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Backend service unavailable');
  });

  it('should handle fetch exceptions', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/admin/system/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An unexpected error occurred');
  });
});
