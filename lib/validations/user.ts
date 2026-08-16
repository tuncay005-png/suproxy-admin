import { z } from 'zod';

/**
 * Password validation regex:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Validation schema for user creation
 * Validates Requirements 1.9, 13.1
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user'], {
    message: 'Role must be either admin or user',
  }),
});

/**
 * Validation schema for user updates
 * All fields are optional for partial updates
 * Validates Requirements 1.9, 13.1
 */
export const updateUserSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').optional(),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
});

/**
 * TypeScript type inferred from createUserSchema
 */
export type CreateUserFormData = z.infer<typeof createUserSchema>;

/**
 * TypeScript type inferred from updateUserSchema
 */
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
