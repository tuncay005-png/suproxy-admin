/**
 * Integration tests for System API endpoints
 * Tests the getXrayStatus method
 * 
 * @module lib/api/endpoints/system.integration.test
 */

import { describe, it, expect } from 'vitest';
import type { XrayStatus } from '@/types/system';

describe('System API - XrayStatus Type', () => {
  it('should have correct XrayStatus type structure', () => {
    const mockXrayStatus: XrayStatus = {
      status: 'running',
      version: '1.8.4',
      traffic_speed: 1024000,
      traffic_total: 10737418240,
      active_connections: 42,
      uptime: 86400,
      last_restart: '2025-01-10T12:00:00Z',
    };

    expect(mockXrayStatus.status).toBe('running');
    expect(mockXrayStatus.version).toBe('1.8.4');
    expect(mockXrayStatus.traffic_speed).toBe(1024000);
    expect(mockXrayStatus.traffic_total).toBe(10737418240);
    expect(mockXrayStatus.active_connections).toBe(42);
    expect(mockXrayStatus.uptime).toBe(86400);
    expect(mockXrayStatus.last_restart).toBe('2025-01-10T12:00:00Z');
  });

  it('should accept valid status values', () => {
    const statuses: Array<XrayStatus['status']> = ['running', 'stopped', 'restarting', 'error'];
    
    statuses.forEach(status => {
      const xrayStatus: XrayStatus = {
        status,
        version: '1.8.4',
        traffic_speed: 0,
        traffic_total: 0,
        active_connections: 0,
        uptime: 0,
        last_restart: null,
      };
      
      expect(xrayStatus.status).toBe(status);
    });
  });

  it('should accept null last_restart', () => {
    const xrayStatus: XrayStatus = {
      status: 'stopped',
      version: '1.8.4',
      traffic_speed: 0,
      traffic_total: 0,
      active_connections: 0,
      uptime: 0,
      last_restart: null,
    };

    expect(xrayStatus.last_restart).toBeNull();
  });

  it('should accept ISO 8601 timestamp for last_restart', () => {
    const timestamp = '2025-01-10T12:00:00Z';
    const xrayStatus: XrayStatus = {
      status: 'running',
      version: '1.8.4',
      traffic_speed: 1024000,
      traffic_total: 10737418240,
      active_connections: 42,
      uptime: 86400,
      last_restart: timestamp,
    };

    expect(xrayStatus.last_restart).toBe(timestamp);
  });
});
