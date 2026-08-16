/**
 * Session Detail API Route Tests
 * 
 * Tests for DELETE /api/auth/sessions/[id] endpoint
 * 
 * @module app/api/auth/sessions/[id]/route.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DELETE } from './route';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Mock dependencies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('DELETE /api/auth/sessions/[id]', () => {
  const mockSessionToken = 'test-session-token';
  const mockBackendUrl = 'http://localhost:8080';
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    // Set up environment
    process.env.NEXT_PUBLIC_API_BASE_URL = mockBackendUrl;

    // Mock cookies
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => 
        name === 'session_token' ? { name, value: mockSessionToken } : undefined
      ),
    } as any);

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
  });

  it('returns 401 when session token is missing', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => undefined),
    } as any);

    const request = new NextRequest('http://localhost:3000/api/auth/sessions/session-123');
    const context = { params: Promise.resolve({ id: 'session-123' }) };
    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('returns 500 when backend URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const request = new NextRequest('http://localhost:3000/api/auth/sessions/session-123');
    const context = { params: Promise.resolve({ id: 'session-123' }) };
    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Server configuration error');
  });

  it('successfully revokes a session', async () => {
    const mockBackendResponse = {
      success: true,
      message: 'Session revoked successfully',
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockBackendResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/auth/sessions/session-123');
    const context = { params: Promise.resolve({ id: 'session-123' }) };
    const response = await DELETE(request, context);
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      `${mockBackendUrl}/api/v1/auth/sessions/session-123`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockSessionToken}`,
          'Content-Type': 'application/json',
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(data).toEqual(mockBackendResponse);
  });

  it('handles 404 when session not found', async () => {
    const mockErrorResponse = {
      message: 'Session not found',
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => mockErrorResponse,
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/auth/sessions/nonexistent');
    const context = { params: Promise.resolve({ id: 'nonexistent' }) };
    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Session not found');
  });

  it('handles 403 when access is denied', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as Response);

    const request = new NextRequest('http://localhost:3000/api/auth/sessions/session-123');
    const context = { params: Promise.resolve({ id: 'session-123' }) };
    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Access denied. You do not have permission to revoke this session.');
  });

  it('handles network errors', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/auth/sessions/session-123');
    const context = { params: Promise.resolve({ id: 'session-123' }) };
    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Connection failed. Check if backend is running.');
  });

  it('forwards session ID from params to backend', async () => {
    const sessionId = 'test-session-id-456';

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const request = new NextRequest(`http://localhost:3000/api/auth/sessions/${sessionId}`);
    const context = { params: Promise.resolve({ id: sessionId }) };
    await DELETE(request, context);

    expect(global.fetch).toHaveBeenCalledWith(
      `${mockBackendUrl}/api/v1/auth/sessions/${sessionId}`,
      expect.any(Object)
    );
  });
});
