import { z } from 'zod';

/**
 * Re-export Xray types from types for convenience
 */
export type {
  XrayInbound,
  XrayClient,
  CreateInboundInput,
  CreateClientInput,
} from '@/types/xray';

/**
 * Tag validation regex:
 * - Alphanumeric characters
 * - Hyphens and underscores allowed
 */
const tagRegex = /^[a-zA-Z0-9_-]+$/;

/**
 * Validation schema for Xray inbound creation
 * Validates Requirements 5.9, 6.1, 13.1
 */
export const createInboundSchema = z.object({
  instance_id: z.string().min(1, 'Instance ID is required'),
  protocol: z.enum(['vless', 'vmess', 'trojan', 'shadowsocks'], {
    message: 'Protocol must be one of: vless, vmess, trojan, shadowsocks',
  }),
  port: z
    .number()
    .int('Port must be an integer')
    .min(1, 'Port must be between 1 and 65535')
    .max(65535, 'Port must be between 1 and 65535'),
  tag: z
    .string()
    .min(1, 'Tag is required')
    .regex(tagRegex, 'Tag must contain only alphanumeric characters, hyphens, and underscores'),
  settings: z.record(z.string(), z.unknown()).default({}),
});

/**
 * Validation schema for Xray client creation
 * Validates Requirements 5.9, 6.1, 13.1
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
