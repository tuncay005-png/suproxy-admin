/**
 * Unit tests for Audit Logs API Route
 * 
 * Tests the proxy route implementation for audit logs endpoints
 * Validates: Requirements 9.1, 9.3-9.5, 11.6
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

describe('Audit Logs API Route', () => {
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

  describe('GET /api/admin/audit/logs', () => {
    it('should return 401 if session token is missing', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/audit/logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should forward request to backend with authentication', async () => {
      const mockLogs = {
        logs: [
          {
            id: '1',
            action: 'user.create',
            actor_id: 'admin-1',
            actor_email: 'admin@example.com',
            entity_type: 'user',
            entity_id: 'user-1',
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0',
            status: 'success',
            metadata: {},
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        offset: 0,
        limit: 25,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockLogs,
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/admin/audit/logs');
      const response = await GET(request);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/admin/audit/logs`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSessionToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(response.status).toBe(200);
      expect(data.logs).toHaveLength(1);
      expect(data.logs[0].action).toBe('user.create');
    });

    it('should forward query parameters to backend', async () => {
      const mockLogs = {
        logs: [],
        total: 0,
        offset: 0,
        limit: 10,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockLogs,
      } as Response);

      const queryParams = new URLSearchParams({
        page: '2',
        limit: '10',
        action: 'user.create',
        entity_type: 'user',
        actor_id: 'admin-1',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
      });

      const request = new NextRequest(
        `http://localhost:3000/api/admin/audit/logs?${queryParams.toString()}`
      );
      await GET(request);

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/admin/audit/logs?${queryParams.toString()}`,
        expect.any(Object)
      );
    });

    it('should handle backend errors gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Database connection failed' }),
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/admin/audit/logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/admin/audit/logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('An unexpected error occurred');
    });

    it('should return 500 if backend URL is not configured', async () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const request = new NextRequest('http://localhost:3000/api/admin/audit/logs');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server configuration error');
    });
  });
});
