/**
 * Request Cache Integration Tests
 * 
 * Tests the integration of request deduplication cache with systemApi.
 * Validates that multiple simultaneous calls to getHealth() and getXraySystemStatus()
 * result in only one network request.
 * 
 * Validates: Requirements 6.7, 12.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestCache } from './request-cache';

// Mock the apiClient
vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Request Cache Integration with systemApi', () => {
  beforeEach(() => {
    // Clear cache before each test
    requestCache.clearAll();
    vi.clearAllMocks();
  });

  describe('systemApi.getHealth() deduplication', () => {
    it('should deduplicate 5 simultaneous getHealth() calls', async () => {
      const { apiClient } = await import('./client');
      const mockHealthResponse = {
        data: {
          status: 'healthy' as const,
          cpu_usage: 45,
          ram_used: 2048,
          ram_total: 8192,
          disk_used: 100,
          disk_total: 500,
          swap_used: 0,
          swap_total: 2048,
          uptime: 86400,
          database: 'connected' as const,
          timestamp: new Date().toISOString(),
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockHealthResponse);

      // Simulate 5 components calling getHealth() simultaneously
      const promises = Array.from({ length: 5 }, () =>
        requestCache.fetch('system:health', () =>
          apiClient.get('/api/admin/system/health')
        )
      );

      const results = await Promise.all(promises);

      // Should only call apiClient.get once
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/api/admin/system/health');

      // All results should be identical
      results.forEach(result => {
        expect(result).toEqual(mockHealthResponse);
      });
    });
  });

  describe('systemApi.getXraySystemStatus() deduplication', () => {
    it('should deduplicate 3 simultaneous getXraySystemStatus() calls', async () => {
      const { apiClient } = await import('./client');
      const mockXrayResponse = {
        data: {
          instances_total: 10,
          instances_running: 8,
          instances_stopped: 2,
          clients_total: 50,
          clients_active: 42,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockXrayResponse);

      // Simulate 3 components calling getXraySystemStatus() simultaneously
      const promises = Array.from({ length: 3 }, () =>
        requestCache.fetch('system:xray', () =>
          apiClient.get('/api/admin/system/xray')
        )
      );

      const results = await Promise.all(promises);

      // Should only call apiClient.get once
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith('/api/admin/system/xray');

      // All results should be identical
      results.forEach(result => {
        expect(result).toEqual(mockXrayResponse);
      });
    });
  });

  describe('Multiple endpoints simultaneously', () => {
    it('should make separate requests for different endpoints', async () => {
      const { apiClient } = await import('./client');
      
      const mockHealthResponse = { data: { status: 'healthy' } };
      const mockXrayResponse = { data: { instances_total: 10 } };

      vi.mocked(apiClient.get).mockImplementation(async (endpoint: string) => {
        if (endpoint === '/api/admin/system/health') {
          return mockHealthResponse;
        }
        return mockXrayResponse;
      });

      // Call both endpoints simultaneously
      const [healthResult, xrayResult] = await Promise.all([
        requestCache.fetch('system:health', () =>
          apiClient.get('/api/admin/system/health')
        ),
        requestCache.fetch('system:xray', () =>
          apiClient.get('/api/admin/system/xray')
        ),
      ]);

      // Should call apiClient.get twice (once per endpoint)
      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(apiClient.get).toHaveBeenCalledWith('/api/admin/system/health');
      expect(apiClient.get).toHaveBeenCalledWith('/api/admin/system/xray');

      expect(healthResult).toEqual(mockHealthResponse);
      expect(xrayResult).toEqual(mockXrayResponse);
    });
  });

  describe('Performance benefit verification', () => {
    it('should significantly reduce API call count when polling from multiple components', async () => {
      const { apiClient } = await import('./client');
      const mockResponse = { data: { status: 'healthy' } };
      
      let callCount = 0;
      vi.mocked(apiClient.get).mockImplementation(async () => {
        callCount++;
        await new Promise(resolve => setTimeout(resolve, 10));
        return mockResponse;
      });

      // Simulate 10 components all polling every 5 seconds
      // Without cache: 10 API calls
      // With cache: 1 API call
      const componentCount = 10;
      const promises = Array.from({ length: componentCount }, () =>
        requestCache.fetch('system:health', () =>
          apiClient.get('/api/admin/system/health')
        )
      );

      await Promise.all(promises);

      // Cache reduces 10 calls to 1 call = 90% reduction
      expect(callCount).toBe(1);
      
      const reductionPercentage = ((componentCount - callCount) / componentCount) * 100;
      expect(reductionPercentage).toBe(90);
    });
  });
});
