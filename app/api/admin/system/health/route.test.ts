/**
 * Unit Tests for System Health API Route
 * 
 * Tests the proxy route for system health endpoint.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock fetch
global.fetch = vi.fn();

describe('GET /api/admin/system/health', () => {
  const mockSessionToken = 'mock-session-token';
  const mockBackendUrl = 'http://localhost:8080';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = mockBackendUrl;
  });

  it('should return 401 when session token is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/system/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
    expect(data.error.message).toBe('Authentication required');
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('should return 500 when NEXT_PUBLIC_API_BASE_URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    
    const request = new NextRequest('http://localhost:3000/api/admin/system/health', {
      headers: {
        'cookie': `session_token=${mockSessionToken}`,
      },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CONFIG_ERROR');
    expect(data.error.message).toBe('Server configuration error');
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
  });

  it('should successfully proxy request to backend with enhanced health data', async () => {
    const mockHealthData = {
      success: true,
      data: {
        status: 'healthy',
        cpu_usage: 45.2,
        ram_used: 4096,
        ram_total: 16384,
        disk_used: 120.5,
        disk_total: 500.0,
        swap_used: 512,
        swap_total: 2048,
        uptime: 86400,
        database: 'connected',
        timestamp: '2024-01-01T00:00:00Z',
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockHealthData,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/admin/system/health', {
      headers: {
        'cookie': `session_token=${mockSessionToken}`,
      },
    });
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
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    expect(data).toEqual(mockHealthData);
    expect(data.data.cpu_usage).toBe(45.2);
    expect(data.data.ram_used).toBe(4096);
    expect(data.data.uptime).toBe(86400);
  });

  it('should handle backend errors gracefully', async () => {
    const mockErrorResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Backend service unavailable',
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => mockErrorResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/admin/system/health', {
      headers: {
        'cookie': `session_token=${mockSessionToken}`,
      },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Backend service unavailable');
  });

  it('should handle fetch exceptions', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/admin/system/health', {
      headers: {
        'cookie': `session_token=${mockSessionToken}`,
      },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(data.error.message).toBe('An unexpected error occurred');
  });
});
