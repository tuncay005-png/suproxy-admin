import { z } from 'zod';

/**
 * Validation schema for login credentials
 * Validates Requirements 8.2, 8.6
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * TypeScript type inferred from loginSchema
 */
export type LoginFormData = z.infer<typeof loginSchema>;
