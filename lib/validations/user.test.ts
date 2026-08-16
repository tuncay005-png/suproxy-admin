import { describe, it, expect } from 'vitest';
import { createUserSchema, updateUserSchema } from './user';

describe('User Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate a valid user creation payload', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        role: 'user' as const,
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user' as const,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user' as const,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user' as const,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject password without lowercase letter', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PASSWORD123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user' as const,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'PasswordOnly',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user' as const,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });

    it('should accept user without phone (optional field)', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user' as const,
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept admin role', () => {
      const validData = {
        email: 'admin@example.com',
        password: 'Password123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin' as const,
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'superuser',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate a valid update payload with all fields', () => {
      const validData = {
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+9876543210',
        email: 'jane@example.com',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates (only first_name)', () => {
      const validData = {
        first_name: 'Jane',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates (only email)', () => {
      const validData = {
        email: 'newemail@example.com',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (all fields optional)', () => {
      const validData = {};

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format when provided', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject first_name shorter than 2 characters when provided', () => {
      const invalidData = {
        first_name: 'A',
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });
  });
});
