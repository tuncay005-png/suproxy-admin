/**
 * Sessions API Route Tests
 * 
 * Tests for GET /api/auth/sessions and POST /api/auth/sessions endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('/api/auth/sessions', () => {
  const mockSessionToken = 'test-session-token';
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

  describe('GET /api/auth/sessions', () => {
    it('should return sessions list on successful request', async () => {
      const mockSessions = {
        data: {
          sessions: [
            {
              id: '1',
              user_id: 'user1',
              username: 'testuser',
              email: 'test@example.com',
              ip_address: '127.0.0.1',
              user_agent: 'Mozilla/5.0',
              created_at: '2024-01-01T00:00:00Z',
              last_activity_at: '2024-01-01T01:00:00Z',
              expires_at: '2024-01-02T00:00:00Z',
            },
          ],
          total: 1,
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSessions,
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/auth/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/auth/sessions`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSessionToken}`,
          }),
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(mockSessions);
    });

    it('should return 401 when session token is missing', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle backend errors gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/auth/sessions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/auth/sessions (logout-all)', () => {
    it('should revoke all sessions successfully', async () => {
      const mockBody = { user_id: 'user123' };
      const mockResponse = {
        success: true,
        message: 'All sessions revoked successfully',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/auth/sessions', {
        method: 'POST',
        body: JSON.stringify(mockBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/auth/logout-all`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSessionToken}`,
          }),
          body: JSON.stringify(mockBody),
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(mockResponse);
    });

    it('should return 401 when session token is missing', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/sessions', {
        method: 'POST',
        body: JSON.stringify({ user_id: 'user123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle 400 errors with user-friendly message', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'User ID is required' }),
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/auth/sessions', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('User ID is required');
    });
  });
});
