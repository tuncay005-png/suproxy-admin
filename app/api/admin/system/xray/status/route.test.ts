/**
 * Tests for Xray Status API Route
 * 
 * @module app/api/admin/system/xray/status/route.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock session config
vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE_CONFIG: {
    name: 'session_token',
  },
}));

describe('GET /api/admin/system/xray/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8000';
  });

  it('should return 401 when session token is missing', async () => {
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should return 500 when backend URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-token' }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Server configuration error');
  });

  it('should fetch Xray status from backend and return with UTF-8 charset', async () => {
    const mockXrayStatus = {
      success: true,
      data: {
        status: 'running',
        version: '1.8.4',
        traffic_speed: 1024000,
        traffic_total: 10737418240,
        active_connections: 42,
        uptime: 86400,
        last_restart: '2025-01-10T12:00:00Z',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockXrayStatus,
    });

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-token' }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockXrayStatus);
    expect(response.headers.get('Content-Type')).toContain('charset=utf-8');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/admin/system/xray/status',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json; charset=utf-8',
        }),
      })
    );
  });

  it('should normalize status values from backend', async () => {
    const mockXrayStatus = {
      success: true,
      data: {
        status: 'ACTIVE', // Backend returns uppercase
        version: '1.8.4',
        traffic_speed: 1024000,
        traffic_total: 10737418240,
        active_connections: 42,
        uptime: 86400,
        last_restart: '2025-01-10T12:00:00Z',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockXrayStatus,
    });

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-token' }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.status).toBe('running'); // Normalized to 'running'
  });

  it('should handle stopped status mapping', async () => {
    const mockXrayStatus = {
      success: true,
      data: {
        status: 'offline',
        version: '1.8.4',
        traffic_speed: 0,
        traffic_total: 10737418240,
        active_connections: 0,
        uptime: 0,
        last_restart: null,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockXrayStatus,
    });

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-token' }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.status).toBe('stopped'); // Normalized to 'stopped'
  });

  it('should handle error status mapping', async () => {
    const mockXrayStatus = {
      success: true,
      data: {
        status: 'failed',
        version: '1.8.4',
        traffic_speed: 0,
        traffic_total: 10737418240,
        active_connections: 0,
        uptime: 0,
        last_restart: '2025-01-10T12:00:00Z',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockXrayStatus,
    });

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-token' }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.status).toBe('error'); // Normalized to 'error'
  });

  it('should handle backend errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Backend error' }),
    });

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-token' }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Backend error');
  });

  it('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'test-token' }),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/admin/system/xray/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An unexpected error occurred');
  });
});
