/**
 * Unit tests for Audit Stats API Route
 * 
 * Tests the proxy route implementation for audit statistics endpoint
 * Validates: Requirements 9.9, 11.6
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

describe('Audit Stats API Route', () => {
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

  describe('GET /api/admin/audit/stats', () => {
    it('should return 401 if session token is missing', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/audit/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should forward request to backend with authentication', async () => {
      // Mock backend response structure (what backend actually returns)
      const mockBackendResponse = {
        success: true,
        data: {
          total_logs: 150,
          logs_by_action: {
            'user.create': 25,
            'user.update': 40,
            'user.delete': 5,
            'xray.client.create': 30,
            'xray.client.delete': 10,
            'plan.create': 5,
            'plan.update': 15,
            'system.config': 20,
          },
        },
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBackendResponse,
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/admin/audit/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/admin/audit/stats`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSessionToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(response.status).toBe(200);
      expect(data.data.total_actions).toBe(150);
      expect(data.data.actions_by_type['user.create']).toBe(25);
      expect(data.data.recent_activity_count).toBe(150);
    });

    it('should handle backend errors gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Insufficient permissions' }),
      } as Response);

      const request = new NextRequest('http://localhost:3000/api/admin/audit/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection timeout'));

      const request = new NextRequest('http://localhost:3000/api/admin/audit/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('An unexpected error occurred');
    });

    it('should return 500 if backend URL is not configured', async () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const request = new NextRequest('http://localhost:3000/api/admin/audit/stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server configuration error');
    });
  });
});