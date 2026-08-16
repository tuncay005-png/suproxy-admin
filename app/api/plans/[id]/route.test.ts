/**
 * Plan Detail API Route Tests
 * 
 * Tests for GET, PUT, DELETE /api/plans/[id] endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('/api/plans/[id]', () => {
  const mockSessionToken = 'test-session-token';
  const mockBackendUrl = 'http://localhost:8080';
  const mockPlanId = 'plan-123';

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

  describe('GET /api/plans/[id]', () => {
    it('should fetch plan details successfully', async () => {
      const mockPlan = {
        id: mockPlanId,
        name: 'Premium Plan',
        description: 'Premium subscription plan',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
        active_subscriptions: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPlan,
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/plans/${mockPlanId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSessionToken}`,
          }),
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(mockPlan);
    });

    it('should return 401 when session token is missing', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined),
      } as any);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle 404 when plan not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Plan not found' }),
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Plan not found');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('An unexpected error occurred');
    });
  });

  describe('PUT /api/plans/[id]', () => {
    const updateData = {
      name: 'Updated Premium Plan',
      price: 39.99,
      description: 'Updated premium subscription plan',
    };

    it('should update plan successfully', async () => {
      const mockUpdatedPlan = {
        id: mockPlanId,
        ...updateData,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
        active_subscriptions: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUpdatedPlan,
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/plans/${mockPlanId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSessionToken}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(updateData),
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedPlan);
    });

    it('should return 401 when session token is missing', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined),
      } as any);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle 400 validation errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid price value' }),
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ price: -10 }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid price value');
    });

    it('should handle 404 when plan not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Plan not found' }),
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Plan not found');
    });
  });

  describe('DELETE /api/plans/[id]', () => {
    it('should delete plan successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Plan deleted successfully',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(fetch).toHaveBeenCalledWith(
        `${mockBackendUrl}/api/v1/plans/${mockPlanId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockSessionToken}`,
          }),
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(mockResponse);
    });

    it('should return 401 when session token is missing', async () => {
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined),
      } as any);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 400 when plan has active subscriptions', async () => {
      const mockError = {
        message: 'Cannot delete plan with active subscriptions',
        active_subscriptions: 5,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot delete plan with active subscriptions');
      expect(data.active_subscriptions).toBe(5);
    });

    it('should handle 404 when plan not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Plan not found' }),
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Plan not found');
    });

    it('should handle 403 when access is denied', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Access denied' }),
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Access denied');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('An unexpected error occurred');
    });
  });

  describe('Configuration errors', () => {
    it('should return 500 when NEXT_PUBLIC_API_BASE_URL is not configured (GET)', async () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server configuration error');
    });

    it('should return 500 when NEXT_PUBLIC_API_BASE_URL is not configured (PUT)', async () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated Plan' }),
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server configuration error');
    });

    it('should return 500 when NEXT_PUBLIC_API_BASE_URL is not configured (DELETE)', async () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const request = new NextRequest(
        `http://localhost:3000/api/plans/${mockPlanId}`,
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockPlanId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server configuration error');
    });
  });
});
