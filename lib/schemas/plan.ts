import { z } from 'zod';

/**
 * Re-export Plan types from types for convenience
 */
export type { Plan, CreatePlanInput } from '@/types/plan';

/**
 * Validation schema for plan creation
 * Validates Requirements 8.9, 13.1
 */
export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z
    .string()
    .length(3, 'Currency must be 3 letters')
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase (e.g., USD, EUR)'),
  duration_days: z.number().int().positive('Duration must be a positive integer'),
  data_limit_gb: z.number().min(0, 'Data limit must be non-negative'),
  active: z.boolean(),
});

/**
 * TypeScript type inferred from createPlanSchema
 */
export type CreatePlanFormData = z.infer<typeof createPlanSchema>;
