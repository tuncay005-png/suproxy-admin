import { z } from 'zod';

/**
 * Alphanumeric with hyphens and underscores regex
 * Used for tag validation
 */
const tagRegex = /^[a-zA-Z0-9_-]+$/;

/**
 * Validation schema for Xray inbound creation
 * Validates Requirements 5.9, 6.1, 13.1
 * 
 * Fields:
 * - instance_id: Required string identifier for the Xray instance
 * - protocol: Must be one of the supported protocols (vless, vmess, trojan, shadowsocks)
 * - port: Must be integer between 1-65535
 * - tag: Must be alphanumeric with hyphens/underscores only
 * - settings: Optional protocol-specific configuration object
 */
export const createInboundSchema = z.object({
  instance_id: z.string().min(1, 'Instance ID is required'),
  protocol: z.enum(['vless', 'vmess', 'trojan', 'shadowsocks'], {
    message: 'Protocol must be one of: vless, vmess, trojan, shadowsocks',
  }),
  port: z
    .number({
      message: 'Port must be a number',
    })
    .int('Port must be an integer')
    .min(1, 'Port must be between 1 and 65535')
    .max(65535, 'Port must be between 1 and 65535'),
  tag: z
    .string()
    .min(1, 'Tag is required')
    .regex(tagRegex, 'Tag must contain only alphanumeric characters, hyphens, and underscores'),
  settings: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Validation schema for Xray client creation
 * Validates Requirements 5.9, 6.1, 13.1
 * 
 * Fields:
 * - email: Must be a valid email format
 * - inbound_id: Required string identifier for the associated inbound
 * - settings: Optional client-specific configuration object
 */
export const createClientSchema = z.object({
  email: z.string().email('Invalid email address'),
  inbound_id: z.string().min(1, 'Inbound ID is required'),
  settings: z.record(z.string(), z.unknown()).optional(),
});

/**
 * TypeScript type inferred from createInboundSchema
 */
export type CreateInboundFormData = z.infer<typeof createInboundSchema>;

/**
 * TypeScript type inferred from createClientSchema
 */
export type CreateClientFormData = z.infer<typeof createClientSchema>;
