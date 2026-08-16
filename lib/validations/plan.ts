import { z } from 'zod';

/**
 * Currency code validation regex:
 * - Must be exactly 3 uppercase letters (e.g., USD, EUR, GBP)
 */
const currencyCodeRegex = /^[A-Z]{3}$/;

/**
 * Validation schema for plan creation
 * Validates Requirements 8.9, 13.1
 */
export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().min(1, 'Plan description is required'),
  price: z
    .number()
    .min(0, 'Price must be a non-negative number'),
  currency: z
    .string()
    .length(3, 'Currency must be exactly 3 characters')
    .regex(
      currencyCodeRegex,
      'Currency must be a 3-letter uppercase code (e.g., USD, EUR)'
    ),
  duration_days: z
    .number()
    .int('Duration must be an integer')
    .positive('Duration must be a positive integer'),
  data_limit_gb: z
    .number()
    .min(0, 'Data limit must be a non-negative number'),
  active: z.boolean(),
});

/**
 * TypeScript type inferred from createPlanSchema
 */
export type CreatePlanFormData = z.infer<typeof createPlanSchema>;
