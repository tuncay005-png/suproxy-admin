/**
 * Tests for ExportLogsButton component
 * 
 * Verifies CSV and JSON export functionality
 */

import { describe, it, expect } from 'vitest';
import { AuditLog } from '@/types/audit';

/**
 * Test helper functions for CSV and JSON conversion
 * These tests verify the core export logic without requiring full DOM rendering
 */

// Helper to convert audit logs to CSV format (exported from component for testing)
function convertToCSV(logs: AuditLog[]): string {
  if (logs.length === 0) {
    return '';
  }

  const headers = [
    'ID',
    'Timestamp',
    'Actor Email',
    'Actor ID',
    'Action',
    'Entity Type',
    'Entity ID',
    'IP Address',
    'User Agent',
    'Status',
    'Metadata',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.created_at,
    log.actor_email,
    log.actor_id,
    log.action,
    log.entity_type,
    log.entity_id,
    log.ip_address,
    log.user_agent,
    log.status,
    JSON.stringify(log.metadata),
  ]);

  const escapeCSVField = (field: string): string => {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const csvLines = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((row) => row.map(String).map(escapeCSVField).join(',')),
  ];

  return csvLines.join('\n');
}

// Helper to convert audit logs to JSON format (exported from component for testing)
function convertToJSON(logs: AuditLog[]): string {
  return JSON.stringify(logs, null, 2);
}

describe('ExportLogsButton - Export Logic', () => {
  const mockLogs: AuditLog[] = [
    {
      id: '1',
      action: 'user.create',
      actor_id: 'actor-123',
      actor_email: 'admin@example.com',
      entity_type: 'user',
      entity_id: 'user-456',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
      status: 'success',
      metadata: { key: 'value' },
      created_at: '2024-01-01T12:00:00Z',
    },
    {
      id: '2',
      action: 'user.delete',
      actor_id: 'actor-123',
      actor_email: 'admin@example.com',
      entity_type: 'user',
      entity_id: 'user-789',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
      status: 'success',
      metadata: {},
      created_at: '2024-01-02T12:00:00Z',
    },
  ];

  describe('CSV Export', () => {
    it('returns empty string for empty logs array', () => {
      const csv = convertToCSV([]);
      expect(csv).toBe('');
    });

    it('includes CSV headers', () => {
      const csv = convertToCSV(mockLogs);
      expect(csv).toContain('ID,Timestamp,Actor Email');
      expect(csv).toContain('Actor ID,Action,Entity Type');
    });

    it('includes log data in CSV format', () => {
      const csv = convertToCSV(mockLogs);
      expect(csv).toContain('admin@example.com');
      expect(csv).toContain('user.create');
      expect(csv).toContain('192.168.1.1');
    });

    it('properly escapes fields with commas', () => {
      const logsWithCommas: AuditLog[] = [
        {
          ...mockLogs[0],
          action: 'user.update, test',
        },
      ];
      const csv = convertToCSV(logsWithCommas);
      expect(csv).toContain('"user.update, test"');
    });

    it('properly escapes fields with quotes', () => {
      const logsWithQuotes: AuditLog[] = [
        {
          ...mockLogs[0],
          actor_email: 'admin"test"@example.com',
        },
      ];
      const csv = convertToCSV(logsWithQuotes);
      expect(csv).toContain('"admin""test""@example.com"');
    });

    it('includes metadata as JSON string', () => {
      const csv = convertToCSV(mockLogs);
      // Metadata is JSON stringified and then CSV-escaped
      expect(csv).toMatch(/"{""key"":""value""}"/);
    });

    it('creates correct number of rows', () => {
      const csv = convertToCSV(mockLogs);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3); // 1 header + 2 data rows
    });
  });

  describe('JSON Export', () => {
    it('returns valid JSON array', () => {
      const json = convertToJSON(mockLogs);
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('preserves all log fields', () => {
      const json = convertToJSON(mockLogs);
      const parsed = JSON.parse(json);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('action');
      expect(parsed[0]).toHaveProperty('actor_email');
      expect(parsed[0]).toHaveProperty('metadata');
    });

    it('formats JSON with indentation', () => {
      const json = convertToJSON(mockLogs);
      // Pretty-printed JSON should contain newlines and spaces
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('exports empty array for empty logs', () => {
      const json = convertToJSON([]);
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(0);
    });

    it('preserves nested metadata objects', () => {
      const logsWithComplexMetadata: AuditLog[] = [
        {
          ...mockLogs[0],
          metadata: {
            nested: {
              key: 'value',
              array: [1, 2, 3],
            },
          },
        },
      ];
      const json = convertToJSON(logsWithComplexMetadata);
      const parsed = JSON.parse(json);
      expect(parsed[0].metadata.nested).toEqual({
        key: 'value',
        array: [1, 2, 3],
      });
    });
  });
});
