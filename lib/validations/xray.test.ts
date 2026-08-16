import { describe, it, expect } from 'vitest';
import {
  createInboundSchema,
  createClientSchema,
  CreateInboundFormData,
  CreateClientFormData,
} from './xray';

describe('Xray Validation Schemas', () => {
  describe('createInboundSchema', () => {
    it('should validate a valid inbound configuration', () => {
      const validData = {
        instance_id: 'instance-123',
        protocol: 'vless' as const,
        port: 8080,
        tag: 'my-inbound-1',
        settings: { foo: 'bar' },
      };

      const result = createInboundSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate without optional settings', () => {
      const validData = {
        instance_id: 'instance-123',
        protocol: 'vmess' as const,
        port: 443,
        tag: 'vmess_inbound',
      };

      const result = createInboundSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing instance_id', () => {
      const invalidData = {
        protocol: 'vless',
        port: 8080,
        tag: 'tag1',
      };

      const result = createInboundSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod will return a generic "Required" or "Invalid input" error for missing fields
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject invalid protocol', () => {
      const invalidData = {
        instance_id: 'instance-123',
        protocol: 'invalid',
        port: 8080,
        tag: 'tag1',
      };

      const result = createInboundSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Protocol must be one of');
      }
    });

    it('should accept all valid protocols', () => {
      const protocols = ['vless', 'vmess', 'trojan', 'shadowsocks'];
      
      protocols.forEach((protocol) => {
        const data = {
          instance_id: 'instance-123',
          protocol: protocol as any,
          port: 8080,
          tag: 'tag1',
        };

        const result = createInboundSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('port validation', () => {
      it('should reject port less than 1', () => {
        const invalidData = {
          instance_id: 'instance-123',
          protocol: 'vless',
          port: 0,
          tag: 'tag1',
        };

        const result = createInboundSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Port must be between 1 and 65535');
        }
      });

      it('should reject port greater than 65535', () => {
        const invalidData = {
          instance_id: 'instance-123',
          protocol: 'vless',
          port: 65536,
          tag: 'tag1',
        };

        const result = createInboundSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Port must be between 1 and 65535');
        }
      });

      it('should accept port 1', () => {
        const validData = {
          instance_id: 'instance-123',
          protocol: 'vless' as const,
          port: 1,
          tag: 'tag1',
        };

        const result = createInboundSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should accept port 65535', () => {
        const validData = {
          instance_id: 'instance-123',
          protocol: 'vless' as const,
          port: 65535,
          tag: 'tag1',
        };

        const result = createInboundSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject non-integer port', () => {
        const invalidData = {
          instance_id: 'instance-123',
          protocol: 'vless',
          port: 8080.5,
          tag: 'tag1',
        };

        const result = createInboundSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('integer');
        }
      });

      it('should reject missing port', () => {
        const invalidData = {
          instance_id: 'instance-123',
          protocol: 'vless',
          tag: 'tag1',
        };

        const result = createInboundSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          // Zod will return a generic "Required" or "Invalid input" error for missing fields
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    describe('tag validation', () => {
      it('should accept alphanumeric tags', () => {
        const validData = {
          instance_id: 'instance-123',
          protocol: 'vless' as const,
          port: 8080,
          tag: 'abc123XYZ',
        };

        const result = createInboundSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should accept tags with hyphens', () => {
        const validData = {
          instance_id: 'instance-123',
          protocol: 'vless' as const,
          port: 8080,
          tag: 'my-tag-123',
        };

        const result = createInboundSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should accept tags with underscores', () => {
        const validData = {
          instance_id: 'instance-123',
          protocol: 'vless' as const,
          port: 8080,
          tag: 'my_tag_123',
        };

        const result = createInboundSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should accept tags with mixed alphanumeric, hyphens, and underscores', () => {
        const validData = {
          instance_id: 'instance-123',
          protocol: 'vless' as const,
          port: 8080,
          tag: 'my-tag_123-ABC_xyz',
        };

        const result = createInboundSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject tags with spaces', () => {
        const invalidData = {
          instance_id: 'instance-123',
          protocol: 'vless',
          port: 8080,
          tag: 'my tag',
        };

        const result = createInboundSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('alphanumeric characters, hyphens, and underscores');
        }
      });

      it('should reject tags with special characters', () => {
        const invalidData = {
          instance_id: 'instance-123',
          protocol: 'vless',
          port: 8080,
          tag: 'my@tag!',
        };

        const result = createInboundSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('alphanumeric characters, hyphens, and underscores');
        }
      });

      it('should reject empty tag', () => {
        const invalidData = {
          instance_id: 'instance-123',
          protocol: 'vless',
          port: 8080,
          tag: '',
        };

        const result = createInboundSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Tag is required');
        }
      });
    });

    it('should accept settings as optional object', () => {
      const validData = {
        instance_id: 'instance-123',
        protocol: 'vless' as const,
        port: 8080,
        tag: 'tag1',
        settings: {
          flow: 'xtls-rprx-direct',
          encryption: 'none',
        },
      };

      const result = createInboundSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('createClientSchema', () => {
    it('should validate a valid client configuration', () => {
      const validData = {
        email: 'user@example.com',
        inbound_id: 'inbound-123',
        settings: { foo: 'bar' },
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate without optional settings', () => {
      const validData = {
        email: 'user@example.com',
        inbound_id: 'inbound-123',
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        inbound_id: 'inbound-123',
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email address');
      }
    });

    it('should reject missing email', () => {
      const invalidData = {
        inbound_id: 'inbound-123',
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing inbound_id', () => {
      const invalidData = {
        email: 'user@example.com',
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty inbound_id', () => {
      const invalidData = {
        email: 'user@example.com',
        inbound_id: '',
      };

      const result = createClientSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Inbound ID is required');
      }
    });

    it('should accept settings as optional object', () => {
      const validData = {
        email: 'user@example.com',
        inbound_id: 'inbound-123',
        settings: {
          alterId: 0,
          level: 0,
        },
      };

      const result = createClientSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('TypeScript types', () => {
    it('should infer CreateInboundFormData type correctly', () => {
      const data: CreateInboundFormData = {
        instance_id: 'instance-123',
        protocol: 'vless',
        port: 8080,
        tag: 'tag1',
        settings: { foo: 'bar' },
      };

      expect(data).toBeDefined();
    });

    it('should infer CreateClientFormData type correctly', () => {
      const data: CreateClientFormData = {
        email: 'user@example.com',
        inbound_id: 'inbound-123',
        settings: { foo: 'bar' },
      };

      expect(data).toBeDefined();
    });
  });
});
